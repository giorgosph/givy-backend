const generic = (res, data) => {
  res.status(data?.status || 500).send({ success: false, message: data?.message || "Server Error" });
};

module.exports = {
  generic
}