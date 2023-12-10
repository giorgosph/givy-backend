const userExists = (res, type) => {
  const message = `${type} is already registered!`;

  res.status(200).json({ success: false, body: { type }, message });
};

const userNotAuthenticated = (res) => {
  const message = `Wrong credentials!`;

  res.status(401).json({ success: false, message });
}

const sendToken = (res, data) => {
  const message = `Logged in successfully`;

  res.status(data?.status || 201).json({ success: true, body: data.body, message: data?.message || message });
};

const noPrivilages = (res) => {
  const message = 'No Privilages';
  
  res.status(403).send({ success: false, message });
}

module.exports = {
  userExists,
  userNotAuthenticated,
  sendToken,
  noPrivilages,
}