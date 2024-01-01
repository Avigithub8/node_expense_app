const { apiKey } = require('./apiKeys'); 
const sendinblue = require('sendinblue-api');

const sendinblueClient = new sendinblue({ apiKey });

module.exports = sendinblueClient;