// @ts-ignore
type Value = Record<string | '__typename', string | number | symbol | Value>;

export const removeEntityFields = <Entity extends Value, Keys extends (keyof Entity)[]>(
  entity: Entity,
  keys?: Keys,
) => {
  let result = { ...entity };

  delete result.__typename;
  if (!keys?.length) return result;

  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...rest } = result;
    result = rest as Entity;
  }

  return result;
};
