import UserModel, { usersRoles } from "../../DB/models/user.model.js";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import RevokedTokenModel from "../../DB/models/revokedToken.model.js";
import  {sendEmail}  from "../../service/sendEmail.js";
import { eventEmitter } from "../../utils/emailEvents/index.js";
import cloudinary from "../../utils/cloudinary/index.js";



export const signup = async (req, res, next) => {
  const { name, email, password, phone, gender,role, age,confirmed } = req.body;
  if (await UserModel.findOne({ email })) {
    return res.status(400).json({
      message: "user already exist",
      status: 400,
    });
  }

     const { secure_url, public_id} =await cloudinary.uploader.upload(req?.file?.path,{
    folder:"library/users"
   })
  const findUser = await UserModel.findOne({ email });
  if (findUser) {
    return res.status(400).json({
      message: "user already exist",
      status: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);

  const encryptohone = await CryptoJS.AES.encrypt(
    phone,
    process.env.PHONE_SECRET_KEY
  ).toString();

  sendEmail
//create token to conferm
 eventEmitter.emit("sendEmail", {email});
  //  eventEmitter.emit("sendEmail", {email});
  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    confermedPassword: hashedPassword,
    phone: encryptohone,
    gender,
    confirmed,
     image:{ secure_url, public_id},
    age,  
    role
  });
  await user.save();

  // create access token and refresh token
  const accessToken = jwt.sign(
    { userId: user._id, email, role: usersRoles.role },
    user.role === usersRoles.user
      ? process.env.USER_ACCESS_TOKEN_KEY
      : process.env.ADMIN_ACCESS_TOKEN_KEY,
    {
      expiresIn: "1h",
      jwtid: nanoid(),
    }
  );
  const refreshToken = jwt.sign(
    { userId: user._id,email, role: usersRoles.role },
    user.role === usersRoles.user
      ? process.env.USER_REFRESH_TOKEN_KEY
      : process.env.ADMIN_REFRESH_TOKEN_KEY,
    {
      expiresIn: "1d",
      jwtid: nanoid(),
    }
  );
  return res.status(201).json({
    message: "user signup successfully",
    status: 201,
    user,
    tokens: { accessToken, refreshToken },
  });
};
export const confermedEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const decoded = jwt.verify(token,process.env.SIGNTURE);
    console.log(decoded);
    
    const user = await UserModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    user.confirmed = true;
    await user.save();
    return res.status(200).json({ message: "Email confirmed successfully" });
  
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error getting profile", error: error.message });
  }
};  
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({
    email,
    confirmed: true,
    isDeleted: false,
  });
  console.log(user);
  if (!user) {
    return res.status(404).json({
      message: "user not found",
      status: 404,
    });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({
      message: "invalid credentials , password not match",
      status: 400,
    });
  }
  // create access token and refresh token
  const accessToken = jwt.sign(
    { userId: user._id, email, role: usersRoles.role },
    user.role === usersRoles.user
      ? process.env.USER_ACCESS_TOKEN_KEY
      : process.env.ADMIN_ACCESS_TOKEN_KEY,
    {
      expiresIn: "1h",
      jwtid: nanoid(),
    }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, email, role: usersRoles.role },
    user.role === usersRoles.user
      ? process.env.USER_REFRESH_TOKEN_KEY
      : process.env.ADMIN_REFRESH_TOKEN_KEY,
    {
      expiresIn: "1d",
      jwtid: nanoid(),
    }
  );
  return res.status(200).json({
    message: "user login successfully",
    status: 200,
    tokens: { accessToken, refreshToken },
  });
};
export const logout = async (req, res, next) => {
  try {
    const revakedtoken = await RevokedTokenModel.create({
      tokenId: req.decoded.jti,
      expireAt: req.decoded.exp,
    });

    return res.status(200).json({
      message: "user logout successfully",
      status: 200,
      revakedtoken,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Server error",
        error: error.message,
        stack: error.stack,
        status: 500,
      });
  }
};
export const refreshtoken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [prefix, token] = authorization.split(" ") || [];

    if (!prefix || !token) {
      return res.status(401).json({ message: "token not exist " });
    }

    let segnature ="";
    if (prefix ==="bearer") {
      segnature =process.env.USER_REFRESH_TOKEN_KEY;
    } else if (prefix ==="admin") {
      segnature =process.env.ADMIN_REFRESH_TOKEN_KEY;
    } else {
      return res.status(401).json({ message: " invalid prefix  token " });
    }
    console.log(segnature);
