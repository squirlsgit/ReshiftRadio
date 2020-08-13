const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const Guild = require('../guild.js');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const admin = require('firebase-admin');
const Bot = require('../reshift.js').default;

class Radio {
  /**
   * @type {Guild}
   */
  guild

  /**
   * @type {StreamDispatcher}
   */
  player


  /**
   * @type {VoiceBroadcast}
   */
  station
  /**
   * @type {BroadcastDispatcher}
   */
  broadcaster

  
  channels = new Discord.Collection()
  collection = 'blackouts';

  /**
   * @type {Collection<number, {stream: (options: any) => Promise<void>, volume: number, member: GuildMember, repeat: number, song: string }>}
   */
  queue = new Discord.Collection()

  limit_queue_size = 100;
  loops_enabled = true;
  randomBroadcast = false;
  limitBroadcastsPerHost = 1;

  hosts = new Discord.Collection();

  video_filters = new Discord.Collection();

  _default_volume = 0.5;
  get default_volume() {
    if (this.guild && this.guild.settings) {
      return typeof this.guild.settings.volume !== 'undefined' ? this.guild.settings.volume : this._default_volume;

    } else return this._default_volume;
  }
  
  _maximum_video_length = 600;
  get maximum_video_length() {
    if (this.guild && this.guild.settings) {
      return typeof this.guild.settings.video_length !== 'undefined' ? this.guild.settings.video_length : this._maximum_video_length;
    } else return this._maximum_video_length;
  }
  autoplay = true;

  _broadcastable_tags = ['Radio'];
  get broadcastable_tags() {
    if (this.guild && this.guild.settings)
      return this.guild.settings.broadcastable_on || this._broadcastable_tags;
    else return this._broadcastable_tags;
  }
  
  /**
   * @type {GuildMember}
   */
  stalk;

  /**
   * @type {GuildMember}
   */
  avoid;

  /**
   * @type {VoiceConnection}
   */
  currentConnection;

  /**
   * 
   * @param {Guild} guild
   */
  constructor(guild) {
    this.guild = guild;
    this.guild.logger.info(this.broadcastable_tags, this.guild.settings);
    // Track voice channel changes.
    Bot.Client.on('voiceStateUpdate', async (oldv, newv) => {
      // If a user moves to a channel.
      if ((!oldv.channel && newv.channel) || (newv.channel && oldv.channel.id !== newv.channel.id)) {
        if (this.stalk && newv.member.id === this.stalk.id) {
          await this.addRadioFrequency(newv.channel);
        }
        if (this.avoid && this.avoid.id === newv.member.id && this.currentConnection && this.currentConnection.channel.id === newv.channel.id) {
          // Connect to a previous channel if we can. Otherwise just disconnect.
          this.currentConnection.disconnect();
          const newchannel = this.channels.find(channel => channel.id !== newv.channel.id);
          if (newchannel) await this.addRadioFrequency(newchannel);

        }

      }
    });
  }

  

  async saveGuildSettings() {
    return this.guild.saveSettings({
      video_length: this.maximum_video_length,
      broadcastable_on: this.broadcastable_tags,
      volume: this.default_volume
    });
  }


  /**
   * 
   * Removes channel from playable list. 
   * @param {Channel} channel
   * @returns {Promise<void>}
   */
  blacklist(channel) {
    if (channel.type !== 'voice') return;
    return this.guild.removeBroadcastableTag(channel.name);
  }
  /**
   * @returns {Promise<Array<string>>} A list of channel ids that are NOT to be played on. EVER. Needs to be manually updated.
   * */
  fetchBlackouts() {
    return admin.firestore().collection(`${this.collection}`).where('guildId', '==', this.guild.id).get().then(blackoutrefs => {
      return blackoutrefs.docs.map(blackoutref => blackoutref.id);
    }).catch(err => []);
  }

  /**
   *
   * Adds tag to playable list. 
   * @param {Channel} channel
   * @returns {Promise<void>}
   */
  whitelist(channel) {
    if (channel.type !== "voice") return;
    return this.guild.addBroadcastableTag(channel.name);
  }
  
