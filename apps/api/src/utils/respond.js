import { ApiResponse } from "./apiResponse.js";

export const sendResponse = (res, statusCode, data, message = "Success") => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message, res.req));
};

export const sendOk = (res, data, message = "Success") => {
  return sendResponse(res, 200, data, message);
};

export const sendCreated = (res, data, message = "Resource created successfully") => {
  return sendResponse(res, 201, data, message);
};

export const sendNoContent = (res) => {
  return res.status(204).send();
};
