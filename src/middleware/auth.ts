import { Request, Response, NextFunction } from "express";

import { clientError, serverError } from "../responses";

import { logger } from "../utils/logger/logger";
import { extractToken } from "../utils/helperFunctions/jwt";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  logger.debug(`Verifying token ...`);

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
    logger.error(`Error verifying token:\n ${err}`);
    serverError(res);
  }
}
