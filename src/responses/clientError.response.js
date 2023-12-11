/* --------------- Auth --------------- */

const userExists = (res, type) => {
  const message = `${type} is already registered!`;

  res.status(409).json({ success: false, body: { type }, message });
};

const userNotAuthenticated = (res) => {
  const message = `Wrong credentials!`;

  res.status(401).json({ success: false, message });
};

const noPrivilages = (res) => {
  const message = 'No Privilages';
  
  res.status(403).send({ success: false, message });
};

module.exports = {
  userExists,
  noPrivilages,
  userNotAuthenticated,
};