const express = require ('express')
const dotenv=require('dotenv');
const usersRouter=require("./routes/users/usersRouter")
const connectDB=require("./config/database");
const { notFound, globalErrorHandler } = require('./middlewares/globalErrorHandler');
const categoriesRouter = require('./routes/categories/categoriesRouter');
const postsRouter = require('./routes/posts/postsRouter');
const commentRouter = require('./routes/comments/commentsRouter');
const commentsRouter = require('./routes/comments/commentsRouter');
const sendEmail = require('./utils/sendEmail');

//! create an express app

const app =express();

//! load the environment variable 
dotenv.config();
//!establish connection to mongodb 
connectDB();

//! set up the middleware
app.use(express.json());

//! setup the User Router 
app.use("/api/v1/users",usersRouter);

//!setup the Category Router

app.use("/api/v1/categories",categoriesRouter);

//!setup the Post Router
app.use("/api/v1/posts",postsRouter);

//!setup the comment Router
app.use("/api/v1/comments",commentsRouter);

//! Not Found error Handler
app.use(notFound);

//!setup the global handler
app.use(globalErrorHandler);

const PORT=process.env.PORT||9080;

app.listen(PORT,()=>{
    console.log(`server Started at ${PORT}`)
});

