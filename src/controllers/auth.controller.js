const User = require("../models/index").User;
const UserActivity = require("../models/index").UserActivity;

const response = require("../utils/responses/index");

const hash = require("../utils/helperFunctions/hash").encrypt;
const signToken = require("../utils/helperFunctions/jwt").signToken;
const compareKeys = require("../utils/helperFunctions/hash").compareKeys;

const register = async (req, res) => {
  console.log("Creating new User...");
  const { username, email, password } = req.body;

  try {
    // Check if the user's details are already registered
    const userExists = await User.findUser({ username, email });
    if (userExists?.exist) return response.auth.userExists(res, userExists.type);

    // Encrypt password and register user
    const hashed = await hash({ password });
    const user = await User.register({ ...req.body, password: hashed });

    // Sign activities
    const insertActivities = [
      UserActivity.insertActivity({ username, type: 'register' }),
      UserActivity.insertActivity({ username, type: 'login' })
    ]

    await Promise.all(insertActivities);
    console.log("New User:\n", user);

    signToken(user, res);
  } catch (err) {
    // TODO -> create logging system
    console.error("Error Creating User:\n", err);
    response.error.generic(res);
  }
};

const login = async (req, res) => {
  console.log("Loging in User...");
  const { username, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findByUsername(username);
    if(!user) user = await User.findByEmail(username);
    if(!user) return response.auth.userNotAuthenticated(res);

    // Compare passwords
    // const authed = await compareKeys(req.body.password, user.password);
    const authed = password == user.password;
    if(!authed) return response.auth.userNotAuthenticated(res);
    
    // Sign activity
    await UserActivity.updateActivity({username, type: 'login'});
    console.log("User logged in -> ", user.username);

    signToken(user, res);
  } catch (err) {
     // TODO -> create logging system
     console.error("Error Logging User:\n", err);
     response.error.generic(res);
  }
};

module.exports = {
  register,
  login,
}
