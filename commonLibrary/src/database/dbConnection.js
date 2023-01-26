const { MongoClient } = require('mongodb')

let dbConnection;

module.exports = {
    connectToDb: (cbFunction) => {
        MongoClient.connect(process.env.DATABASE_CONNECTION_STRING)
        .then((client) => {
            dbConnection = client.db();
            console.log('DB Connection Successful!')
            // return callback function 
            return cbFunction(); 
        })
        .catch((err) => {
            console.log('DB Connection Failed!')
            console.log(err);
            return cbFunction(err);
        })
    },
    getDb: () => {
        return dbConnection;
    }
}