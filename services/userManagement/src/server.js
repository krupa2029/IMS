const { getDb, connectToDb } = require("../../../commonLibrary/src/database/dbConnection");
const app = require("./app");

const port = process.env.PORT || 9002;
global.db;

// Connect to Database 
connectToDb((err) => {
  if (!err) {
    // Run the server on the port
    app.listen(port, () => {
      console.log(`Server is running on port : ${port}`);
    });
    db = getDb();
  }
});


