const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
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

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );

    if (!user) {
      return res.status(400).send("User not found");
    }

    res.json(user);
  } catch (err) {
    res.status(400).send("Invalid user id");
  }
});

router.post("/", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).send("Error creating user");
  }
});

// test xem su thay doi tren git

module.exports = router;
