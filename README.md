Blog Backend API








A RESTful backend API for a blogging platform built using Node.js, Express, and MongoDB.
Developed as a hands-on backend learning project by implementing concepts from the ScaLive (Scaler) YouTube backend series, focusing on real-world backend practices.

Features

User authentication and authorization using JWT

Secure password hashing with bcrypt

CRUD operations for blog posts

Protected routes using middleware

Clean REST API structure

Tech Stack

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Auth & Security: JWT, bcryptjs

Tools: Git, Postman, dotenv, Nodemon

API Highlights

POST /api/auth/register – Register user

POST /api/auth/login – Login & token generation

POST /api/blogs – Create blog (Protected)

GET /api/blogs – Fetch all blogs

PUT /api/blogs/:id – Update blog (Protected)

DELETE /api/blogs/:id – Delete blog (Protected)

What I Learned

Designing scalable REST APIs

JWT-based authentication

Express middleware flow

MongoDB schema design with Mongoose
