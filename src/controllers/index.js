const auth = require('./auth.controller');
const users = require('./users.controller');
const activity = require('./userActivity.controller');
const notification = require('./notification.controller');

const draw = require('./draw.controller');
const drawAttenant = require('./drawAttenant.controller');

module.exports = {
  auth,
  users,
  activity,
  notification,
  draw,
  drawAttenant,
}