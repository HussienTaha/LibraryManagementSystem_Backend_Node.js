 import mongoose from "mongoose";
 const transactionSchema =new mongoose.Schema(  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now, // current timestamp
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["borrowed", "returned"],
      required: true,
    },
  },{timestamps:true})
    const TransactionModel= mongoose.models.Transaction || mongoose.model('Transaction',transactionSchema)
    export default TransactionModel