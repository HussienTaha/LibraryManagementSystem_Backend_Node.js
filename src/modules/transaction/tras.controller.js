import { Router } from "express";
import * as US from "./tras.service.js"
import { authantcation } from "../../middleware/authantcation.js";
import { authorization } from "../../middleware/authorization.js";
import { usersRoles } from "../../DB/models/user.model.js";
 const transactionRouter = Router()

 transactionRouter.post("/borrowBookService" ,authantcation,US.borrowBookService)
 transactionRouter.post("/returnBookService",authantcation,US.returnBookService)
 transactionRouter.get("/getalltransaction",authantcation,authorization([usersRoles.admin]),US.getAllTransactionService)
 
  


 export default transactionRouter