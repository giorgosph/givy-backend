/* --------------- Auth --------------- */

const userExists = (res, type) => {
  const message = `${type} is already registered!`;

  res.status(409).json({ success: false, message });
};

const userNotAuthenticated = (res) => {
  const message = `Wrong credentials!`;

  res.status(401).json({ success: false, message });
};

const noPrivilages = (res) => {
  const message = 'No Privilages';
  
  res.status(403).send({ success: false, message });
};

/* --------------- Data related --------------- */

const invalidData = (res) => {
 const message = 'Invalid data';

 res.status(422).send({ success: false, message });
};

const conflictedData = (res) => {
  const message = 'Data conflict';
 
  res.status(409).send({ success: false, message });
};

 /* --------------- Token related --------------- */

const refreshToken = (res) => {
  const message = 'Invalid Token';
 
  res.status(491).send({ success: false, message });
};

module.exports = {
  userExists,
  invalidData,
  noPrivilages,
  refreshToken,
  conflictedData,
  userNotAuthenticated,
};