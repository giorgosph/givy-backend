import { Request } from "express";
import { GenderType } from "../../models/User.model";
import { ContactDetails, RegisterForm, ShippingDetails } from "./objectTypes";

/* -------------------- Auth -------------------- */
/* ---------------------------------------------- */
export interface IReqRegister extends Request {
  body: RegisterForm;
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

/* ----------------- Draw Attenant ----------------- */
/* ------------------------------------------------- */
export interface IReqOptIn extends Request {
  body: {
    drawId: number;
  };
}

/* ----------------- Notifications ----------------- */
/* ------------------------------------------------- */
export interface IReqEmailFP extends Request {
  body: {
    email: string;
  };
}

export interface IReqContactUs extends Request {
  body: {
    title: string;
    body: string;
  };
}

export interface IReqPushToUser extends Request {
  body: {
    pushToken: string;
  };
}

/* ------------------- User ------------------- */
/* -------------------------------------------- */
export interface IReqEditContact extends Request {
  body: ContactDetails;
}

export interface IReqEditShipping extends Request {
  body: ShippingDetails;
}

export interface IReqFeedback extends Request {
  body: {
    rating: number;
    comments: string;
  };
}
