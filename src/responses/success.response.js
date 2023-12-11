/* ------------- General ------------- */

const success = (res, data) => {
  const message = "Success!";

  res.status(200).json({ success: true, body: data?.body, message: data?.message || message });
};

const noData = (res) => {
  res.status(204).json({});
};

/* --------------- Auth --------------- */

const sendToken = (res, token, data) => {
  const message = `Logged in successfully`;
  const token = `Bearer ${token}`;

  res.status(data?.status || 201).json({ success: true, token, body: data?.body, message });
};

module.exports = {
  success,
  noData,
  sendToken,
};