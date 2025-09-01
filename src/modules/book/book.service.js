import Bookmodel from "../../DB/models/book.model.js";

// create book
export const createBook = async (req, res, next) => {


try {
      const { title, author, pupisherYear, availableCopies } = req.body;



  const book = await Bookmodel.create({
    title,
    author,
    pupisherYear,
    availableCopies,
   createdBy:req.user._id,
   createdwith:req.user.name
  });

  return res.status(201).json({ message: "Book created successfully", book });

    
} catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message, stack: error.stack });
    
}


}
export const getallbook = async (req, res, next) => {
  try {
    const books = await Bookmodel.find({ isDeleted: false }).populate([{
      path:"createdBy",
      select:"name email"
    }]).lean();
    return res.status(200).json({ message: "success", allbooks: {...books} });
  } catch (error) {
    next(error);
  }
}; 
export const getbook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Bookmodel.findById(id).populate([{
      path:"createdBy",
      select:"name email"
    }]).lean();;
    return res.status(200).json({ message: "success", book });
  } catch (error) {
    next(error);
  }
} 
export const deletebook = async (req, res, next) => {
  try {
    const { id } = req.params;

   const thisbook = await Bookmodel.findById(id);
console.log(thisbook);


    if (!thisbook) {
      return res.status(404).json({ message: "Book not found" });
    }


    const book = await Bookmodel.updateOne({ _id: id }, { isDeleted: true , deletedBy:req.user._id});
    return res.status(200).json({ message: "success deleted this book", book: {...book} });
  } catch (error) {
    next(error);
  }
}
export const updatebook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, pupisherYear, availableCopies } = req.body;


    const book = await Bookmodel.findOne({ _id: id });
     if( !book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if(title) book.title = title;
    if(author) book.author = author;
    if(pupisherYear) book.pupisherYear = pupisherYear;
    if(availableCopies) book.availableCopies = availableCopies;
    await book.save();
    return res.status(200).json({ message: "success updated this book", book });
  } catch (error) {
    next(error);
  }
}