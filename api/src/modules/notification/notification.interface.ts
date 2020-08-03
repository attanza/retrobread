import { Document } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  user: string;
  title: string;
  content: string;
  isRead: boolean;
  sender: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ENotificationAction {
  READ = 'read',
  UNREAD = 'unread',
}

export const notificationFillable = [
  'user',
  'title',
  'content',
  'isRead',
  'sender',
];
