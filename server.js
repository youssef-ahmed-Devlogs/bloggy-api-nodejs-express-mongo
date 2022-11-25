const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

mongoose
  .connect(process.env.LOCAL_DATABASE)
  .then((con) => console.log("DB connection successful!"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
