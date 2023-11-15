const bcrypt = require("bcrypt");

const encrypt = async (password) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (err) {
    throw new Error("Error while hashing password:\n" + err)
  }
};

const compareKeys = async (pass1, pass2) => {
  try {
    const authed = await bcrypt.compare(pass1, pass2);
    return authed;
  } catch (err) {
    throw new Error("Error while comparing passwords:\n" + err)
  }
};


module.exports = {
  encrypt,
  compareKeys,
};
