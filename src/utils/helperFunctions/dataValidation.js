/* ------------------------- Regex ------------------------- */
/* --------------------------------------------------------- */

const usernameRegex = /^[A-Za-z0-9.]+$/;

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const generalRegex = /[\'\";<>`&|\\/%\.\x00]/;

/* --------------------- Variable Validation --------------------- */
/* --------------------------------------------------------------- */

const validateUsername = (username) => {
  if(!username || username < 3 || username > 15) return false;
  if(!usernameRegex.test(username)) return false;
  return true;
};

const validateEmail = (email) => {
  if(!email || !emailRegex.test(email)) return false;
  return true;
};

/* ---------------------- Custom Validators ---------------------- */
/* --------------------------------------------------------------- */

const generalValidator = (data) => {
  if(generalRegex.test(data)) throw new Error("General Validator Failed:\n", "Invalid data ->", data);
};

const emailValidator = (email) => {
  if(!validateEmail(email)) throw new Error("Email Validator Failed:\n", "Invalid email address ->", email);
};

const usernameValidator = (username) => {
  if(!validateUsername(username)) throw new Error("Username Validator Failed:\n", "Invalid username ->", username);
};

/* ------------------ Auth ------------------ */

const registerValidator = (formData) => {
  const { password, confirmPassword, username, email } = formData;
  const errorMessage = "Register Validator Failed:\n";

  if(password !== confirmPassword) throw new Error(errorMessage, "Passwords do not match ->", password);
  if(!validateUsername(username)) throw new Error(errorMessage, `Invalid username -> ${username}`);
  if(!validateEmail(email)) throw new Error(errorMessage, "Invalid email address ->", email);

  Object.entries(formData).forEach(([key, value]) => {
    if (['password', 'confirmPassword', 'username', 'email'].includes(key)) return;
    if(generalValidator(value)) throw new Error(errorMessage+ "Malicious data provided ->"+ value);
  });
};

const loginValidator = (username, password) => {
  const errorMessage = "LogIn Validator Failed:\n";

  if(!username || (!validateUsername(username) && !validateEmail(username))) {
    throw new Error(errorMessage, "Invalid username/email ->", username); 
  }
  if(!password || generalRegex.test(password)) {
    throw new Error(errorMessage, "Invalid password ->", password);
  }
};

const confirmAccountValidator = (username, type) => {
  const errorMessage = "Confirm Account Validator Failed:\n";

  if(!validateUsername(username)) throw new Error(errorMessage, "Invalid username ->", username);
  if(generalRegex.test(type)) throw new Error(errorMessage, "Invalid type ->", type);
}

/* ------------------ User ------------------ */

const shippingDetailsValidator = (username, formData) => {
  const errorMessage = "Shipping Details Validator Failed:\n";

  if(!validateUsername(username)) throw new Error(errorMessage, "Invalid username ->", username);
  
  Object.entries(formData).forEach(([key, value]) => {
    if (key == 'email') return;
    if(generalValidator(value)) throw new Error(errorMessage+ "Malicious data provided ->"+ value);
  });
};

module.exports = {
  loginValidator,
  emailValidator,
  generalValidator,
  registerValidator,
  usernameValidator,
  confirmAccountValidator,
  shippingDetailsValidator,
}