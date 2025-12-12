const nodemailer=require("nodemailer");

const dotenv=require("dotenv");

//load dotenv into process object
dotenv.config();

const sendEmail=async(to,resetToken)=>{
    try {
        //create a transport object
        const transport=nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            auth:{
                user:process.env.GMAIL_USER,
                pass:process.env.APP_PWD,
            }
        });
        //CREATE THE MESSAGE TO BE SENT
       const message={
        to,
        subject:"Password Reset Token",
        html:`<p>You are receiving this email because you (or someone else)have requested of the pw</p>
        <p> Please click on the following link, or paste into your browser to complete your process<p/><p>https://localhost:3000/reset-password/${resetToken}</p>
        <p>If you did not request this, please ignore this email and password will be same`
       };
       //now we are going to send the mail
       const info=await transport.sendMail(message);
       console.log("Email sent",info.messageId);
    }catch(error){
        console.log(error);
        throw new Error("Email sending failed");
    }
}
module.exports=sendEmail;