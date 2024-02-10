/* ------------------------- Regex ------------------------- */
/* --------------------------------------------------------- */

import { RegisterForm, ShippingDetails } from "../types/objectTypes";
import { IReqRegister } from "../types/requestTypes";

const usernameRegex = /^[A-Za-z0-9.$]+$/;

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const generalRegex = /[\'\";<>`&|\\/%\.\x00]/;

/* --------------------- Variable Validation --------------------- */
/* --------------------------------------------------------------- */

const validateUsername = (username: string) => {
  if (!username || username.length < 3 || username.length > 15) return false;
  if (!usernameRegex.test(username)) return false;
  return true;
};

const validateEmail = (email: string) => {
  if (!email || !emailRegex.test(email)) return false;
  return true;
};

/* ---------------------- Custom Validators ---------------------- */
/* --------------------------------------------------------------- */

const generalValidator = (data: string | number) => {
  if (generalRegex.test(String(data)))
    throw new Error("General Validator Failed:\n" + "Invalid data ->" + data);
};

const emailValidator = (email: string) => {
  if (!validateEmail(email))
    throw new Error(
      "Email Validator Failed:\n" + "Invalid email address ->" + email
    );
};

const usernameValidator = (username: string) => {
  if (!validateUsername(username))
    throw new Error(
      "Username Validator Failed:\n" + "Invalid username ->" + username
    );
};

/* ------------------ Auth ------------------ */

const registerValidator = (formData: RegisterForm) => {
  const { password, confirmPassword, username, email } = formData;
  const errorMessage = "Register Validator Failed:\n";

  if (password !== confirmPassword)
    throw new Error(errorMessage + "Passwords do not match ->" + password);
  if (!validateUsername(username))
    throw new Error(errorMessage + `Invalid username -> ${username}`);
  if (!validateEmail(email))
    throw new Error(errorMessage + "Invalid email address ->" + email);

  Object.entries(formData).forEach(([key, value]) => {
    if (["password", "confirmPassword", "username", "email"].includes(key))
      return;
    generalValidator(value);
  });
};

const loginValidator = (username: string, password: string) => {
  const errorMessage = "LogIn Validator Failed:\n";

  if (!username || (!validateUsername(username) && !validateEmail(username))) {
    throw new Error(errorMessage + "Invalid username/email ->" + username);
  }
  if (!password || generalRegex.test(password)) {
    throw new Error(errorMessage + "Invalid password ->" + password);
  }
};

const confirmAccountValidator = (username: string, type: string | number) => {
  const errorMessage = "Confirm Account Validator Failed:\n";

  if (!validateUsername(username))
    throw new Error(errorMessage + "Invalid username ->" + username);
  if (generalRegex.test(String(type)))
    throw new Error(errorMessage + "Invalid type ->" + type);
};

/* ------------------ User ------------------ */

const shippingDetailsValidator = (
  username: string,
  formData: ShippingDetails
) => {
  const errorMessage = "Shipping Details Validator Failed:\n";

  if (!validateUsername(username))
    throw new Error(errorMessage + "Invalid username ->" + username);

  Object.entries(formData).forEach(([key, value]) => {
    if (key == "email") return;
    generalValidator(value);
  });
};

export {
  loginValidator,
  emailValidator,
  generalValidator,
  registerValidator,
  usernameValidator,
  confirmAccountValidator,
  shippingDetailsValidator,
};
