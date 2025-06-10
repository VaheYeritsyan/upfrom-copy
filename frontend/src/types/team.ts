import { User } from '@up-from/graphql/genql';

export type TeamMember = {
  role: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
};
