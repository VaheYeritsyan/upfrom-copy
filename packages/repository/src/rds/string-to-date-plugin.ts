import {
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  RootOperationNode,
  UnknownRow,
} from 'kysely';

import { VisibleError } from '@up-from/util';

export class ToDatePlugin implements KyselyPlugin {
  readonly fields: string[];

  constructor(dateFieldNames: string[]) {
    this.fields = dateFieldNames;
  }

  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return args.node;
  }

  async transformResult(args: PluginTransformResultArgs) {
    if (!args.result.rows || !Array.isArray(args.result.rows) || !args.result.rows.length) {
      return args.result;
    }

    const fieldsToConvert = this.fields.filter(fieldName => Object.keys(args.result.rows[0]).includes(fieldName));
    if (!fieldsToConvert.length) return args.result;

    const convertedRows = args.result.rows.map(row => this.parseRowDates(fieldsToConvert, row));

    return { ...args.result, rows: convertedRows };
  }

  parseRowDates(fieldNames: string[], dbRow: UnknownRow): UnknownRow {
    const updatedEntries = fieldNames.map(fieldName => {
      const dateString = dbRow[fieldName];
      if (dateString && typeof dateString === 'string') {
        const timestamp = Date.parse(`${dateString} GMT`); // Force GMT for local environments (Date.parse forces local timezone on date & time parse)
        if (!Number.isNaN(timestamp)) {
          return [fieldName, new Date(timestamp)];
        }
      }

      new VisibleError('ToDatePlugin: Failed to parse DB date to JS Date', {
        extraInput: { dbRow, fieldName, fieldValue: dbRow?.[fieldName] },
      });

      return [fieldName, dbRow[fieldName]];
    });

    return { ...dbRow, ...Object.fromEntries(updatedEntries) };
  }
}
