import { MessageType } from 'stream-chat-react-native';

// The arrow func doesn't work with Generics (only here)
export function serializeMessageUser<User extends MessageType['user']>(user?: User) {
  if (!user) return user as User;

  const isDeactivated = user?.deactivated_at;

  return {
    ...user,
    image: isDeactivated ? undefined : user.image,
    name: isDeactivated ? 'Disabled User' : user.name,
  } as User;
}
