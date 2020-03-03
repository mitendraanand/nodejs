class APIFeatures {
  constructor(query_of_all_docs, request_params) {
    this.query_of_all_docs = query_of_all_docs; // query_of_all_docs that finds all the documnents from the model
    this.request_params = request_params; // part of request, after '?'
  }

  filter() {
    // Basic Filtering
    const queryObj = { ...this.request_params }; // ES 6 trick of creating deep copy of object for modification.
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach(el => delete queryObj[el]);

    // Adavanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query_of_all_docs = this.query_of_all_docs.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.request_params.sort) {
      const sortBy = this.request_params.sort.split(',').join(' ');
      this.query_of_all_docs = this.query_of_all_docs.sort(sortBy);
    } else {
      this.query_of_all_docs = this.query_of_all_docs.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.request_params.fields) {
      const fields = this.request_params.fields.split(',').join(' ');
      this.query_of_all_docs = this.query_of_all_docs.select(fields);
    } else {
      this.query_of_all_docs = this.query_of_all_docs.select('-__v');
    }

    return this;
  }

  paginate() {
    // Pagination, skip records based on limit per page
    const page = this.request_params.page * 1 || 1;
    const limit = this.request_params.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query_of_all_docs = this.query_of_all_docs.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;