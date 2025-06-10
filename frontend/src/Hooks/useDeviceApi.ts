import { useTypedMutation } from '~urql';
import { MutationGenqlSelection } from '@up-from/graphql/genql';
import EncryptedStorage from 'react-native-encrypted-storage';

// @ts-ignore
type AddDeviceArgs = MutationGenqlSelection['addDeviceId']['__args'];
// @ts-ignore
type RemoveDeviceArgs = MutationGenqlSelection['removeDeviceId']['__args'];

const STORAGE_KEY = '@device_push_token';

export const useDeviceApi = () => {
  const [{ fetching: isAddDeviceLoading }, executeAddDevice] = useTypedMutation((args: AddDeviceArgs) => ({
    addDeviceId: {
      __args: args,
      userId: true,
    },
  }));

  const [{ fetching: isRemoveDeviceLoading }, executeRemoveDevice] = useTypedMutation((args: RemoveDeviceArgs) => ({
    removeDeviceId: {
      __args: args,
      userId: true,
      deviceId: true,
    },
  }));

  const getDeviceId = () => {
    return EncryptedStorage.getItem(STORAGE_KEY);
  };

  const addDevice = async (token: string) => {
    const storedToken = await getDeviceId();
    if (token === storedToken) return;

    try {
      await Promise.all([EncryptedStorage.setItem(STORAGE_KEY, token), executeAddDevice({ deviceId: token })]);
    } catch (error) {
      console.log(`adding device [${token}] error: `, error);
    }
  };

  const removeDevice = async (token?: string) => {
    const deviceId = token || (await getDeviceId());

    try {
      if (!deviceId) return;
      await Promise.all([executeRemoveDevice({ deviceId }), EncryptedStorage.removeItem(STORAGE_KEY)]);
    } catch (error) {
      console.log(`removing device [${deviceId}] error: `, error);
    }
  };

  return {
    isRemoveDeviceLoading,
    isAddDeviceLoading,
    getDeviceId,
    addDevice,
    removeDevice,
  };
};
