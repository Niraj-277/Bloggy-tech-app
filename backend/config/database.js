const mongoose=require("mongoose");

const connectDB=async ()=>{
    try{await mongoose.connect(process.env.MONGO_URL);
    console.log("connected successfully to mongodb");}
    catch(error){
        console.log("connection to mongodb failed",error.message);
    }
};
module.exports= connectDB;



