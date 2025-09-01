import joi from "joi";
import { UserGender, usersRoles } from "../../DB/models/user.model.js";

// لو عندك مجموعة MIME_TYPES لازم تكون Array of strings


export const signupValidation = {
  body: joi.object({
    name: joi.string().min(3).max(30).required(),

    email: joi.string().email().required(),

    password: joi
      .string()
      .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) // ✅ شيلت الـ "" حوالين regex
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long",
      })
      .required(),

    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .messages({
        "any.only": "Confirmed password does not match password",
      })
      .required(),

    phone: joi
      .string()
      .pattern(/^01[0125][0-9]{8}$/) // ✅ نفس الكلام regex من غير quotes
      .messages({
        "string.pattern.base": "Phone number must be a valid Egyptian phone number",
      })
      .required(),
      image:joi.string().optional(),
    age: joi.number().min(10).max(100).required(),

    gender: joi
      .string()
      .valid(UserGender.male, UserGender.female)
      .messages({
        "any.only": "Gender must be male or female",
      })
      .required(),

    confirmed: joi.boolean(),
    role: joi.valid(usersRoles.user, usersRoles.admin).default(usersRoles.user),
  }),
  

  query: joi.object({
    flag: joi.number().integer().min(1).default(10),
  }),

  headers: joi
    .object({
      authorization: joi.string(),
      host: joi.string().required(),
      "accept-encoding": joi.string().required(),
      "content-type": joi.string().required(),
      "content-length": joi.string().required(),
      connection: joi.string().required(),
      "user-agent": joi.string().required(),
      accept: joi.string().required(),
      "cache-control": joi.string().required(),
      "postman-token": joi.string().required(),
    }).unknown(true), // ✅ خلي headers يقبل أي حاجة زيادة

  // file: joi.object({
  //   originalname: joi.string().required(),
  //   mimetype: joi.string().valid(...MIME_GROUPS).required(), // ✅ لازم تفك array بالـ ...
  //   size: joi.number().max(5 * 1024 * 1024).required(), // 5MB
  // }),
};
export const signinuserValidationSchema = {
  body: joi.object({
    email: joi.string()
      .trim()
      .email({ tlds: { allow: ["outlook", "com"] }, minDomainSegments: 2 })
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
      }),

    password: joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
      }),
  })
};
export const sendverifyOtpValidationSchema = {
  body: joi.object({
    email: joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required"
      }),
    
  })
};

export const verifyOtpValidationSchemaa = {
  body: joi.object({
    email: joi.string().email().required(),
    otp: joi.string().length(6).required(),
    newPassword: joi.string().min(6).required()
  })
};
export const sendconfermcode = {
  body: joi.object({
    email: joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required"
      }),
    
  })
};
export const confermedcode = {
  body: joi.object({

    email: joi.string().email().required(),
    code: joi.string().length(6).required(),
   
  })
};
export const updateProfileValidationSchema = {
  body: joi.object({
    name: joi.string().optional(),
    age: joi.number().min(10).max(100).optional(),
    gender: joi.string().valid("male", "female").optional(),
    phone: joi.string().optional(),
    image: joi.string().optional(),
    email: joi.string() .email().optional(),
  }),
};
export const freezeProfileValidationSchema = {
  params: joi.object({
    id: joi.string().length(24).optional().messages({
      'string.base': 'ID must be a string',
      'string.length': 'Invalid ID length',
    }),
  }),
};
export const unfreezeProfileValidationSchema = {
  params: joi.object({
    id: joi.string().length(24).optional().messages({
      'string.base': 'ID must be a string',
      'string.length': 'Invalid ID length',
    }),
  }),
};
export const updateImageValidationSchema = {
  file: joi.object({
    originalname: joi.string().required(),
    mimetype: joi.string()
      .valid("image/jpeg", "image/png", "image/webp")
      .required()
      .messages({
        "any.only": "Invalid file type. Only jpeg, png, webp allowed",
      }),
    size: joi.number()
      .max(2 * 1024 * 1024) // 2MB
      .required()
      .messages({
        "number.max": "File too large. Max size is 2MB",
      }),
  }),
};
