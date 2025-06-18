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

  async sendEmailVerificationNotification(
    to: string,
    verify: string,
    verifyExpiresIn: string,
  ) {
    await this.transporter.sendMail({
      to,
      subject: 'Verify Email Address',
      html: /* html */ `
        <h3>Hello!</h3>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verify}">Verify Email Address</a>
        <p>This link will expire in ${verifyExpiresIn}.</p>
      `,
    });
  }
}
