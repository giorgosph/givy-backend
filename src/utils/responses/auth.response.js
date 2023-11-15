const userExists = (res, type) => {
  const message = `${type} cannot be registered`;
  res.status(200).json({ success: false, body: {type: type}, message: message });
};

const userNotAuthenticated = (res) => {
  const message = `Wrong username or password`;
  res.status(401).json({ success: false, message: message });
}

const sendToken = (res, token) => {
  console.log(`Sending token ${token}`);
  const message = `User logged in successfully`;
  res.status(201).json({ success: true, body: { token: `Bearer ${token}` }, message: message });
};

module.exports = {
  userExists,
  userNotAuthenticated,
  sendToken,
}