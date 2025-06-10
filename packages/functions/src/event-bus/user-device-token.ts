import { EventHandler } from 'sst/node/event-bus';

import { UserDevice } from '@up-from/core/user-device';
import { Loader } from '@up-from/repository/dataloader';
import { Events } from '@up-from/services/event-bus';
import { VisibleError, logger } from '@up-from/util';

const logName = 'Lambda: User Device Token:';

export const userDeviceTokensInvalidatedHandler = EventHandler(Events.UserDeviceTokensInvalidated, async event => {
  logger.debug(`${logName} Removing invalid user device tokens`, { event });

  Loader.clearAllLoaders(); // Drop dataloader cache on each new request (to prevent reusing old data of frozen function)

  try {
    await UserDevice.removeMany(event.properties.deviceIds);
  } catch (err) {
    new VisibleError('Failed to remove invalid user device tokens!', {
      cause: err,
      extraInput: { event },
    });
  }
});
