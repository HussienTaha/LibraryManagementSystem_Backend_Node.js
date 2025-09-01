import { Router } from "express";
import * as US from "./book.service.js"
import { authantcation } from "../../middleware/authantcation.js";
import { vaildation } from "../../middleware/vaildation.js";
import { createBookValidation } from "./book.vaildation.js";
import { authorization } from "../../middleware/authorization.js";
import { usersRoles } from "../../DB/models/user.model.js";

const bookRouter = Router({ caseSensitive: true, strict: true })
    // only admin can create book or delete or do any thing 😒👌😂😂😂😂😂
bookRouter.post("/createbook",vaildation(createBookValidation),  authantcation, authorization([usersRoles.admin]),US.createBook)
bookRouter.get("/getallbook", authantcation,authorization([usersRoles.admin]), US.getallbook)
bookRouter.get("/getbook/:id", authantcation, authorization([usersRoles.admin]),US.getbook)
bookRouter.delete("/deletebook/:id", authantcation, authorization([usersRoles.admin]),US.deletebook)
bookRouter.patch("/updatebook/:id",vaildation(createBookValidation) ,authantcation, authorization([usersRoles.admin]),US.updatebook)




export default bookRouter