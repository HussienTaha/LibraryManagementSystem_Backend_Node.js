import dotenv from 'dotenv'
import path from 'path'
dotenv.config({path:path.resolve('src/config/.env')})
import express from 'express'
import helmet from 'helmet'
import bootstrap from './src/app.controller.js'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
const app = express()
app.use(limiter)
app.use(morgan('combined'))
app.use(helmet())
const port = process.env.PORT || 5000
bootstrap(app,express)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))



