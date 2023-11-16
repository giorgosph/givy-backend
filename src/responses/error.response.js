const generic = (res, status, message) => {
  res.status(status || 500).send({ success: false, message: message || "Server Error" });
};

module.exports = {
  generic
}