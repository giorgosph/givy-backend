import { Request } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import { logger } from "../logger/logger";

export function signToken(
  payload: JwtPayload,
  expirationPeriod: string,
  refresh = false
) {
  const { SECRET, SECRET_REFRESH } = process.env;

  const token = jwt.sign(payload, refresh ? SECRET_REFRESH! : SECRET!, {
    expiresIn: expirationPeriod,
  });

  return token;
}

export function extractToken(req: Request) {
  const header = req.headers["authorization"];

  if (header) {
    const token = header.split(" ")[1]?.trim();

    try {
      const decodedToken = jwt.verify(token!, process.env.SECRET!);

      logger.debug(`Decoded Token:\n ${JSON.stringify(decodedToken)}`);

      return decodedToken as JwtPayload;
    } catch (err: any) {
      // specify possible err types
      if (err instanceof jwt.TokenExpiredError) {
        logger.warn("Token has expired");
        return "refresh-token";
      } else throw new Error(err);
    }
  } else logger.warn("No Authorization Header");
}

export function extractRefreshToken(token: string) {
  const decodedToken = jwt.verify(token, process.env.SECRET_REFRESH!);

  logger.debug(`Decoded Refresh Token:\n ${JSON.stringify(decodedToken)}`);

  return decodedToken as JwtPayload;
}
