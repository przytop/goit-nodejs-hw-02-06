import express from "express";
import logger from "morgan";
import cors from "cors";
import { router as contactsRouter } from "./routes/api/contacts.js";

export const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Not found ${req.path}` });
});
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error" });
});
