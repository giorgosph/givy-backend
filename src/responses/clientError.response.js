/* --------------- Auth --------------- */

const userExists = (res, type) => {
  const message = `${type} is already registered!`;

  res.status(409).json({ success: false, body: { type }, message });
};

const userNotAuthenticated = (res, data) => {
  const message = `Wrong credentials!`;

  res.status(401).json({ success: false, body: data?.body , message });
};

const noPrivilages = (res) => {
  const message = 'No Privilages';
  
  res.status(403).send({ success: false, message });
};

/* --------------- Data related --------------- */

const invalidData = (res) => {
 const message = 'Invalid data';

 res.status(422).send({ success: false, message });
}

const conflictedData = (res) => {
  const message = 'Data conflict';
 
  res.status(409).send({ success: false, message });
 }

module.exports = {
  userExists,
  invalidData,
  noPrivilages,
  conflictedData,
  userNotAuthenticated,
};