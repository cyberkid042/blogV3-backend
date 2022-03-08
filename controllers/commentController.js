const mongoose = require("mongoose");
const Comment = require("../models/Comment");

const addComment = async (req, res) => {
  const { comment, postId } = req?.body;
  const isValidId = mongoose.Types.ObjectId.isValid(postId);

  try {
    if (!isValidId)
      return res
        .status(500)
        .json("There was an error creating the comment on this post.");

    await Comment.create({
      comment,
      post: postId,
      user: req?.user?._id,
    });

    res.status(201).json("Your comment was created successfully.");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort("-1");

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const updateComment = async (req, res) => {
  const { comment, commentId } = req?.body;
  const isValidId = mongoose.Types.ObjectId(commentId);

  try {
    if (!isValidId) return res.status(500).json("The comment Id is not valid.");

    await Comment.findByIdAndUpdate(
      commentId,
      {
        comment,
      },
      {
        new: true,
      }
    );

    res.status(200).json("Your comment has been updated.");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req?.body;
  const isValidId = mongoose.Types.ObjectId(commentId);

  try {
    if (!isValidId) return res.status(500).json("The comment Id is not valid");

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json("Your comment has been deleted.");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = { addComment, getAllComments, updateComment, deleteComment };
