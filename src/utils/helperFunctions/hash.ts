import bcrypt from "bcrypt";

/**
 * Encrypts the provided password.
 * @param password - The password to be encrypted.
 * @returns A promise resolving to the hashed password and the salt used.
 */
export const encrypt = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    return encryptedPassword;
  } catch (err) {
    throw new Error("Error while hashing password:\n" + err);
  }
};

/**
 * Compares two passwords.
 *
 * @param pass1 - The first password.
 * @param pass2 - The second password.
 * @returns A promise resolving to a boolean indicating whether the passwords match.
 */
export const compareKeys = async (pass1: string, pass2: string) => {
  try {
    const authed = await bcrypt.compare(pass1, pass2);
    return authed;
  } catch (err) {
    throw new Error("Error while comparing passwords:\n" + err);
  }
};
