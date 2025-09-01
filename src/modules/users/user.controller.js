import { Router } from "express";
import * as US from "./user.service.js";
import { vaildation} from "../../middleware/vaildation.js";
import { confermedcode, sendconfermcode, 
    sendverifyOtpValidationSchema, 
    signinuserValidationSchema, 
    signupValidation, 
    updateImageValidationSchema, 
    updateProfileValidationSchema,
    
      verifyOtpValidationSchemaa } from "./user.vaildation.js";

import { authorization } from "../../middleware/authorization.js";
import {  MIME_GROUPS, multerUploadhost } from "../../middleware/multer.js";
import { authantcation } from "../../middleware/authantcation.js";
import { usersRoles } from "../../DB/models/user.model.js";





const userRouter =Router({ caseSensitive: true, strict: true })
 //crate signup route
//  userRouter.post("/signup",vaildation(signupValidation), US.signup)
userRouter.post(
  "/signup",
  multerUploadhost({custemPrameter: "users/profile",custemExtation: [...MIME_GROUPS.images]}).single("image"),vaildation(signupValidation),US.signup);
 userRouter.post("/login",vaildation(signinuserValidationSchema), US.login)
 userRouter.post("/logout",authantcation,US.logout)
 userRouter.post("/refreshtoken",US.refreshtoken)
 userRouter.get("/confirmemail/:token", US.confermedEmail);
 userRouter.get("/getprofile", authantcation, US.getprofile);
 userRouter.post("/sendcode",vaildation(sendconfermcode), US.sendVerificationCode);
 userRouter.post("/confermcode", vaildation(confermedcode), US.confirmCode);
 userRouter.get("/getprofiledate/:id",authantcation,US.getprofiledate)
 userRouter.patch("/updateprofile",authantcation,vaildation(updateProfileValidationSchema),US.updateProfile)
 userRouter.post("/forgotpassword",vaildation(sendverifyOtpValidationSchema),US.forgetPassword)
 userRouter.post("/resetpassword",vaildation(verifyOtpValidationSchemaa),US.resetPassword)
userRouter.patch("/freeze/:id",authantcation,authorization([usersRoles.admin]), US.freezeProfile);
userRouter.patch("/unfreeze/:id", authantcation ,authorization([usersRoles.admin]), US.unfreezeProfile);
userRouter.patch("/updateProfileImage", authantcation ,  multerUploadhost({
 custemPrameter: "users/profile",custemExtation: [...MIME_GROUPS.images,] }).single("image"),US.updateProfileImage);
userRouter.delete("/deleteProfileImage", authantcation ,US.deleteProfileImage);
userRouter.get("/getProfileImage", authantcation ,US.getProfileImage);
userRouter.get("/getallusers",authantcation,authorization([usersRoles.admin]),US.getalluser)
userRouter.get("/getalladmin",authantcation,authorization([usersRoles.admin]),US.getalladmin)




export default userRouter