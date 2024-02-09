import { Response } from "express";

/* --------------- Auth --------------- */

const userExists = (res: Response, type: string) => {
  const message = `${type} is already registered!`;

  res.status(409).json({ success: false, message });
};

const userNotAuthenticated = (res: Response) => {
  const message = `Wrong credentials!`;

  res.status(401).json({ success: false, message });
};

const noPrivilages = (res: Response) => {
  const message = "No Privilages";

  res.status(403).send({ success: false, message });
};

/* --------------- Data related --------------- */

const invalidData = (res: Response) => {
  const message = "Invalid data";

  res.status(422).send({ success: false, message });
};

const conflictedData = (res: Response) => {
  const message = "Data conflict";

  res.status(409).send({ success: false, message });
};

/* --------------- Token related --------------- */

const refreshToken = (res: Response) => {
  const message = "Invalid Token";

  res.status(491).send({ success: false, message });
};

export {
  userExists,
  invalidData,
  noPrivilages,
  refreshToken,
  conflictedData,
  userNotAuthenticated,
};
