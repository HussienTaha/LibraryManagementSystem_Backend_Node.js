// import TransactionModel from "./transaction.model.js";
// import BookModel from "../book/book.model.js";

import Bookmodel from "../../DB/models/book.model.js";
import TransactionModel from "../../DB/models/transaction.model.js";

export const borrowBookService = async (req,res,next) => {
  try {


    const { userId, bookId } = req.body;

  // check if book exists
  const book = await Bookmodel.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // check available copies
  if (book.availableCopies <= 0) {
 return res.status(400).json({ message: "Book is not available" });
  }

  // create transaction
  const transaction = await TransactionModel.create({
    userId,
    bookId,
    status: "borrowed",
  });

  // update available copies
  book.availableCopies -= 1;
  await book.save();
  
return res.status(200).json({ message: "Book borrowed successfully", transaction });

    
  } catch (error) {
   return res.status(500).json({ message: "Server error ", error: error.message, stack: error.stack }); 
  }
};


export const returnBookService = async (req,res,next) => {
  try {
    const { userId, bookId } = req.body;

  // check if transaction exists
  const transaction = await TransactionModel.findOne({
    userId,
    bookId,
    status: "borrowed",
  });

  if (!transaction) {
    return res.status(404).json({ message: "No borrowed transaction found for this book and user" });
  }

  // update transaction status and set returnDate
  transaction.status = "returned";
  transaction.returnDate = new Date();
  await transaction.save();

  // update book available copies
  const book = await Bookmodel.findById(bookId);
  if (!book) throw new Error("Book not found");

  book.availableCopies += 1;
  await book.save();


  return res.status(200).json({ message: "Book returned successfully", transaction });
  } catch (error) {
     return res.status(500).json({ message: "Server error", error: error.message, stack: error.stack });
    
  }
};


export const getAllTransactionService = async (req,res,next) => {
  try {
    const transactions = await TransactionModel.find();
    return res.status(200).json({ message: "success get all transactions", transactions });
  } catch (error) {
    next(error);
  }
};