const auth = require('./auth.controller');
const users = require('./users.controller');
const activity = require('./userActivity.controller');
const drawAttenant = require('./drawAttenant.controller');

module.exports = {
  auth,
  users,
  activity,
  drawAttenant,
}