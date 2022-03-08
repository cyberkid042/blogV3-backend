const Post = require("../models/Post");
const Profane = require("bad-words");
const mongoose = require("mongoose");
const User = require("../models/User");

//admin routes

//logged in users
const submitPost = async (req, res) => {
  const { title, body, category, postImage } = req?.body;
  const profane = new Profane();
  const isProfane = profane.isProfane(title, body);

  try {
    if (isProfane)
      return res.status(403).json("Profane words are not allowed!");

    await Post.create({
      title,
      body,
      category,
      author: req?.user?._id,
      postImage,
    });

    res.status(201).json("Post created successfully!");
  } catch (error) {
    res.status(500).json({ error: error.name, message: error.message });
  }
};

const updatePost = async (req, res) => {
  const { postId, title, category, body, postImage } = req?.body;

  try {
    await Post.findByIdAndUpdate(
      postId,
      { title, category, body, postImage },
      { new: true }
    );

    res.status(200).json("Post has been updated successfully!");
  } catch (error) {
    res.status(500).json(error);
  }
};

const deletePost = async (req, res) => {
  const { postId } = req?.body;
  const isValid = mongoose.Types.ObjectId.isValid(postId);

  try {
    if (!isValid)
      return res
        .status(500)
        .json("There was an error processing the request. Please try again.");

    await Post.findByIdAndDelete(postId);

    res.status(200).json("The post was successfully deleted.");
  } catch (error) {
    res.status(500).json(error);
  }
};

const likeOrDislikePost = async (req, res) => {
  const { postId } = req?.body;
  const isIdValid = mongoose.Types.ObjectId.isValid(postId);

  try {
    if (!isIdValid) return res.status(500).json("The Post Id is not valid");
    const post = await Post.findById(postId);

    var alreadyLiked = false;

    await post.likes.forEach((element) => {
      if (element.toString().includes(req?.user?.id)) {
        alreadyLiked = true;
      }
    });

    if (alreadyLiked) {
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: {
            likes: req?.user?._id,
          },
        },
        { new: true }
      );

      res.status(201).json("You disliked this post.");
    } else {
      await Post.findByIdAndUpdate(
        postId,
        {
          $push: {
            likes: req?.user?._id,
          },
        },
        { new: true }
      );

      res.status(201).json("You liked this post.");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req?.query;

  try {
    const user = await User.findOne({ username: username });
    const posts = await Post.find({ author: user._id })
      .sort({ _id: -1 })
      .populate("author", "username profilePicture");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

//Guests and all users
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ _id: -1 })
      .populate("author", "username profilePicture");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getSinglePost = async (req, res) => {
  const { id } = req?.query;
  const isIdValid = mongoose.Types.ObjectId.isValid(id);

  try {
    if (!isIdValid) return res.status(500).json("The Post Id is not valid");

    const post = await Post.findById(id)
      .populate("author", "username profilePicture")
      .populate("likes", "username");

    if (!post) return res.status(404).json("No Post found. Please try again.");

    await Post.findByIdAndUpdate(
      post.id,
      {
        $inc: {
          numberOfViews: 1,
        },
      },
      { new: true }
    );
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  submitPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  likeOrDislikePost,
  getUserPosts,
};