console.log({ prefix, token, segnature});

    const decoded =jwt.verify(token,segnature);
    console.log(decoded);
    // revoked token
    const revoked = await RevokedTokenModel.findOne({ tokenId: decoded.jti });
    if (revoked) {
      throw new Error("please login agin ", { cause: 400 });
    }
    const user = await UserModel.findById(decoded.userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const access_token = jwt.sign(
      { userId: user._id, email: user.email , role: user.role },
      user.role == usersRoles.user
        ? process.env.USER_ACCESS_TOKEN_KEY
        : process.env.ADMIN_ACCESS_TOKEN_KEY,

      { expiresIn: "30m", jwtid: nanoid() }
    );
    const refresh_token = jwt.sign(
      { userId: user._id, email: user.email , role: user.role },
      user.role == usersRoles.user
        ? process.env.USER_REFRESH_TOKEN_KEY
        : process.env.ADMIN_REFRESH_TOKEN_KEY,
      { expiresIn: "1h", jwtid: nanoid() }
    );
    return res
      .status(201)
      .json({
        message: " Success ........ token refresed",
        access_token,
        refresh_token,
      });
  } catch (error) {
    console.error("REFRESH ERROR =>", error); // 👈 ده هيساعدك تطبع كل تفاصيل الخطأ في الكونسول

    return res.status(500).json({
      message: "Error while refreshing token",
      error: error.message || "Unknown error",
      stack: error.stack,
    });

  }
};
export const getprofile = async (req, res, next) => {
  //decrypt phone
  try {
    const decryptedPhone = CryptoJS.AES.decrypt(
      req?.user?.phone,
      process?.env.PHONE_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);
    const userProfile = { ...req.user, phone: decryptedPhone };
    return res.status(200).json({
      success: true,
      message: "user profile",
      status: 200,
      userProfile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Server error",
        error: error.message,
        stack: error.stack,
        status: 500,
      });
  }
};
export const sendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user is banned
    if (user.codeBannedUntil && user.codeBannedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.codeBannedUntil - Date.now()) / (60 * 1000));
      return res.status(429).json({
        message: `You are temporarily banned. Try again in ${minutesLeft} minutes.`,
      });
        
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