  /**
   * Starts a Radio Broadcast on channels. If Station exists, adds channels, but nothing more. To start a broadcast, add a song to the playlist.
   * @param {GuildMember} member
   * @param {Array<VoiceChannel>} channels
   * @returns {Promise<VoiceBroadcast>} message
   */
  async openRadioStation(member, ...channels) {

    if (!this.isRadioAdmin(member)) {
      this.guild.logger.info(member.id, member.displayName);
      this.guild.logger.info(this.hosts.keyArray());
      return;
    }
    const deny = await this.fetchBlackouts();
    channels.forEach(channel => this.addRadioFrequency(channel, deny))
    if (this.station) return;

    this.station = Bot.Client.voice.createBroadcast();
    
    return this.station;

  }

  closeRadioStation(member) {
    if (!this.isRadioSuperAdmin(member)) return;
    this.hosts.clear();
    this.queue.clear();
    this.video_filters.clear();
    this.channels.clear();
    this.station.end();
  }


  //private
  async playNext() {

    if (this.queue.size === 0) {
      this.guild.logger.warn("No songs in queue. Ceasing playback");
      if (this.broadcaster) this.broadcaster.destroy("out of songs");
      return;
    }
    if (!this.station) {
      this.guild.logger.warn("No station to play song.");
      return;
    }

    const song = this.queue.first();
    const qAt = this.queue.firstKey();

    this.currentSong = song;

    if (this.loops_enabled) {
      this.guild.logger.info("Broadcasting.." + song.song);
      
      return this.playSong(song).then(_v => {

        this.guild.logger.info("shifting q", qAt);
        this.currentSong = null;
        this.queue.delete(qAt);
          
        // Play next song
        if(this.queue.size > 0 && this.autoplay) return this.playNext();

      }, e => {
          if (e) {
            console.error("skipping song;", e)
            this.currentSong = null;
            this.queue.delete(qAt);
            this.playNext();

          }
      });


    } else {
      this.currentSong = song;
      return song.stream().then(_v => {
        this.currentSong = null;
        this.queue.delete(qAt);

        // Play next song
        return this.playNext();

      }, e => {
        this.currentSong = null;
        this.queue.delete(qAt);
        this.playNext();
        console.error(e)
        return e;
      });
    } 
  }

  async playBroadcast(member) {
    if (!this.isRadioAdmin(member)) return;
    if (this.broadcaster) {
      this.broadcaster.destroy(new Error("Restarting Broadcast"));
    }
    console.log("about to play");
    return this.playNext();
  }

  pauseBroadcast(member) {
    if (this.isRadioAdmin(member) && this.broadcaster) {
      this.broadcaster.pause();
    }
  }
  resumeBroadcast(member) {
    if (this.isRadioAdmin(member) && this.broadcaster) {
      this.broadcaster.resume();
    }
  }
  setBroadcastVolume(member,volume) {

    if (this.isRadioAdmin(member) && this.broadcaster) {
      this.broadcaster.setVolume(volume);
    }
  }
  skipSong(member) {
    if (this.isRadioAdmin(member) && this.broadcaster) {
      if (this.queue.first() && this.station) {
        
        this.broadcaster.destroy();

        this.queue.delete(this.queue.firstKey());
        this.playNext();
      }
      
    }
  }




