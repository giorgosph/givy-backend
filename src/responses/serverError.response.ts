import { Response } from "express";

interface ServerErrorData {
  status?: number;
  message?: string;
}

const serverError = (res: Response, data?: ServerErrorData) => {
  res
    .status(data?.status || 500)
    .send({ success: false, message: data?.message || "Server Error" });
};

export { serverError };
