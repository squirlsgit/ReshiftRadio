const axios = require('axios').default;
//const clockifyconfig = require('../environment/clockify-config.json');


exports.clock = axios.create({
  baseURL: 'https://api.clockify.me/api/v1/workspaces/5dc04c60b36ea8270fcebba2',
  headers: {
    'Content-Type': 'application/json'
  }
});

