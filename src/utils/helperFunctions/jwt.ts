import { Request } from "express";

import jwt from "jsonwebtoken";
import Logger from "../logger/logger";
import { Payload } from "../types/generalTypes";

export function signToken(
  payload: Payload,
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

      Logger.debug(`Decoded Token:\n ${JSON.stringify(decodedToken)}`);

      return decodedToken as Payload;
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        Logger.warn("Token has expired");
        return "refresh-token";
      } else throw new Error(err);
    }
  } else Logger.warn("No Authorization Header");
}

export function extractRefreshToken(token: string) {
  const decodedToken = jwt.verify(token, process.env.SECRET_REFRESH!);

  Logger.debug(`Decoded Refresh Token:\n ${JSON.stringify(decodedToken)}`);

  return decodedToken as Payload;
}
