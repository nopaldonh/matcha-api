import { registerAs } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export default registerAs(
  'mail',
  (): {
    transport: SMTPTransport | SMTPTransport.Options | string;
    defaults?: SMTPTransport.Options;
  } => ({
    transport: {
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    defaults: {
      from: {
        name: process.env.MAIL_FROM_NAME || '',
        address: process.env.MAIL_FROM_ADDRESS || '',
      },
    },
  }),
);
