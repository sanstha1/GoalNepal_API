import { Router } from "express";
import { register, login } from "../controllers/auth.controllers";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
