const randomNumbers = (length = 6) => {
  let token = '';

  for (let i = 0; i < length; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    token += randomDigit.toString();
  }

  return token;
};

module.exports = randomNumbers;