import express from "express";
import {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} from "../../models/contacts.js";
import Joi from "joi";

export const router = express.Router();

const nameSchema = Joi.string()
  .pattern(/^[A-Za-z\s]+$/)
  .message("Name must contain only letters and spaces")
  .min(1);
const emailSchema = Joi.string()
  .email()
  .message("Email must be a valid email address");
const phoneSchema = Joi.string()
  .pattern(/^[0-9()+\-\s]+$/)
  .message(
    "Phone number must contain only digits, spaces, and special characters"
  );

const contactPostSchema = Joi.object({
  name: nameSchema.required(),
  email: emailSchema.required(),
  phone: phoneSchema.required(),
});
const contactPutSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
}).min(1);

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json({ data: contacts });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ data: contact });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "Request body is missing or empty" });
    }

    const requiredFields = ["name", "email", "phone"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` });
      }
    }

    const { name, email, phone } = await contactPostSchema.validateAsync(
      req.body
    );
    const newContact = await addContact({ name, email, phone });
    res.status(201).json({ data: newContact });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await removeContact(id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ message: "Contact deleted" });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const filteredBody = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredBody).length === 0) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const updateData = await contactPutSchema.validateAsync(filteredBody);
    const updatedContact = await updateContact(id, updateData);
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ data: updatedContact });
  } catch (err) {
    next(err);
  }
});
