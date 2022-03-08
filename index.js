const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const AuthRoutes = require("./Routes/auth");
const UserRoutes = require("./Routes/user");
const PostRoutes = require("./Routes/post");
const CommentRoutes = require("./Routes/comment");

//DB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connection established");
  })
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cors());

app.use("/api/auth", AuthRoutes); //auth Routes
app.use("/api/users", UserRoutes); //user Routes
app.use("/api/posts", PostRoutes); //post Routes
app.use("/api/comment", CommentRoutes); //comment Routes

//server connection
app.listen(5000, () => {
  console.log("Server started successfully");
});
