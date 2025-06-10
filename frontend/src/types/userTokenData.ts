export type UserTokenData = {
  iat: number;
  exp?: number;
  properties: TokenDataProperties;
  type: string;
};

export type TokenDataProperties = {
  chatToken: string;
  id: string;
};