  /**
   * 
   * @param {VoiceChannel} channel
   * @param {string[]} deny
   */
  async addRadioFrequency(channel, deny) {
    if (!this.station) {
      this.guild.logger.warn('Station unlisted. Channel could not subscribe to station.', channel.name);
      return;
    }

    if (!deny) deny = await this.fetchBlackouts();
    if (deny.includes(channel.id)) {
      this.guild.logger.warn("Could not join channel. It is blacklisted. If this is a mistake check with a developer.", channel.name, channel.id);
      return;
    }
    this.guild.logger.info(this.broadcastable_tags);
    if (!this.broadcastable_tags.find(tag => channel.name.toLowerCase().endsWith(tag.toLowerCase()))) {
      this.guild.logger.warn(`Please whitelist the channel before trying to connect. Run <!reshift-broadcast boost ${channel.name}>`);
      return;
    }
    
    return channel.join().then(connection => {
      const streamDispatch = connection.play(this.station);
      this.guild.logger.info("Setting channel id", channel.id);
      return this.channels.set(channel.id, streamDispatch);
    }).catch(err => {
      this.guild.logger.warn(err);
      return err;
    });

  }
/**
 *
 * @param {VoiceChannel} channel
 */
  removeRadioFrequency(channel) {
    if (!this.channels.has(channel.id)) {
      this.guild.logger.info("no channel id", channel.id, channel.name);
      return;
    }

    if (this.currentConnection && this.currentConnection.channel.id === channel.id) this.currentConnection.disconnect();
    /**
     * @type {connection: VoiceConnection, ...StreamDispatcher} 
     * */
    const stream = this.channels.get(channel.id);
    // Unsubscribes channel
    stream.destroy();
    this.channels.delete(channel.id);
  }

  /**
   * Adds song. Starts broadcast if first song in list.
   * @param {GuildMember} member
   * @param {string} youtube_link
   *
   * @param {{playlist: boolean, volume: number, repeat: number}} options
   */
  enqueueYoutubeSong(member, youtube_link, options) {
    if (this.queue.size >= this.limit_queue_size) return;

    if (this.isRadioSuperAdmin(member)) {
      this.queue.set(`${ this.queue.size + 1 }`, {
        member: member,
        song: youtube_link,
        stream: this.broadcastFactory('youtube', youtube_link),
        ...options
      });

    } else if (!this.limitBroadcastsPerHost || !this.queue.filter((player, _queuedAt) => player.member.id === member.id).size < this.limitBroadcastsPerHost) {
      if (this.isRadioAdmin(member)) {
        // Set song
        this.queue.set(Date.now(), {
          member: member,
          song: youtube_link,
          stream: this.broadcastFactory('youtube', youtube_link),
          ...options
        });

      }
    }
    
  }
  enqueuYoutubePlaylist(member, yt_playlist_link, options) {
    return new Promise((res, rej) => {
      ytpl(yt_playlist_link, (err, list) => {
        if (err) {
          rej(err);
          return;
        }
        this.guild.logger.info("enq playlist " + list.items.length + " " + this.limit_queue_size);
        list.items.slice(0, this.limit_queue_size).forEach(ytl => {
          this.enqueueYoutubeSong(member, ytl.url, options);
        });
       
        res(this.queue);
      })
    }).then(_v => {
      // Restart broadcast
      this.guild.logger.info(this.queue.size);
    });
    
  }

  /**
   * Wrapper that repeats song if a repeat number is given and member is a radio host.
   * @param {{stream: (options: any) => Promise<void>, volume: number, member: GuildMember, repeat: number }} q
   * @returns {Promise<any>}
   */
  playSong(q) {
    this.guild.logger.info(q, q.stream);
    return q.stream({ volume: q.volume, repeat: q.repeat }).then(async _v => {
      // Played song.
      if (this.loops_enabled && q.repeat > 0 && this.isRadioAdmin(q.member)) {
        q.repeat = q.repeat - 1;
        await this.playSong(q);
        return true;
      } else {
        return true;
      }

    }).catch(err => err);
  }


