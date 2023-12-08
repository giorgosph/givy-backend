const userExists = (res, type) => {
  const message = `${type} is already registered!`;

  res.status(200).json({ success: false, body: {type: type}, message: message });
};

const userNotAuthenticated = (res) => {
  const message = `Wrong credentials!`;

  res.status(401).json({ success: false, message: message });
}

const sendToken = (res, data) => {
  const { user, token } = data;
  const message = `Logged in successfully`;

  res.status(201).json({ success: true, body: { user: user, token: `Bearer ${token}` }, message: message });
};

const noPrivilages = (res) => {
  const message = 'No Privilages';
  
  res.status(403).send({ success: false, message: message });
}

module.exports = {
  userExists,
  userNotAuthenticated,
  sendToken,
  noPrivilages,
}