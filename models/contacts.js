import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contactsPath = path.resolve(__dirname, "contacts.json");

export const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(err.message);
      return [];
    }
    throw err;
  }
};

export const getContactById = async (contactId) => {
  const contacts = await listContacts();
  return contacts.find((c) => c.id === contactId) || null;
};

export const addContact = async (body) => {
  const contacts = await listContacts();
  const newContact = {
    id: nanoid(),
    name: body.name,
    email: body.email,
    phone: body.phone,
  };
  const contactsAfterAdd  = [...contacts, newContact];
  await fs.writeFile(contactsPath, JSON.stringify(contactsAfterAdd, null, 2));
  return newContact;
};

export const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const contactToRemove = contacts.find((c) => c.id === contactId);
  if (!contactToRemove) return null;

  const contactsAfterRemoval = contacts.filter((c) => c.id !== contactId);
  await fs.writeFile(contactsPath, JSON.stringify(contactsAfterRemoval, null, 2));
  return contactToRemove;
};

export const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((c) => c.id === contactId);
  if (index === -1) return null;

  const updatedContacts = contacts.map((contact) =>
  contact.id === contactId ? { ...contact, ...body } : contact
);
  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
  return updatedContacts.find((c) => c.id === contactId);
};
