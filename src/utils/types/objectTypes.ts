import { GenderType } from "../../models/User.model";

/* -------------------- User -------------------- */
/* ---------------------------------------------- */
export type RegisterForm = ContactDetails &
  ShippingDetails & {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    mobileExt: number;
    gender: GenderType;
  };

export type ContactDetails = {
  email: string;
  mobile: number;
};

export type ShippingDetails = {
  country: string;
  city: string;
  address1: string;
  address2: string;
  postalCode: string;
};

/* -------------------- Draw/Item -------------------- */
/* --------------------------------------------------- */
export type NewDraw = {
  title: string;
  brief: string;
  imagePath: string;
  location: string;
  category: string;
  openingDate: Date;
  closingDate: Date;
};

export type NewItem = {
  drawId: number;
  title: string;
  description: string;
  imagePath: string;
  brief: string;
  price: number;
};
