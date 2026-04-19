export const healthService = {
  getHealthStatus() {
    return {
      status: "ok",
      ts: new Date().toISOString()
    };
  }
};
