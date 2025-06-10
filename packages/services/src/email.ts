import { Config } from 'sst/node/config';
import sgMail from '@sendgrid/mail';

import { VisibleError, logger } from '@up-from/util';

const logName = 'Service Email:';

sgMail.setApiKey(Config.SENDGRID_API_KEY);

function getEmailFooter() {
  return `<p>${new Date().getUTCFullYear()} © UpFrom</p>
<p><i>Please note that this email address is a "no-reply" mailbox and is not monitored for incoming messages.</i></p>`;
}

async function send(message: sgMail.MailDataRequired) {
  const response = await sgMail.send(message);
  if (response?.[0]?.statusCode !== 202) {
    logger.info(`${logName} sgMail response:`, { response });
    throw new VisibleError('Failure during email send: sgMail status code mismatch', {
      isExposable: false,
      isOperational: false,
      extraInput: { response },
    });
  }
}

export async function sendVerificationLinkEmail(recipient: string, link: string) {
  logger.debug(`${logName} Sending verification email`, { recipient, link });

  const body = `<p>Thank you for signing up for UpFrom!</p>
<p>Please click on the following link to confirm your email address:<br> 
<a href='${link}'>link</a></p>
<p>Please note that this verification link will expire in 10 minutes.</p>
${getEmailFooter()}`;

  const letter = {
    to: recipient,
    from: Config.SENDGRID_EMAIL,
    subject: 'UpFrom Verification Link',
    html: body,
  };

  try {
    await send(letter);
  } catch (err) {
    throw new VisibleError('Failed to send verification link via email', {
      isExposable: true,
      cause: err,
      extraInput: { recipient },
    });
  }
}

export async function sendVerificationCodeEmail(recipient: string, code: string) {
  logger.debug(`${logName} Sending verification email`, { recipient, code });

  const body = `<p>Thank you for signing up for UpFrom!</p>
<p>Please use the following code to confirm your email address:<br> 
<b>${code}</b></p>
<p>Please note that this verification code will expire in 5 minutes.</p>
${getEmailFooter()}`;

  const letter = {
    to: recipient,
    from: Config.SENDGRID_EMAIL,
    subject: 'UpFrom Verification Code',
    html: body,
  };

  try {
    await send(letter);
  } catch (err) {
    throw new VisibleError('Failed to send verification code via email', {
      isExposable: true,
      cause: err,
      extraInput: { recipient },
    });
  }
}

export async function sendNotificationEmail(emailAddress: string, message: string): Promise<void> {
  logger.debug(`${logName} Sending notification email`, { recipient: emailAddress, notificationMessage: message });

  if (!message) {
    // No throw! Just logging a formatted error message by creating a new VisibleError.
    new VisibleError(`${logName} Cannot send an email notification: The message is empty`, {
      isExposable: false,
      extraInput: { emailAddress, notificationMessage: message },
    });
    return;
  }

  const body = `<p>${message}</p>${getEmailFooter()}`;

  const letter = {
    to: emailAddress,
    from: Config.SENDGRID_EMAIL,
    subject: 'UpFrom Notification',
    html: body,
  };

  try {
    await send(letter);
  } catch (err) {
    throw new VisibleError('Failed to send email notification', {
      isExposable: true,
      cause: err,
      extraInput: { emailAddress },
    });
  }
}

export * as Email from './email.js';
