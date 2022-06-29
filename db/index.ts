import { DB_NAME, DB_URL } from "../config/config";

const Mongoose = require("mongoose");

const connection = Mongoose.connect(
  "mongodb://" +
    DB_URL +
    "/" +
    DB_NAME +
    "?retryWrites=true",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

connection
  .then(() => {
    console.log("db connected");
  })
  .catch((err: any) => {
    console.log("connection err ", err);
  });
