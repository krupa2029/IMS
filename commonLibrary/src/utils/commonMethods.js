const { ObjectId } = require("mongodb")

module.exports = {
    convertToObjectId : (id) => {
        return new ObjectId(`${id}`)
    }
}