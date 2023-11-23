const auth = require('./auth.controller');
const users = require('./users.controller');
const activity = require('./userActivity.controller');

module.exports = {
  auth,
  users,
  activity,
}