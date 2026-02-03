import nodemailer from 'nodemailer';
import { Invitation } from '../models/invitation';

// Настройка транспорта (пример для Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInvitationEmail = async (invitation: Invitation, frontendUrl: string): Promise<void> => {
  const registrationLink = `${frontendUrl}/register?invitation=${invitation.token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: invitation.email,
    subject: 'Приглашение в систему',
    html: `
      <h2>Добро пожаловать!</h2>
      <p>Вы были приглашены в систему.</p>
      <p>Перейдите по ссылке, чтобы завершить регистрацию:</p>
      <a href="${registrationLink}" target="_blank">${registrationLink}</a>
      <p>Ссылка действительна 24 часа.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};