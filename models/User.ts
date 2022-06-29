import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";

import logging from "../config/logging";
import { IUser } from "../interfaces/IUser";

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  recoveryCode: {
    type: String,
    required: true,
  },
});

const salt = 10;

UserSchema.pre<IUser>("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcryptjs.hash(user.password, salt);
  }
  next();
});

UserSchema.post<IUser>("save", function () {
  logging.info("Mongo", "Checkout the book we just saved: ");
});

export default mongoose.model<IUser>("User", UserSchema);
