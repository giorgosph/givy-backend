import { Request } from "express";
import { GenderType } from "../../models/User.model";

/* -------------------- Auth -------------------- */
/* ---------------------------------------------- */
export interface IReqRegister extends Request {
  body: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile: number;
    mobileExt: number;
    gender: GenderType;
    country: string;
    city: string;
    address1: string;
    address2: string;
    postalCode: string;
  };
}

export interface IReqLogIn extends Request {
  body: {
    username: string;
    password: string;
  };
}

export interface IReqConfirmAccount extends Request {
  body: {
    type: "email" | "mobile";
    code: number;
  };
}

export interface IReqResetPass extends Request {
  body: {
    email: string;
    password: string;
    confirmPassword: string;
  };
}

export interface IReqForgotPass extends Request {
  body: {
    code: number;
    email: string;
    password: string;
    confirmPassword: string;
  };
}
