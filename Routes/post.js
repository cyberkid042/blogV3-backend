const {
  submitPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  likeOrDislikePost,
  getUserPosts,
} = require("../controllers/postController");
const {
  verifyToken,
  verifyTokenAndAuthorize,
} = require("../middlewares/authorization");

const router = require("express").Router();

router.post("/create", verifyToken, submitPost);
router.get("/", getAllPosts);
router.get("/user-posts", getUserPosts);
router.get("/post", getSinglePost);

router.delete("/", verifyTokenAndAuthorize, deletePost);
router.put("/", verifyTokenAndAuthorize, updatePost);

router.put("/like-post", verifyToken, likeOrDislikePost);

module.exports = router;
