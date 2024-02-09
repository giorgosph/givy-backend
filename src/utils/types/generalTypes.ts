import { JwtPayload } from "jsonwebtoken";

export interface Payload extends JwtPayload {
  username: string;
  email: string;
}
