import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false }
);

userSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};
userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model("user", userSchema, "users");

export const updateUserSubscription = async (userId, subscription) =>
  User.findByIdAndUpdate(
    userId,
    { subscription },
    {
      new: true,
      runValidators: true,
    }
  );
