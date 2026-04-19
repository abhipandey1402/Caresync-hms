export const systemService = {
  getApiMetadata() {
    return {
      service: "caresync-hms-api",
      version: "v1"
    };
  },

  getApiConventions() {
    return {
      architecture: "Follow route-controller-service layering for every feature",
      response: "Use ApiResponse via sendOk/sendCreated/sendResponse helpers",
      errors: "Throw ApiError and let the centralized error handler format the response",
      async: "Wrap controllers with asyncHandler",
      adapters: "Call cloud providers only through src/shared/adapters"
    };
  },

  echoPayload(payload) {
    return payload;
  }
};
