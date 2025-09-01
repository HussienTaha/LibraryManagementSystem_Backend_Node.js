// i well create user model using mongoose
import mongoose from "mongoose";
export const usersRoles = {
  user: "user",
  admin: "admin",
  superAdmin: "superAdmin",
};
export const UserGender = {
  male: "male",
  female: "female",
};
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confermedPassword: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, min: 10, max: 100 },
    role: {
      type: String,
      enum: Object.values(usersRoles),
      default: usersRoles.user,
    },
    gender: {
      type: String,
      enum: Object.values(UserGender),
      default: UserGender.male,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    image: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    
    otp: String,
    verifyCode: String,

    codeExpires: Date,
    codeTries: {
      type: Number,
      default: 0,
    },
    codeBannedUntil: Date,
    createdAt: { type: Date, default: Date.now() },
    isDeleted: { type: Boolean, default: false },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  { timestamps: true }
);
const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;