  // Note may want to expand this kind of functionality into subclasses for youtube etc if there's demand.
  /**
   * 
   * @param {any} type
   * @param {any} resource
   * @returns {(options: any) => Promise<void>}
   */
  broadcastFactory(type, resource) {
    return (options) => {
      
      return new Promise( (res, rej) => {
        
        if (type === 'youtube') {
          this.shouldSkipYoutubeVideo(resource).then(skip => {
            if (skip) {
              this.guild.logger.info("skipping youtube video", resource);
              rej(new Error("Skipping this video; Check logs for info."));
              return;
            }

            try {
              this.guild.logger.info("Playing " + resource);

              const stream = ytdl(resource, { filter: "audioonly" });
              // Broadcast

              this.broadcaster = this.station.play(stream, { volume: this.default_volume });
              // Listen for end or error, and resolve / reject

              // Error can happen for any number of reasons. Including if the broadcaster was destroyed. Should bubble up to master player.
              this.broadcaster.addListener("error", (err) => {
                this.guild.logger.error("Song err", err);
                rej(err);
              });

              // On finish, play next song if any
              this.broadcaster.on("finish", () => {
                this.guild.logger.info("Song finished");
                res(true);
              });

            } catch (e) {
              this.guild.logger.error("err", e);
              rej(e);
            }
            
          }).catch(e => {
            this.guild.logger.info("skipping video", e);
            //skip
            rej(e);
          });

        }
      });
    }
  }

  /**
   * 
   * 
   * @param {number} limit
   */
  addBroadcastLimit(limit) {
    if (limit < 0) limit = 0;
    this.limitBroadcastsPerHost = limit;
  }

  /**
   * 
   * Official hosts for server -- more permanent. has more access rights.
   * @param {Discord.GuildMember} member
   */
  isRadioAdmin(member) {
    return this.guild.isHost(member) || member.hasPermission("ADMINISTRATOR") || this.hosts.has(member.id);
  }
  isRadioSuperAdmin(member) {
    return this.guild.isHost(member) || member.hasPermission("ADMINISTRATOR");
  }
  addRadioAdmin(auth_member, member) {
    if (this.isRadioSuperAdmin(auth_member)) return this.guild.addHost(member.id);
  }
  removeRadioAdmin(member) {
    if (this.isRadioSuperAdmin(auth_member)) return this.guild.removeHost(member.id);
  }



  // local hosts
  officiate(auth_member, member) {
    if(this.isRadioAdmin(auth_member)) return this.hosts.set(member.id, member);
  }

  deplatform(auth_member, member) {
    if (this.isRadioAdmin(auth_member)) return this.hosts.delete(member.id);
  }

  
  /**
   * Returns true if we should skip video. False if we should not.
   * @param {string} url youtube video url
   */
  async shouldSkipYoutubeVideo(url) {
    let info = await ytdl.getBasicInfo(url);

    if (!info) {
      this.guild.logger.info("didnt find video", url);
      return true;
    }
    this.guild.logger.info(info);

    
    if (this.maximum_video_length < info.videoDetails.lengthSeconds) {
      this.guild.logger.info("video too long");
      return true;
    }

    return this.video_filters.size !== 0 && this.video_filters.filter((filter) => {
      if (Object.keys(filter).filter(param => filter[param] === info.author[param] || filter[param] === info.media[param]).length > 0) {
        this.guild.logger.info("Detected an issue with video", Object.values(filter), info.media, info.author );
        return true;
      } else return false;
    }).size > 0;
  }

  /**
   * 
   * 
   * @param {GuildMember} member
   * @param {string} channel_url
   */
  addChannelFilter(member, channel_url) {
    if (!this.isRadioAdmin(member)) return;
    this.addVideoFilter(`${member.displayName}-${channel_url}`, {channel_url: channel_url})
  }
  
  //private
  addVideoFilter(key, filter) {
    this.video_filters.set(key, filter);
  }
  //private
  removeVideoFilter(key) {
    this.video_filters.delete(key);
  }

  /**
   * 
   * @param {User} author
   * @param {GuildMember} member
   * @param {...GuildMember} members
   */
  async addRadioHosts(author_member, set_as_admin, ...members) {
    if (this.isRadioAdmin(author_member)) {

      if (set_as_admin) {
        return Promise.all(members.map(member => this.addRadioAdmin(member)));
      } else {
        members.forEach(member => {
          if (set_as_admin) {
            this.addRadioAdmin(member);
          } this.hosts.set(member.id, member);
        });
      }
    }
    
  }


}

const radio = new Radio(new Guild('741758819780001854'));
module.exports = radio;