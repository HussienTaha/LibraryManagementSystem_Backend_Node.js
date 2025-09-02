
 import mongoose from "mongoose" 
import chalk from "chalk"
  const  chickDBconnection = async()=>{
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log(chalk.bgGreen('✅ DB connected successfully..............❤️  😎 👌'))
    } catch (error) {
        console.log(chalk.bgRed('❌ DB connection failed..........❤️  😎',error.message))   
    }
  }



    export default chickDBconnection
