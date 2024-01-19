const User = require("./User.model");
const UserActivity = require("./UserActivity.model");
const UserFeedback = require("./UserFeedback.model");

const Confirmation = require("./Confirmation.model");

const Draw = require("./Draw.model");
const DrawItem = require("./DrawItem.model");
const DrawAttenant = require("./DrawAttenant.model");

module.exports = {
  User,
  Draw,
  DrawItem,
  UserActivity,
  UserFeedback,
  DrawAttenant,
  Confirmation,
}