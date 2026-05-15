import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.services";

class NotificationController {
  async getMyNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notifications = await notificationService.getMyNotifications(
        req.user!.id
      );
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await notificationService.markAllRead(req.user!.id);
      res.status(200).json({ success: true, message: "All marked as read" });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();