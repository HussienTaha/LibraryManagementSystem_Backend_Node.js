import RevokedTokenModel from "../DB/models/revokedToken.model.js";
import UserModel from "../DB/models/user.model.js";
import jwt from "jsonwebtoken";
export const authantcation = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [prefix, token] = authorization.split(" ") || [];
    if (!prefix || !token) {
      return res
        .status(401)
        .json({ message: "Invalid authorization header format", status: 401 });
    }
    let segnature = "";
    if (prefix == "bearer") {
      segnature = process.env.USER_ACCESS_TOKEN_KEY;
    } else if (prefix == "admin") {
      segnature = process.env.ADMIN_ACCESS_TOKEN_KEY;
    } else {
      return res
        .status(401)
        .json({ message: "Invalid token prefix", status: 401 });
    }
    console.log(segnature);

    const decoded = jwt.verify(token,segnature);
    console.log(decoded);
    
    console.log(segnature);
    console.log(decoded);
    const revoked = await RevokedTokenModel.findOne({ tokenId: decoded.jti });
    if (revoked) {
      return res.status(400).json({
        message: "Token has been revoked please login again",
        status: 400,
      });
    }

    const user = await UserModel.findById(decoded.userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user?.confirmed ) {
      return res
        .status(401)
        .json({ message: "User not confirmed or is deleted" });
    }
    req.user = user;
    req.decoded = decoded;
    next();
  } catch (error) {
    if (
      error.message === "jwt expired" ||
      error.message === "invalid signature" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ message: "Invalid token" ,stack: error.stack });
    }
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
