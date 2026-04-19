import { Router } from "express";
import { echoPayload, getApiConventions, getApiRoot } from "../controllers/system.controller.js";

const router = Router();

router.get("/", getApiRoot);

router.get("/conventions", getApiConventions);

router.post("/echo", echoPayload);

export default router;
