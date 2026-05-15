import { notificationRepository } from "../repositories/notification.repository";
import { INotification } from "../models/notification.model";
import { UserModel } from "../models/user.model";

class NotificationService {
  async getMyNotifications(userId: string): Promise<INotification[]> {
    return await notificationRepository.findByUser(userId);
  }

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllReadByUser(userId);
  }

  async notifyRegistrationPending(
    userId: string,
    tournamentTitle: string,
    teamName: string,
    registrationFee: number
  ): Promise<void> {
    await notificationRepository.create({
      userId,
      type: "REGISTRATION_PENDING",
      title: "Registration Received!",
      message: `Your team "${teamName}" has been registered for "${tournamentTitle}". Fee paid: Rs. ${registrationFee}. Status: Pending approval.`,
    });
  }

  async notifyAllUsersNewTournament(
    tournamentTitle: string,
    location: string
  ): Promise<void> {
    const allUsers = await UserModel.find({}, "_id").lean();
    const notifications = allUsers.map((user) => ({
      userId: user._id.toString(),
      type: "NEW_TOURNAMENT" as const,
      title: "New Tournament Added!",
      message: `A new tournament "${tournamentTitle}" has been added in ${location}. Register now!`,
    }));
    await notificationRepository.createMany(notifications);
  }
}

export const notificationService = new NotificationService();