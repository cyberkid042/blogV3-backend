const router = require("express").Router();
const {
  register,
  login,
  confirmEmail,
  resendEmailVerificationLink,
  resetPassword,
  newPassword,
} = require("../controllers/authController");

//Register Route
router.post("/", register);

//Login Route
router.post("/login", login);

//email confirmation route
router.get("/confirm-email", confirmEmail);

//reset email confirmation link
router.get("/resend-confirmation", resendEmailVerificationLink);

//send password reset link
router.get("/password-reset", resetPassword);

//generate and send new password
router.get("/new-password/:token", newPassword);
// router.get("/confirm", verifyEmail);
module.exports = router;
