import chickDBconnection from "./DB/connection.js"
import bookRouter from "./modules/book/book.controller.js"
import transactionRouter from "./modules/transaction/tras.controller.js"
import userRouter from "./modules/users/user.controller.js"


 const bootstrap= async( app,express)=>{
    app.use(express.json())
    app.get('/', (req, res) => {
       return res.status(200).json({ message:'welcome to library management system ❤️👌'})
      })
      chickDBconnection()
app.use("/users",userRouter)
app.use("/books",bookRouter)
app.use("/trans", transactionRouter)



    //  handel undefined url
    app.use("{/*demo}",(req,res,next)=>{
        res.status(404).json({message:`url not found ${req.originalUrl}`,status:404})
    })
    // global error handelr
    app.use((err,req,res,next)=>{
 return res.status(err["cause"]|| 500).json({
        message:err.message || "internal server error",
        status:err.status || 500,
        stack:err.stack || "internal server error", 
    })
 })}
 
 export default bootstrap