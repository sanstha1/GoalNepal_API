import { Router } from "express";
import { notificationController } from "../controllers/notification.controllers";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.use(authorizedMiddleware);

router.get(
  "/",
  notificationController.getMyNotifications.bind(notificationController)
);

router.patch(
  "/mark-read",
  notificationController.markAllRead.bind(notificationController)
);

export default router;