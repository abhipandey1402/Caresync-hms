import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

const normalizeJwtKey = (value = "") => value.replace(/\\n/g, "\n");

const extractBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = String(authorizationHeader).split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(new ApiError(401, "Unauthorized", [{ code: "UNAUTHORIZED" }]));
  }

  try {
    const payload = jwt.verify(token, normalizeJwtKey(process.env.JWT_PUBLIC_KEY), {
      algorithms: ["RS256"]
    });

    req.user = {
      id: payload.sub,
      _id: payload.sub,
      tenantId: payload.tid,
      role: payload.role
    };

    return next();
  } catch {
    return next(new ApiError(401, "Unauthorized", [{ code: "UNAUTHORIZED" }]));
  }
};
