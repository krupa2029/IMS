const app = require("./app");

const port = process.env.PORT || 9001;

// Run the server on the port 
app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});