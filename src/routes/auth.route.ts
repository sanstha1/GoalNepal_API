import { Router } from "express";
import {
  register,
  login,
  sendResetPasswordEmail,
  resetPassword,
} from "../controllers/auth.controllers";

import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/request-password-reset", sendResetPasswordEmail);
router.post("/reset-password/:token", resetPassword);

export default router;