const hash = bcrypt.hashSync(code,+process.env.SALT_ROUNDS);
    user.verifyCode = hash;
    user.codeExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 mins
    user.codeTries = 0;
    user.codeBannedUntil = null;

    await user.save();

    await sendEmail({
      to: email,
      subject: "Verification Code",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verification Code</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f8fa;
      padding: 20px;
      text-align: center;
    }

    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      max-width: 400px;
      margin: 50px auto;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    }

    h3 {
      color: #333333;
      margin-bottom: 10px;
    }

    h1 {
      font-size: 36px;
      color: #007BFF;
      margin: 20px 0;
      letter-spacing: 5px;
    }

    p {
      color: #888888;
      font-size: 14px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h3>Your verification code is:</h3>
    <h1>${code}</h1>
    <p>Code expires in 2 minutes.</p>
  </div>
</body>
</html>
`,
    });

    return res.status(200).json({ message: "Verification code sent." });
  } catch (error) {
    return res.status(500).json({ message: "Error sending code", error });
  }
};
export const confirmCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user is banned
    if (user.codeBannedUntil && user.codeBannedUntil > Date.now()) {
      return res
        .status(429)
        .json({ message: "You are temporarily banned. Try again later.😒  😒" });
    }

    // Check if code expired
    if (!user.codeExpires || user.codeExpires < Date.now()) {
      return res.status(400).json({ message: "Code expired." });
    }
 
 const match = await bcrypt.compare(code, user.verifyCode);
    // Check code
    if (!match) {
      user.codeTries += 1;

      if (user.codeTries >= 5) {
        user.codeBannedUntil = new Date(Date.now() + 5 * 60 * 1000); // ban for 5 mins
        await user.save();
        return res
          .status(429)
          .json({
            message: "Too many failed attempts. You are banned for 5 minutes 😒  😒.",
          });
      }

      await user.save();
      return res.status(400).json({ message: "Invalid code." });
    }

    // its verry important to clear the code and related fields  the most important thing in verify code  😂👌يا عم حسين متنساش عشان خطري للمره المليون
    user.verifyCode = null;
    user.codeExpires = null;
    user.codeTries = 0;
    user.codeBannedUntil = null;
    user.confirmed = true;
    await user.save();

    return res.status(200).json({ message: "Code verified successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error verifying code", error });
  }
};
export const getprofiledate=async(req,res,next)=>{
const {id}=req.params
const user=await UserModel.findById(id).select(" -password -phone  -createdAt -updatedAt -__v  -codeTries ")
if(!user)return res.status(404).json({message:"User not found"})
  return res.status(200).json({success:true,message:"Profile data",data:user})


}
export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Check if user is banned
    if (user.codeBannedUntil && user.codeBannedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.codeBannedUntil - Date.now()) / (60 * 1000));
      return res.status(429).json({
        message: `You are temporarily banned. Try again in ${minutesLeft} minutes.`,
      });
    }

    // If user has exceeded 5 tries
    if (user.codeTries >= 5) {
      user.codeBannedUntil = new Date(Date.now() + 60 * 60 * 1000); // ban for 1 hour
      user.codeTries = 0;
      await user.save();
      return res.status(429).json({
        message: "Too many OTP requests. You are banned for 1 hour.",
      });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Save hashed OTP and increment tries
    const saltRounds = parseInt(process.env.SOLT_ROUND) || 10;
    user.otp = await bcrypt.hash(otp, saltRounds);
    user.codeExpires = new Date(Date.now() + 2 * 60 * 1000); // expires in 2 mins
    user.codeTries += 1;
    await user.save();

    // ✅ Send email
    await sendEmail({
      to: email,
      subject: "🔐 OTP to reset your password",
      html: `
        <div style="font-family: Arial; background: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; background: white; padding: 30px; margin: auto; border-radius: 10px;">
            <h2>🔐 Password Reset</h2>
            <p>Use the code below to reset your password:</p>
            <h1 style="text-align: center; color: #007bff;">${otp}</h1>
            <p>This code will expire in 2 minutes.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ message: "OTP sent to your email." });

  } catch (error) {
    return res.status(500).json({
      message: "Error while sending OTP",
      error: error.message,
    });
  }
};
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user || !user.otp || !user.codeExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP request" });
    }

    // ✅ Check if code is expired
    if (user.codeExpires < new Date()) {
      user.otp = null;
      user.codeExpires = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // ✅ Compare entered OTP with hashed one
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // ✅ Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SOLT_ROUND) || 8);
    user.password = hashedPassword;

    // ✅ Reset OTP-related fields
    user.otp = null;
    user.codeExpires = null;
    user.codeTries = 0;
    user.codeBannedUntil = null;

    await user.save();

    return res.status(200).json({ message: "✅ Password reset successfully and the password has been  updated" });

  } catch (error) {
    return res.status(500).json({
      message: "❌ Error verifying OTP and resetting password",
      error: error.message
    });
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
// Extract fields from request body  الللي انت بعتهم سواء هتغير ولا لا 
    const { name, gender, phone, image, email } = req.body;

    // ✅ تعديل الإيميل لو اترسل
    if (email && email !== user.email) {
      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
      user.confirmed = false; // لو عايز ترجع تفعيل الإيميل بعد التعديل
    }

    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (image) user.image = image;
    if (phone) user.phone = (phone);

    await user.save();



    const decryptedPhone = user.phone ? CryptoJS.AES.encrypt(
    phone,
    process.env.PHONE_SECRET_KEY
  ).toString() : null;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          ...user.toObject(),
          phone: decryptedPhone,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
      stack: error.stack,
    });
  }
};
export const freezeProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id && req.user.role !== usersRoles.admin) {
      return res.status(403).json({ message: "You are not allowed to freeze other accounts" });
    }

    const user = await UserModel.updateOne(
      {
        _id: id || req.user._id,
        isDeleted: false // 👈 أهم تعديل
      },
      {
        isDeleted: true,
        deletedBy: req.user._id,
        $inc: { __v: 1 }
      }
    );

    user.matchedCount
      ? res.status(200).json({ message: "Profile frozen successfully" })
      : res.status(400).json({ message: "Failed to freeze profile or already frozen" });

  } catch (error) {
    next(error);
  }
};
 export const unfreezeProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id && req.user.role !== usersRoles.admin) {
      throw new Error("You are not allowed to freeze other accounts");
    }

