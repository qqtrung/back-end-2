const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {

    // Chúng ta chỉ trả về danh sách các trường 
    // ID FIRST_NAME LAST_NAME mà thôi 
    // Chúng ta không cần trả về tất cả vì 
    // Trong đề bảo là số lượng người dùng nhiều nên chỉ trả về cái đó thôi 

    const users = await User.find({}, "_id first_name last_name");

    const result = await Promise.all(
      users.map(async (user) => {
        const photoCount = await Photo.countDocuments({
          user_id: user._id,
        });

        const photos = await Photo.find({
          "comments.user_id": user._id,
        });

        let commentCount = 0;
        photos.forEach((photo) => {
          photo.comments.forEach((cmt) => {
            if (cmt.user_id.toString() === user._id.toString()) {
              commentCount++;
            }
          });
        });

        return {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          photoCount,
          commentCount,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Trả về thông tin của người dùng đó ở tất cả các trường 

router.get("/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
    const projection = "_id first_name last_name location description occupation";

    const user = await User.findById(userId, projection);
    if (!user) {
      res.status(400).send("Invalid UserId");
      return;
    }

    res.json(user);
  }

  catch {
    res.status(400).send("Invalid UserId");
  }

})

module.exports = router;
