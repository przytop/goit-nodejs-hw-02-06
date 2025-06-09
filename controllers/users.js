import dotenv from "dotenv";
import Joi from "joi";
import { User, updateUserSubscription } from "../models/users.js";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";
import { removeTempFile, transformAvatar } from "../helpers/helpers.js";

dotenv.config();
const { JWT_SECRET } = process.env;

const passwordSchema = Joi.string()
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .min(6)
  .message(
    "Password must be at least 6 characters long and contain at least one letter and one number"
  );
const emailSchema = Joi.string()
  .email()
  .message("Email must be a valid email address");
const subscriptionSchema = Joi.string()
  .valid("starter", "pro", "business")
  .messages({
    "any.only": "Subscription must be one of 'starter', 'pro', or 'business'",
  });

const userSignUpSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
  subscription: subscriptionSchema,
});
const userLoginSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
});
const userUpdateSchema = Joi.object({
  subscription: subscriptionSchema.required(),
});

export const signUp = async (req, res, next) => {
  try {
    const { email, password, subscription } =
      await userSignUpSchema.validateAsync(req.body);
    const user = await User.findOne({ email }).lean();
    if (user) {
      return res.status(409).json({ message: "Email in use" });
    }

    const avatarURL = gravatar.url(email, { s: "250", d: "robohash" }, true);
    const newUser = new User({ email, subscription, avatarURL });
    await newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      data: {
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logIn = async (req, res, next) => {
  try {
    const { email, password } = await userLoginSchema.validateAsync(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Not such a user" });
    }

    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const playload = {
      _id: user._id,
      email: user.email,
      subscription: user.subscription,
    };
    const token = jwt.sign(playload, JWT_SECRET, { expiresIn: "24h" });
    user.token = token;
    await user.save();
    res.status(200).json({
      data: {
        token: token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logOut = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    user.token = null;
    await user.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    });
  } catch (err) {
    next(err);
  }
};

export const patchSubscription = async (req, res, next) => {
  try {
    const { subscription } = await userUpdateSchema.validateAsync(req.body);
    const userId = req.user._id;
    const user = await updateUserSubscription(userId, subscription);
    if (!user) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({
      data: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const patchAvatar = async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "A proper avatar file is required" });
  }

  const { path: tempUploadPath } = req.file;

  try {
    const userId = req.user._id;
    const avatarURL = await transformAvatar(tempUploadPath, userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Not found" });
    }
    user.avatarURL = avatarURL;
    await user.save();

    res.status(200).json({ data: { avatarURL: user.avatarURL } });
  } catch (err) {
    await removeTempFile(tempUploadPath);
    next(err);
  }
};