const user = await UserModel.updateOne(
  {
    _id: id || req.user._id,
    isDeleted: true
  },
  {
    $unset: {
      isDeleted: "",
      deletedBy: ""    
    },
    $inc: { __v: 1 }    
  }
); 
    user.matchedCount
      ? res.status(200).json({ message: "Profile unfrozen successfully" })
      : res.status(400).json({ message: "Failed to unfreeze profile or already unfrozen" });
  } catch (error) {
    next(error);
  }
};
export const updateProfileImage = async (req, res, next) => {
  try {
    // هات اليوزر الأول من الداتابيز
    const user = await UserModel.findById(req?.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // لو عنده صورة قديمة امسحها
    if (user?.image?.public_id) {
      await cloudinary.uploader.destroy(user.image.public_id);
    }

    // ارفع الصورة الجديدة
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req?.file?.path,
      { folder: "library/users" }
    );

    // حدّث بيانات اليوزر
    const updatedUser = await UserModel.findByIdAndUpdate(
       req?.user._id,
      { image: { secure_url, public_id } },
      { new: true }
    );


    console.log(req.user);
    

    return res.status(200).json({ message: "success", user: updatedUser });
  } catch (error) {
    next(error);
  }
};
  export const deleteProfileImage = async (req, res, next) => {
    try {
      // هات اليوزر الأول من الداتابيز
      const user = await UserModel.findById(req?.user?._id);
      if (!user) {
        // return res.status(404).json({ message: "User not found" });
        return res.status(404).json({ message: "User not found" });

      }
  
      // لو عنده صورة قديمة امسحها
      if (user?.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }
  
      // حدّث بيانات اليوزر
      const updatedUser = await UserModel.findByIdAndUpdate(
        req?.user._id,
        { image: { secure_url: null, public_id: null } },
        { new: true }
      );
  
  
      return res.status(200).json({ message: "success", user: updatedUser });
    } catch (error) {
      next(error);
    }
  };
  export const getProfileImage = async (req, res, next) => {
    try {
      // هات اليوزر الأول من الداتابيز
      const user = await UserModel.findById(req?.user?._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
       

      // ارجع الصوره بس 
       const image = user?.image?.secure_url

  
      return res.status(200).json({ message: "success", user:{image} });
    } catch (error) {
      next(error);
    } 

  }
  export const getalluser = async (req, res, next) => {
    try {
      const users = await UserModel.find({ isDeleted: false  ,role:{$ne:usersRoles.admin}});
      return res.status(200).json({ message: "success", allusers: {...users} });
    } catch (error) {
      next(error);
    }
  };
  export const getalladmin = async (req, res, next) => {
    try {
      const users = await UserModel.find({ isDeleted: false  ,role:{$ne:usersRoles.user}});
      return res.status(200).json({ message: "success", allusers: {...users} });
    } catch (error) {
      next(error);
    }
  };
  