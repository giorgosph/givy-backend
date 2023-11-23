const UserActivity = require("../models/index").UserActivity;

/* ---------------------- Get Activity --------------------------- */
/* --------------------------------------------------------------- */

// change if needed or delete
const getActivity = async (username, type, client) => {
  const activity = await UserActivity.findUserWithType({ username, type }, client);
  if(!activity) return false;
  return activity;
};


module.exports = {
  getActivity,
};