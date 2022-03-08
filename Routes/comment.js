const {
  addComment,
  getAllComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const {
  verifyToken,
  verifyTokenAndIsAdmin,
  verifyTokenAndAuthorize,
} = require("../middlewares/authorization");

const router = require("express").Router();

router.post("/create", verifyToken, addComment);
router.get("/", verifyTokenAndIsAdmin, getAllComments);

router.put("/update-comment", verifyTokenAndAuthorize, updateComment);
router.delete("/delete-comment", verifyTokenAndAuthorize, deleteComment);

module.exports = router;
