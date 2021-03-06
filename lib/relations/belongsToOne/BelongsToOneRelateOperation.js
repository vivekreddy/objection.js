'use strict';

const { normalizeIds } = require('../../utils/normalizeIds');
const { RelateOperation } = require('../../queryBuilder/operations/RelateOperation');

class BelongsToOneRelateOperation extends RelateOperation {
  onAdd(_, args) {
    this.input = args[0];
    this.ids = normalizeIds(args[0], this.relation.relatedProp, { arrayOutput: true });

    if (this.ids.length > 1) {
      throw this.relation.createError('can only relate one model to a BelongsToOneRelation');
    }

    return true;
  }

  queryExecutor(builder) {
    const patch = {};
    const ownerProp = this.relation.ownerProp;

    for (let i = 0, l = ownerProp.size; i < l; ++i) {
      const relatedValue = this.ids[0][i];

      ownerProp.setProp(this.owner, i, relatedValue);
      ownerProp.patch(patch, i, relatedValue);
    }

    return this.relation.ownerModelClass
      .query()
      .childQueryOf(builder)
      .copyFrom(builder, builder.constructor.JoinSelector)
      .copyFrom(builder, builder.constructor.WhereSelector)
      .patch(patch)
      .findById(this.owner.$id());
  }
}

module.exports = {
  BelongsToOneRelateOperation
};
