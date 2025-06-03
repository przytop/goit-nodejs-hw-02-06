import express from "express";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import { setJWTStrategy } from "./config/jwt.js";
import { auth as authMiddlewar } from "./middlewares/jwt.js";
import { router as contactsRouter } from "./routes/api/contacts.js";
import { router as usersRouter } from "./routes/api/users.js";

export const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
setJWTStrategy();
app.use(passport.initialize());

app.use("/api/contacts", authMiddlewar, contactsRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Not found ${req.path}` });
});
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error" });
});
