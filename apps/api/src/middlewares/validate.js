import { ApiError } from "../utils/apiError.js";

const formatZodPath = (path = []) => path.join(".") || "request";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return next(
      new ApiError(
        400,
        "Validation failed",
        result.error.issues.map((issue) => ({
          code: "VALIDATION_ERROR",
          path: formatZodPath(issue.path),
          message: issue.message
        }))
      )
    );
  }

  if ("body" in result.data) {
    req.body = result.data.body;
  }

  if ("params" in result.data) {
    req.params = result.data.params;
  }

  if ("query" in result.data) {
    req.query = result.data.query;
  }

  return next();
};
