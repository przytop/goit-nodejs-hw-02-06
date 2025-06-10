import express from "express";
import {
  getContacts,
  getContact,
  postContact,
  putContact,
  patchFavorite,
  deleteContact,
} from "../../controllers/contacts.js";

export const router = express.Router();

router.get("/", getContacts);
router.get("/:id", getContact);

router.post("/", postContact);

router.put("/:id", putContact);

router.patch("/:id/favorite", patchFavorite);

router.delete("/:id", deleteContact);
