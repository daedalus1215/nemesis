export type UpdatePasswordCommand = {
  userId: number;
  currentPassword: string;
  newPassword: string;
};
