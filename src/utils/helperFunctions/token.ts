export const random = (length = 6) => {
  let token = "";

  for (let i = 0; i < length; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    token += randomDigit.toString();
  }

  return Number(token);
};
