const express = require("express")
const { format } = require("date-fns")
require("dotenv").config({ path: "./.env" })
const cors = require("cors")
const connectedDb = require("./config/db")
const { log, logEvent } = require("./meddleware/logger")
const mongoose = require("mongoose")
const { errorHandler } = require("./meddleware/error")
// const { path } = require("pdfkit")
const cookieParser = require("cookie-parser")
const app = express()
const path = require("path")
connectedDb()
app.use(express.json())
app.use(express.static("public"))
app.use(express.static("build"))
// app.use(express.static(path.json(__dirname,"build")))
// app.use(express.static(path.json(__dirname,"public")))
app.use(log)
app.use(cors({
    credentials: true,
    origin: (o, cb) => {

        const allowed = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            // "https://easy-pear-bunny-wig.cyclic.app/"
        ]
        if (allowed.indexOf(o) !== -1 || !o) {
            cb(null, true)
        } else {
            cb("blocked by cors")
        }
    }
}))
app.use(cookieParser())
app.use("/api/user", require("./routes/userRoutes"))
app.use("/api/cart", require("./routes/cartRoutes"))
app.use("/api/order", require("./routes/orderRoutes"))
app.use("/api/employee", require("./routes/employeeRoutes"))
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/products", require("./routes/productRoutes"))

app.use("*", (req, res) => {
   res.sendFile(path.join(__dirname, "build/index.html"))
   
    // res.status(404).json({
    //     message: "404 Resource You Are Looking For Is Not Available"
    // })'
    // varshu
})
app.use(errorHandler)
const PORT = process.env.PORT || 5000
mongoose.connection.once("open", () => {

    app.listen(PORT, console.log(`SERVER RUNNING http://localhost:${PORT}`))
    console.log("Mongo Connected");
})
mongoose.connection.on("error", err => {
    const msg = `${format(new Date(), "dd-MM-yyy \t HH:mm:ss")}\t${err.code}\t${err.name}`
    logEvent({
        fileName: "mongo.log",
        message: msg
    })
})