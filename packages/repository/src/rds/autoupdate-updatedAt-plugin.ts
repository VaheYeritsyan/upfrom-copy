import {
  ColumnNode,
  ColumnUpdateNode,
  IdentifierNode,
  KyselyPlugin,
  OperationNodeTransformer,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  RootOperationNode,
  UpdateQueryNode,
  ValueNode,
} from 'kysely';

class AutoUpdatedAtTransformer extends OperationNodeTransformer {
  readonly updatedAtName: string;

  constructor(updatedAtFieldName: string) {
    super();
    this.updatedAtName = updatedAtFieldName;
  }

  transformUpdateQuery(node: UpdateQueryNode): UpdateQueryNode {
    node = super.transformUpdateQuery(node);
    if (!node.updates) return node;

    const isUpdatedAtDefined = node.updates.some(update => {
      if (update.column.kind === 'IdentifierNode') {
        return (update.column as IdentifierNode).name === this.updatedAtName;
      }
    });
    if (isUpdatedAtDefined) return node;

    const columnNode = ColumnNode.create(this.updatedAtName);
    const newValue = ValueNode.create(new Date());
    const updatedAt = ColumnUpdateNode.create(columnNode, newValue);
    const updates = [...node.updates, updatedAt];

    return { ...node, updates };
  }
}

export class AutoUpdatedAtPlugin implements KyselyPlugin {
  readonly updatedAtName: string;

  constructor(updatedAtFieldName: string) {
    this.updatedAtName = updatedAtFieldName;
  }

  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    const transformer = new AutoUpdatedAtTransformer(this.updatedAtName);
    return transformer.transformNode(args.node);
  }

  async transformResult(args: PluginTransformResultArgs) {
    return args.result;
  }
}
