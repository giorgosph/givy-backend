import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      decodedToken?: {
        username: string;
        email: string;
      };
    }
  }
}
