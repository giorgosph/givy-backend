const auth = require("./auth.response");
const error = require("./error.response");

const success = (res, data) => {
  const message = "Success!";
  res.status(200).json({ success: true, body: data?.body || null, message: data?.message || message });
}

const noData = (res, data) => {
  const message = "No data found!";
  res.status(204).json({ success: true, message: data?.message || message });
}

module.exports = {
  auth,
  error,
  success,
  noData,
}