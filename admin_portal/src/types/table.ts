// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableEntity = Record<any, any | TableEntity>;

export type TableRow<Entity extends TableEntity> = Entity & {
  id: string;
};

export type TableCell<Entity extends TableEntity> = {
  value: Entity[keyof Entity] | TableEntity;
  label: string;
};

export type FormattedTableRow<Entity extends TableEntity> = {
  [K in keyof Entity]: TableCell<Entity>;
} & {
  id: { value: string; label: string };
};

export type DisabledActions<Action extends string, Entity extends TableEntity> = {
  [K in Action]?: Partial<Record<keyof Entity, Entity[keyof Entity]>>;
};

export enum TableOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum TableRowsSize {
  SHORT = 10,
  MEDIUM = 25,
  LONG = 50,
}
