const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send("User not found");
    }

    const photos = await Photo.find({ user_id: userId });

    const result = await Promise.all(
      photos.map(async (photo) => {
        const comments = await Promise.all(
          photo.comments.map(async (cmt) => {
            const cmtUser = await User.findById(
              cmt.user_id,
              "_id first_name last_name"
            );

            return {
              _id: cmt._id,
              comment: cmt.comment,
              date_time: cmt.date_time,
              user: cmtUser,
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: comments,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(400).send("Invalid user id");
  }
});

module.exports = router;
