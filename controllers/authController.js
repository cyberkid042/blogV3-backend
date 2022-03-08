const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generatePassword = require("generate-password");
const mongoose = require("mongoose");
const {
  sendConfirmationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewPassword,
} = require("../mailer.config");

//register user
const register = async (req, res) => {
  const { firstName, lastName, pass, username, email } = req?.body;

  try {
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });
    const token = await jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    if (userExists) {
      res
        .status(500)
        .json("A user with the specified email or username already exists");
    } else {
      const user = await User.create({
        firstName,
        lastName,
        password: pass,
        username,
        email,
        emailVerificationCode: token,
      });

      res
        .status(201)
        .json(
          "Your account has been created successfully. Please check your email for confirmation!"
        );

      sendConfirmationEmail(
        user.username,
        user.email,
        user.emailVerificationCode
      );
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//confirm user email
const confirmEmail = async (req, res) => {
  const { token } = req?.query;

  try {
    var jwtFail = false;
    await jwt.verify(token, process.env.JWT_SECRET, (error) => {
      if (error) jwtFail = true;
    });

    if (jwtFail) {
      res
        .status(500)
        .json(
          "The verification link is not valid. Please try request a new link!"
        );
    } else {
      const user = await User.findOne({ emailVerificationCode: token });

      if (!user)
        return res
          .status(404)
          .json("The provided verification code was not found");

      if (user.isVerified)
        return res
          .status(403)
          .json("Your account is already verified. Login instead!");

      user.isVerified = true;
      user.emailVerificationCode = undefined;

      await user.save((error) => {
        if (error) return res.status(500).json(error);

        res.status(200).json("Your email has been verified successfully!");
      });

      sendWelcomeEmail(user.username, user.email);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//Resend verification email to user
const resendEmailVerificationLink = async (req, res) => {
  const { username } = req?.query;
  try {
    //generate token
    const token = await jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    //check if user email or username exists
    const user = await User.findOne({ username });

    if (!user)
      return res
        .status(404)
        .json("No user found with the provided information. Please try again!");

    if (user.isVerified)
      return res
        .status(403)
        .json("Your account is already verified. Login instead!");

    user.emailVerificationCode = token;

    await user.save((error) => {
      if (error) return res.status(500).json(error);

      res
        .status(200)
        .json(
          "A new verification email has been sent to you. Please follow the instructions included in the email!"
        );
    });

    sendConfirmationEmail(
      user.username,
      user.email,
      user.emailVerificationCode
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

//log user in
const login = async (req, res) => {
  const { username, password } = req?.body;
  try {
    const user = await User.findOne({
      $or: [{ email: username }, { username: username }],
    });

    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);

      if (validPassword) {
        // if (user.isVerified === false)
        //   return res
        //     .status(401)
        //     .json("Please verify your email address to continue!");

        if (user.isBlocked)
          return res
            .status(403)
            .json(
              "You cannot continue because you have been blocked. Please contact an administrator"
            );

        // Create token
        const token = await jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "6h",
          }
        );

        const detailsToSend = {
          _id: user._id,
          isVerified: user.isVerified,
          username: user.username,
          profilePicture: user.profilePicture,
          isAdmin: user.isAdmin,
          token: token,
        };

        res.status(200).json(detailsToSend);
      } else {
        res
          .status(401)
          .json({ error: "Invalid Username or Password Provided" });
      }
    } else {
      res
        .status(401)
        .json({ error: "No user found with the provided credentials" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//update user password
const updateUserPassword = async (req, res) => {
  const { _id } = req?.user;
  const isIdValid = mongoose.Types.ObjectId.isValid(_id);

  try {
    if (!isIdValid)
      return res.status(500).json("The Requested user does not exist!");

    const { password } = req?.body;

    const user = await User.findById(_id);

    user.password = password;
    await user.save();

    res.status(200).json("Password successfully updated!");
  } catch (error) {
    res.status(500).json(error);
  }
};

//send password reset email
const resetPassword = async (req, res) => {
  const { userEmailOrUsername } = req?.body;

  try {
    const token = await jwt.sign(
      { userEmailOrUsername },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    //check if user email or username exists
    const user = await User.findOne({
      $or: [{ email: userEmailOrUsername }, { username: userEmailOrUsername }],
    });

    if (!user)
      return res
        .status(404)
        .json("No user found with the provided information. Please try again!");

    user.passwordResetToken = token;

    await user.save((error) => {
      if (error) return res.status(500).json(error);

      res.status(200).json("A password reset email has been sent to you!");
    });

    sendPasswordResetEmail(user.username, user.email, user.passwordResetToken);
  } catch (error) {
    res.status(500).json(error);
  }
};

const newPassword = async (req, res) => {
  const { token } = req?.params;

  var pass = generatePassword.generate({
    length: 12,
    numbers: true,
    symbols: true,
  });

  try {
    await jwt.verify(token, process.env.JWT_SECRET, (error) => {
      if (error)
        return res
          .status(500)
          .json(
            "The verification link is not valid. Please try requesting a new link!"
          );
    });

    const user = await User.findOne({ passwordResetToken: token });

    if (!user)
      return res
        .status(404)
        .json("The provided verification code was not found");

    user.password = pass;
    user.passwordResetToken = undefined;

    await user.save((error) => {
      if (error) return res.status(500).json(error);

      res.status(200).json("Password successfully updated!");
    });

    sendNewPassword(user.username, user.email, pass);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  register,
  login,
  updateUserPassword,
  confirmEmail,
  resendEmailVerificationLink,
  resetPassword,
  newPassword,
};

// await User.findByIdAndUpdate(
//   _id,
//   { password },
//   { new: true, runValidators: true }
// );
