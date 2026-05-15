import { NotificationModel, INotification } from "../models/notification.model";

class NotificationRepository {
  async create(data: {
    userId: string;
    type: "NEW_TOURNAMENT" | "REGISTRATION_PENDING";
    title: string;
    message: string;
  }): Promise<INotification> {
    const notification = new NotificationModel(data);
    return await notification.save();
  }

  async createMany(
    data: {
      userId: string;
      type: "NEW_TOURNAMENT" | "REGISTRATION_PENDING";
      title: string;
      message: string;
    }[]
  ): Promise<void> {
    await NotificationModel.insertMany(data);
  }

  async findByUser(userId: string): Promise<INotification[]> {
    return await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
  }

  async markAllReadByUser(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId, read: false },
      { read: true }
    );
  }

  async countUnread(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({ userId, read: false });
  }
}

export const notificationRepository = new NotificationRepository();