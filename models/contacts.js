import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false }
);
const Contact = mongoose.model("contact", contactSchema, "contacts");

export const listContacts = async () => Contact.find();

export const getContactById = async (contactId) => Contact.findById(contactId);

export const addContact = async (body) => Contact.create(body);

export const updateContact = async (contactId, body) =>
  Contact.findByIdAndUpdate(contactId, body, {
    new: true,
    runValidators: true,
  });

export const updateStatusContact = async (contactId, favorite) =>
  updateContact(contactId, favorite);

export const removeContact = async (contactId) =>
  Contact.findByIdAndDelete(contactId);
