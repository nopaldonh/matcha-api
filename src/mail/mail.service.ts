import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import mailConfig from './mail.config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailConfig.KEY)
    private mailConfiguration: ConfigType<typeof mailConfig>,
  ) {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport(
      this.mailConfiguration.transport,
      this.mailConfiguration.defaults,
    );
  }

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    resetLinkExpiresIn: string,
  ) {
    await this.transporter.sendMail({
      to,
      subject: 'Reset your password',
      html: /* html */ `
        <h3>Password Reset</h3>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in ${resetLinkExpiresIn}.</p>
      `,
    });
  }
}
