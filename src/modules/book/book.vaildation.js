import Joi from "joi";

export const createBookValidation = {
  body: Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
      "string.base": "Title must be a string",
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters",
      "string.max": "Title must be less than 100 characters",
      "any.required": "Title is required",
    }),
    createdBy: Joi.string().hex().length(24).messages({
      "string.hex": "createdBy must be a valid ObjectId",
      "string.length": "createdBy must be 24 characters",
      "any.required": "createdBy is required",
    }),
    createdwith: Joi.string().trim().messages({
      "string.empty": "createdwith is required",
    }),
    author: Joi.string().min(3).max(50).required().messages({
      "string.empty": "Author is required",
      "string.min": "Author must be at least 3 characters",
      "string.max": "Author must be less than 50 characters",
    }),
    pupisherYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required().messages({
      "number.base": "Publisher Year must be a number",
      "number.min": "Publisher Year must be valid",
      "number.max": "Publisher Year cannot be in the future",
      "any.required": "Publisher Year is required",
    }),
    availableCopies: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Available copies must be a number",
      "number.min": "At least 1 copy must be available",
    }),
    isDeleted: Joi.boolean().default(false),
    deletedBy: Joi.string().hex().length(24).allow(null),
  }),
};
