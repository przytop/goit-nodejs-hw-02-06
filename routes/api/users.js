import express from "express";
import {
  signUp,
  logIn,
  logOut,
  getCurrentUser,
  patchSubscription,
  patchAvatar,
  resendVerificationEmail ,
  verifyUser,
} from "../../controllers/users.js";
import { auth as authMiddlewar } from "../../middlewares/jwt.js";
import { uploadAvatar } from "../../middlewares/multer.js";

export const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/verify", resendVerificationEmail );

router.get("/logout", authMiddlewar, logOut);
router.get("/current", authMiddlewar, getCurrentUser);
router.get("/verify/:verificationToken", verifyUser);

router.patch("/", authMiddlewar, patchSubscription);
router.patch(
  "/avatars",
  authMiddlewar,
  uploadAvatar.single("avatar"),
  patchAvatar
);
