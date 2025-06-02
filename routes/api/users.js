import express from "express";
import dotenv from "dotenv";
import { User, updateUserSubscription } from "../../models/users.js";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { auth as authMiddlewar } from "../../middlewares/jwt.js";

dotenv.config();
const { JWT_SECRET } = process.env;

export const router = express.Router();

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

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, subscription } =
      await userSignUpSchema.validateAsync(req.body);
    const user = await User.findOne({ email }).lean();
    if (user) {
      return res.status(409).json({ message: "Email in use" });
    }

    const newUser = new User({ email, subscription });
    await newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      data: {
        user: { email: newUser.email, subscription: newUser.subscription },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
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
});

router.get("/logout", authMiddlewar, async (req, res, next) => {
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
});

router.get("/current", authMiddlewar, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/", authMiddlewar, async (req, res, next) => {
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
});
