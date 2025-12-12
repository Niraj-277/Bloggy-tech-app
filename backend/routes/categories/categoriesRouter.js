const express= require('express');

const {createCategory, getAllCategories, deleteCategory, updateCategory}=require('../../controllers/categories/categoriesController')
const isLoggedIn=require("../../middlewares/isLoggedIn");

const categoriesRouter=express.Router();
//! Create Category route
categoriesRouter.post("/",isLoggedIn,createCategory);

//! Fetch all Categories route
categoriesRouter.get("/",getAllCategories)

//! delete a Category route
categoriesRouter.delete("/:id",isLoggedIn,deleteCategory)

//! update a Category route
categoriesRouter.put("/:id",isLoggedIn,updateCategory)

module.exports=categoriesRouter;