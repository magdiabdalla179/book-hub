const { Op } = require('sequelize');

class APIFeatures {
  constructor(queryOptions, queryString) {
    this.queryOptions = queryOptions;
    this.queryString = queryString;
    this.page = 1;
    this.limit = 12;
  }

  search(fields = ['title', 'author', 'description']) {
    if (this.queryString.search) {
      const term = this.queryString.search;
      this.queryOptions.where = {
        ...this.queryOptions.where,
        [Op.or]: fields.map((field) => ({
          [field]: { [Op.iLike]: `%${term}%` },
        })),
      };
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const where = {};
    for (const [key, value] of Object.entries(queryObj)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const opMap = {
          gte: Op.gte,
          gt: Op.gt,
          lte: Op.lte,
          lt: Op.lt,
          in: Op.in,
        };
        const parsed = {};
        for (const [opKey, opVal] of Object.entries(value)) {
          if (opMap[opKey]) {
            parsed[opMap[opKey]] = opVal;
          }
        }
        if (Object.keys(parsed).length > 0) {
          where[key] = parsed;
        }
      } else {
        where[key] = value;
      }
    }

    this.queryOptions.where = { ...this.queryOptions.where, ...where };
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((s) => {
        if (s.startsWith('-')) {
          return [s.slice(1), 'DESC'];
        }
        return [s, 'ASC'];
      });
      this.queryOptions.order = sortBy;
    } else {
      this.queryOptions.order = [['createdAt', 'DESC']];
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.queryOptions.attributes = this.queryString.fields.split(',');
    }
    return this;
  }

  paginate() {
    this.page = parseInt(this.queryString.page, 10) || 1;
    this.limit = Math.min(parseInt(this.queryString.limit, 10) || 12, 100);
    const skip = (this.page - 1) * this.limit;

    this.queryOptions.offset = skip;
    this.queryOptions.limit = this.limit;
    return this;
  }
}

module.exports = APIFeatures;
