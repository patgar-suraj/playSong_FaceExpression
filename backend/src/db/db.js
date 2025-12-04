const mongoose = require("mongoose")

function connectDB(){
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("connected to db")
    })
    .catch((err)=>{
        console.log("error on connecting db", err)
    })
}

module.exports = connectDB