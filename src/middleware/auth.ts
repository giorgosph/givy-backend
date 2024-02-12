import { Request, Response, NextFunction } from "express";

import { clientError, serverError } from "../responses";

import Logger from "../utils/logger/logger";
import { extractToken } from "../utils/helperFunctions/jwt";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  Logger.debug(`Verifying token ...`);

  try {
    const token = extractToken(req);

    if (token) {
      if (token === "refresh-token") return clientError.refreshToken(res);

      req.decodedToken = token;
      next();
    } else {
      clientError.noPrivilages(res);
    }
  } catch (err) {
    Logger.error(`Error verifying token:\n ${err}`);
    serverError.serverError(res);
  }
}
