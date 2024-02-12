import { Response } from "express";

interface SuccessData {
  body?: any;
  message?: string;
  status?: number;
}

const success = (res: Response, data?: SuccessData) => {
  const message = "Success!";

  res.status(200).json({
    success: true,
    body: data?.body,
    message: data?.message || message,
  });
};

const noData = (res: Response) => {
  res.status(204).json({});
};

const sendToken = (res: Response, token: string, data: SuccessData) => {
  const message = `Logged in successfully`;
  const fullToken = `Bearer ${token}`;
  res
    .status(data?.status || 201)
    .json({ success: true, token: fullToken, body: data?.body, message });
};

export { success, noData, sendToken };
