import { logger } from '@up-from/util/logger';

type ExtraInput = { [key: string]: unknown };

type VisibleErrorOptions = {
  isExposable?: boolean; // Can error.message be exposed to response?
  isOperational?: boolean;
  cause?: unknown; // This property can be used to pass the original error.
  serviceMessage?: string; // This message will be logged and never be exposed to the user
  extraInput?: ExtraInput;
};

export class VisibleError extends Error {
  isExposable: boolean;
  isOperational: boolean;

  constructor(message: string, options?: VisibleErrorOptions) {
    if (options?.cause) {
      super(message, { cause: options?.cause });
    } else {
      super(message);
    }

    this.isExposable = options?.isExposable || false;
    this.isOperational = options?.isOperational || true;

    console.error('ERROR', message); // This is a required step to mark message as an error in SEED
    logger.error(message, {
      options: {
        isExposed: this.isExposable,
        isOperational: this.isOperational,
        serviceMessage: options?.serviceMessage,
        extraInput: options?.extraInput,
        cause: this.cause,
      },
      error: this,
    });
  }

  getExposableMessages(): string[] {
    const messages: string[] = this?.cause instanceof VisibleError ? this.cause.getExposableMessages() : [];
    if (this.isExposable) {
      messages.unshift(this.message);
    }

    return messages;
  }
}

export * as Error from './error.js';
