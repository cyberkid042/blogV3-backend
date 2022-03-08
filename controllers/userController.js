const mongoose = require("mongoose");
const User = require("../models/User");

//admin functions
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getASingleUser = async (req, res) => {
  const userId = req?.params?.id;
  const isIdValid = mongoose.Types.ObjectId.isValid(userId);

  try {
    if (isIdValid) {
      const user = await User.findById(userId).select("-password");
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteAUser = async (req, res) => {
  const userId = req?.params?.id;
  const isIdValid = mongoose.Types.ObjectId.isValid(userId);

  try {
    if (isIdValid) {
      await User.findByIdAndDelete(userId);

      res.status(200).json("User Successfully deleted!");
    } else {
      res.status(500).json("No User found with the given id!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const blockAndUnblockAUser = async (req, res) => {
  const userId = req?.params?.id;
  const isIdValid = mongoose.Types.ObjectId.isValid(userId);

  try {
    if (isIdValid) {
      const user = await User.findById(userId);

      if (!user)
        return res.status(500).json("No User found with the given id!");

      if (!user.isBlocked) {
        await User.findByIdAndUpdate(
          userId,
          { isBlocked: true },
          { new: true }
        );

        return res.status(200).json("User Successfully blocked!");
      }

      await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });

      res.status(200).json("User Successfully unBlocked!");
    } else {
      res.status(500).json("No User found with the given id!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//other routes

const userProfile = async (req, res) => {
  const { username } = req?.query;

  try {
    const user = await User.findOne({ username: username })
      .select("username profilePicture isBlocked followers following")
      .populate({ path: "posts", options: { sort: { createdAt: -1 } } });

    if (!user)
      return res.status(500).json("A User With the Given ID was not found!");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

const followAndUnFollowAUser = async (req, res) => {
  const { userToFollowId } = req?.body; //Id of user that is to be followed

  try {
    const loggedInUser = req?.user;

    const user = await User.findOne({ username: userToFollowId });
    if (!user)
      return res.status(500).json("The Requested user does not exist!");

    var alreadyFollowed = false; //To prevent nodejs http headers sent error.

    await user?.followers?.forEach((element) => {
      if (element.toString().includes(loggedInUser._id.toString()))
        alreadyFollowed = true;
    });

    if (alreadyFollowed) {
      //unfollow the user
      await User.findByIdAndUpdate(
        loggedInUser._id,
        {
          $pull: { following: user._id },
        },
        { new: true }
      );

      await User.findByIdAndUpdate(
        user._id,
        {
          $pull: { followers: loggedInUser._id },
        },
        { new: true }
      );

      res.status(200).json(`You are now unfollowing ${user.username}`);
    } else {
      // follow the user
      await User.findByIdAndUpdate(
        loggedInUser._id,
        {
          $push: { following: user._id },
        },
        { new: true }
      );

      await User.findByIdAndUpdate(
        user._id,
        {
          $push: { followers: loggedInUser._id },
        },
        { new: true }
      );

      res.status(200).json(`You are now following ${user.username}`);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const uploadProfilePhoto = async (req, res) => {
  const { profilePicture } = req?.body;

  try {
    if (req?.user) {
      if (!profilePicture)
        return res.status(500).json("Profile photo cannot be empty");

      await User.findByIdAndUpdate(
        req?.user?._id,
        { profilePicture },
        { new: true }
      );

      res.status(200).json("Profile picture updated successfully!");
    } else {
      res.status(401).json("Please authenticate first, then try again!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getUsers,
  deleteAUser,
  getASingleUser,
  userProfile,
  followAndUnFollowAUser,
  blockAndUnblockAUser,
  uploadProfilePhoto,
};
