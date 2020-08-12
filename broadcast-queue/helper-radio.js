import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
import { Guild } from '../guild';

const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const admin = require('firebase-admin');
const Bot = require('../reshift.js').default;

export class Radio {
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

  randomBroadcast = false;
  limitBroadcastsPerHost = 1;
  hosts = new Discord.Collection();

  video_filters = new Discord.Collection();

  only_music = true;
  maximum_video_length = 600;

  /**
   * 
   * 
   * @param {Guild} guild
   */
  constructor(guild) {
    this.guild = guild;
  }


  /**
   * 
   * Removes channel from playable list. All channels are playable to by default. Stops guild radio.
   * @param {Channel} channel
   * @returns {Promise<void>}
   */
  blackout(channel) {
    if (channel.type !== 'voice') return;
    return admin.firestore().collection(`${this.collection}`).doc(channel.id).set({
      guildId: this.guild.id
    }, { merge: true });
  }

  /**
   *
   * Adds channel to playable list. All channels are playable to by default. Stops guild radio.
   * @param {Channel} channel
   * @returns {Promise<void>}
   */
  whiteout(channel) {
    if (channel.type !== "voice") return;
    return admin.firestore().collection(`${this.collection}`).doc(channel.id).delete();
  }
  /**
   * @returns {Promise<Array<string>>} A list of channel ids that are NOT to be played on.
   * */
  fetchBlackouts() {
    return admin.firestore().collection(`${this.collection}`).where('guildId', '==', this.guild.id).get().then(blackoutrefs => {
      return blackoutrefs.docs.map(blackoutref =>  blackoutref.id );
    }).catch(err => []);
  }
  
  /**
   * Starts a Radio Broadcast on channels. If no channels given, broadcast will still play.
   * @param {GuildMember} member
   * @param {Array<VoiceChannel>} channels
   * @returns {string} message
   */
  async broadcast(member, ...channels) {
    if (!this.hosts.has(member.id)) return;
    const deny = await this.fetchBlackouts();

    channels.forEach(channel => this.addRadioFrequency(channel, deny))
    if (this.station) this.station.end();

    this.station = new Bot.Client.voice.createBroadcast();

    if(queue.size > 0) this.startBroadcast();

    return this.station;


    //this.station.on("end", () => {
    //  console.log("Station Stopped")
    //});
    //this.station.on("subscribe", (stream) => console.log("Channel Added", stream.player.voiceConnection.channel.name));
    //this.station.on("end", () => )

  }

  repeatsEnabled = true;

  //private
  startBroadcast() {

    const entry = this.queue.first();
    const queueAt = this.queue.firstKey();
    if (entry && this.station) {
      if (repeatsEnabled) {

        this.broadcastNext(entry).then(_v => {

          this.queue.delete(queueAt);

          // Play next song
          this.startBroadcast();

        }, e => {
            if (e) {

              this.queue.delete(queueAt);
              this.startBroadcast();
              console.error(e)

            }
        });


      } else {

        entry.stream().then(_v => {

          this.queue.delete(queueAt);

          // Play next song
          this.startBroadcast();

        }, e => {
          this.queue.delete(queueAt);
          this.startBroadcast();
          console.error(e)

        });
      }
      
    } else if (this.station) {
      // a new song in queue does not exist. End broadcast.
      this.endBroadcast("bypass");

    }
  }

  /**
   * 
   * @param {GuildMember | string} member
   */
  endBroadcast(member) {
    if (((typeof member === 'string' && member === 'bypass') || this.hosts.has(member.id)) && this.station) {
      this.station.end();
      this.station = null;
    }
  }

  pauseBroadcast(member) {
    if (this.hosts.has(member.id) && this.broadcaster) {
      this.broadcaster.pause();
    }
  }
  resumeBroadcast(member) {
    if (this.hosts.has(member.id) && this.broadcaster) {
      this.broadcaster.resume();
    }
  }
  setBroadcastVolume(member,volume) {

    if (this.hosts.has(member.id) && this.broadcaster) {
      this.broadcaster.setVolume(volume);
    }
  }
  skipSong(member) {
    if (this.hosts.has(member.id) && this.broadcaster) {
      if (this.queue.first && this.station) {
        
        this.broadcaster.destroy(new Error("Skipping Song"));

      }
      
    }
  }




