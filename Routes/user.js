const { updateUserPassword } = require("../controllers/authController");
const {
  getUsers,
  deleteAUser,
  getASingleUser,
  userProfile,
  followAndUnFollowAUser,
  blockAndUnblockAUser,
  uploadProfilePhoto,
} = require("../controllers/userController");
const {
  verifyTokenAndIsAdmin,
  verifyToken,
  verifyTokenAndAuthorize,
} = require("../middlewares/authorization");

const router = require("express").Router();

//Regular Routes
router.get("/profile", userProfile); //get a user profile
router.put("/profile/:id", verifyToken, updateUserPassword); //update a user profile (Password)
router.put("/follow", verifyToken, followAndUnFollowAUser); //follow and unfollow a user
router.get("/upload-photo", verifyTokenAndAuthorize, uploadProfilePhoto); //upload a profile photo

//Admin Routes
router.get("/", verifyTokenAndIsAdmin, getUsers); //get All users
router.get("/:id", verifyTokenAndIsAdmin, getASingleUser); //get single user
router.delete("/:id", verifyTokenAndIsAdmin, deleteAUser); //delete a user
router.put("/block/:id", verifyTokenAndIsAdmin, blockAndUnblockAUser);

module.exports = router;
