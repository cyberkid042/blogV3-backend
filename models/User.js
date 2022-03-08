const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    email: {
      required: [true, "The email field is required"],
      type: String,
      unique: [true, "The provided email already exists"],
    },
    username: {
      required: [true, "The username field is required"],
      type: String,
      unique: [
        true,
        "Username already exists. Choose a different username or login",
      ],
    },
    firstName: {
      required: [true, "The first name field is required"],
      type: String,
    },
    lastName: {
      required: [true, "The last name field is required"],
      type: String,
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    bio: {
      type: String,
    },
    password: {
      required: [true, "The password field is required"],
      type: String,
      minlength: [8, "Password must be at least 8 characters long"],
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Blogger"],
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    isUnFollowing: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      unique: true,
    },
    emailVerificationCode: {
      type: String,
      unique: true,
    },
    viewedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    followers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    passwordChangedAt: Date,
    passwordResetToken: { type: String, unique: true },
    isActive: {
      type: Boolean,
      default: false,
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "author",
  localField: "_id",
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
