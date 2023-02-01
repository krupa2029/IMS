const { ObjectId } = require("mongodb");

module.exports = {
  convertToObjectId: (id) => {
    const isValidId = ObjectId.isValid(id);
    return isValidId ? ObjectId(id) : id;
  },
};
