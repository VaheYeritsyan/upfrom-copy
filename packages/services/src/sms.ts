import { Twilio } from 'twilio';
import { Config } from 'sst/node/config';

import { VisibleError, logger } from '@up-from/util';

const client = new Twilio(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN);

export async function send(phone: string, message: string) {
  // message param is wrapped into funcParams to prevent logger message overwriting
  logger.debug('Service SMS: Sending an SMS', { funcParams: { phone, message } });

  try {
    return await client.messages.create({
      body: message,
      from: Config.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (err) {
    throw new VisibleError('Failed to send SMS: External messaging service error.', {
      isExposable: true,
      cause: err,
      isOperational: false,
      extraInput: { phone },
    });
  }
}

export * as SMS from './sms.js';
