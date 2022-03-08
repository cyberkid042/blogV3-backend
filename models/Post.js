const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "The post title is required"],
      unique: [true, "A post with this title already exists!"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "The post body is required"],
    },
    category: {
      required: [true, "The post category is required"],
      type: String,
      default: "All",
    },
    numberOfViews: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "The post author is required"],
    },
    postImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2016/10/25/23/54/not-found-1770320_960_720.jpg",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
