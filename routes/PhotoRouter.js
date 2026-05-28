const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

const router = express.Router();

// Trả về ảnh của người dùng 
// Bao gồm các thông tin sau 
// Thuộc tính của ảnh phải là (_id, user_id, comments, file_name, date_time) 
// và các phần tử trong mảng comments phải có (comment, date_time, _id, user) 
// và chỉ thông tin tối thiểu về đối tượng người dùng (_id, first_name, last_name)

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).send("User not found");
    }

    // Lấy toàn bộ ảnh của user
    const photos = await Photo.find({ user_id: userId });

    const result = [];

    // Duyệt từng ảnh
    for (const photo of photos) {

      const comments = [];

      // Duyệt từng comment trong cái ảnh đó 
      for (const cmt of photo.comments) {

        // Lấy thông tin user của comment
        const cmtUser = await User.findById(
          cmt.user_id,
          "_id first_name last_name"
        );

        comments.push({
          _id: cmt._id,
          comment: cmt.comment,
          date_time: cmt.date_time,
          user: cmtUser,
        });
      }

      result.push({
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: comments,
      });
    }

    res.json(result);

  } catch (err) {
    res.status(400).send("Invalid user id");
  }
});

module.exports = router;

