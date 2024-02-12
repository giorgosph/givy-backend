import { GenderType } from "../../models/User.model";

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
