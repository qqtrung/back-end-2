const express = require("express");
const Photo = require("../db/photoModel");

const router = express.Router();

// Trả về danh sách các bình luận của 1 người dùng nào đó 
// Bao gồm 
// ID 
// Nội dung bình luận 
// Ngày tháng bình luận 
// Ảnh : ID , Tên ảnh 

router.get("/:userId", async (req, res) => {
  try {

    const userId = req.params.userId;
    const photos = await Photo.find({});
    const result = [];

    photos.forEach((photo) => {
      photo.comments.forEach((cmt) => {
        if (cmt.user_id.toString() === userId.toString()) {
          result.push({
            _id: cmt._id,
            comment: cmt.comment,
            date_time: cmt.date_time,
            photo: {
              _id: photo._id,
              file_name: photo.file_name,
            },
          });
        }
      });
    });

    res.json(result);
  } catch (err) {
    res.status(400).send("Error fetching comments");
  }
});

module.exports = router;
