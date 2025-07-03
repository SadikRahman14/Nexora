import { Router } from "express";
import {healthcheck} from "../controllers/healthcheck.controller.js"

const router =  Router()

router.route("/health-check").get(healthcheck);

export default router;