  /**
   * 
   * @param {VoiceChannel} channel
   * @param {string[]} deny
   */
  addRadioFrequency(channel, deny) {
    if (this.channels.has(channel.id)) return;
    if (!deny) let deny = await this.fetchBlackouts();
    if (deny.includes(channel.id)) return;
    
    channel.join().then(connection => {
      const streamDispatch = connection.play(this.station);
      this.channels.set(channel.id, streamDispatch);
    }).catch(err => null);

  }
/**
 *
 * @param {VoiceChannel} channel
 */
  removeRadioFrequency(channel) {
    if (!this.channels.has(channel.id)) return;

    /**
     * @type {StreamDispatcher}
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
   * @param {{volume: number, repeat: number}} options
   */
  queueYoutubeBroadcast(member, youtube_link, options) {
    if (this.queue.size >= this.limit_queue_size) return;
    if (this.hosts.has(member.id) || !this.limitBroadcastsPerHost || !this.queue.filter(( player, _queuedAt) => player.member.id === member.id).size < this.limitBroadcastsPerHost ) ) {
      // Set song
      this.queue.set(Date.now(), {
        member: member,
        song: youtube_link,
        stream: this.broadcastFactory('youtube', youtube_link),
        ...options
      });

      if (this.station && this.queue.size === 1) {
        this.startBroadcast();
      }

    }
  }

  /**
   * Wrapper that repeats song if a repeat number is given and member is a radio host.
   * @param {{stream: (options: any) => Promise<void>, volume: number, member: GuildMember, repeat: number }} q
   * @returns {Promise<any>}
   */
  broadcastNext(q) {
    return q.stream({ volume: q.volume, repeat: q.repeat }).then(async _v => {
      // Played song.
      if (q.repeat > 0 && this.hosts.has(q.member.id)) {
        q.repeat = q.repeat - 1;
        await this.broadcastNext(q);
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
      
      new Promise((res, rej) => {
        if (!this.station) {
          rej("Station Unavailable");
          return;
        }

        if (type === 'youtube') {
          if (this.shouldSkipYoutubeVideo(resource)) rej(new Error("Skipping this video; Check logs for info."));

          const stream = ytdl(resource, { filter: "audioonly" });
          // Broadcast

          this.broadcaster = this.station.play(stream, {volume: options.volume || 1});
          // Listen for end or error, and resolve / reject

          // Error can happen for any number of reasons. Including if the broadcaster was destroyed. Should bubble up to master player.
          this.broadcaster.addListener("error", (err) => {
            rej(err);
          });

          // On finish, play next song if any
          this.broadcaster.on("finish", () => {
            res(true);
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

  officiateHost(member) {
    this.hosts.set(member.id, member);
  }

  removeHost(member) {
    if(this.hosts.has(member.id)) this.hosts.delete(member.id);
  }

  
  /**
   * Returns true if we should skip video. False if we should not.
   * @param {string} url youtube video url
   */
  async shouldSkipYoutubeVideo(url) {
    let info = await ytdl.getBasicInfo(url);

    if (!info) return true;

    if (this.only_music && info.media.category !== 'Music') {
      console.log("Invalid category: Category is not music", info.media.category);
      return true;
    }
    if (this.maximum_video_length < info.length_seconds) {
      console.log("video too long");
      return true;
    }

    return this.video_filters.size === 0 || this.video_filters.filter((filter) => {
      if (Object.keys(filter).filter(param => filter[param] === info.author[param] || filter[param] === info.media[param]).length > 0) {
        console.log("Detected an issue with video", Object.values(filter), info.media, info.author );
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
    if (!this.hosts.has(member.id)) return;
    this.addVideoFilter(`${member.displayName}-${channel_url}`, {channel_url: channel_url})
  }
  addArtistFiter(member, artist) {
    if (!this.hosts.has(member.id)) return;
    this.addVideoFilter(`${member.displayName}-${artist}`, { artist: artist });
  }
  addArtistUrlFiter(member, artist_url) {
    if (!this.hosts.has(member.id)) return;
    this.addVideoFilter(`${member.displayName}-${artist_url}`, { artist_url: artist_url });
  }
  addCategoryFiter(member, category) {
    if (!this.hosts.has(member.id)) return;
    this.addVideoFilter(`${member.displayName}-${category}`, { category: category });
  }
  addArtistFiter(member, song) {
    if (!this.hosts.has(member.id)) return;
    this.addVideoFilter(`${member.displayName}-${song}`, { song: song });
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
  addRadioHosts(author, author_member, ...members) {
    if (author_member.guild.roles.cache.find((role) => role.name === 'dev').comparePositionTo(author_member.roles.highest) >= 0 || author.id === '149368319735103490') {
      members.forEach(member => this.hosts.set(member.id, member));
    }
    
  }
/**
 *
 * @param {User} user
 * @param {GuildMember} member
 */
  removeRadioHost(user, member) {

  }

  addRadioFilter() {

  }

  removeRadioFilter() {

  }


  /**
   * Plays on channel if Channel is not in Broadcast List.
   * @param {User} user
   * @param {Channel} channel
   */
  play(user,channel) {
    
    //if(channel === 'dm' || channel)
  }
  /**
   * 
   * @param {User} user
   * @param {any} channel
   */
  stop(user, channel) {

  }

}

const radio = new Radio();
export default radio;