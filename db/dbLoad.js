const mongoose = require("mongoose");
const dbConnect = require("../db/dbConnect.js");

require("dotenv").config();

const models = require("../modelData/models.js");

const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {

  await dbConnect();

  await User.deleteMany({});
  await Photo.deleteMany({});
  await SchemaInfo.deleteMany({});

  // Lưu lại ObjectID sau khi chèn để các dữ liệu trùng khớp với nhau 
  const mapFakeId2RealId = {};

  console.log("Loading users");

  // Cái này chứa dữ liệu giả để chúng ta chèn 
  // Sau khi chèn thì cái ObjectID mới sẽ không giống với ObjectID cũ 
  // Cho nên chúng ta cần 1 cái MapFakeID2RealID để khi chèn chúng trùng khớp 
  const userModels = models.userListModel();

  for (const user of userModels) {
    userObj = new User({
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
    try {
      await userObj.save();
      mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;
      console.log(
        "Adding user:",
        user.first_name + " " + user.last_name,
        " with ID ",
        user.objectID
      );
    } catch (error) {
      console.error("Error create user", error);
    }
  }

  console.log("Loading photos");


  // Map FakeID sang RealID sau đó chèn vào photoModels 
  // Sau khi chèn thì photoModel nó sẽ có bình luận nhưng đây chỉ là dữ liệu giả 
  // Chúng cần được chuẩn hóa và đẩy vào dữ liệu thật 
  // Chúng ta có 1 cái Map lưu key FakeID ánh xạ đến ReadID 
  const photoModels = [];

  const userIDs = Object.keys(mapFakeId2RealId);
  userIDs.forEach(function (id) {
    
    // Trả về 1 danh sách của ảnh của người dùng nào đó 
    let photoOfUser = models.photoOfUserModel(id); 

    // Spread Operator : Chèn danh sách ảnh đó vào tổng danh sách ảnh hiện tại 
    photoModels.push(...photoOfUser);
  });

  // Duyệt qua tất cả các cảnh 
  // Mỗi ảnh sẽ chứa 1 số bình luận 
  for (const photo of photoModels) {

    // Tạo 1 PhotoObj mới chưa có bình luận 
    // Object này chưa được lưu vào DB ngay do chưa save 
    photoObj = await Photo.create({
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: mapFakeId2RealId[photo.user_id],  // Cần lấy ReadID thì nó mới đúng 
    });

    // Lưu ObjectID của ảnh mới tạo vào photo 
    photo.objectID = photoObj._id;

    if (photo.comments) {

      // Duyệt qua tất cả các bình luận trong ảnh giả lập đã có bình luận 

      // Thế tại sao chỗ concat kia không dùng push 
      photo.comments.forEach(function (comment) {

        // Chèn bình luận vào trong ảnh 
        photoObj.comments.push(
          {
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: comment.user.objectID,
          },
        );

        console.log(
          "Adding comment of length %d by user %s to photo %s",
          comment.comment.length,
          comment.user.objectID,
          photo.file_name
        );
      });
    }

    // Lưu dữ liệu ảnh vào trong photo 
    try {
      await photoObj.save();
      console.log(
        "Adding photo:",
        photo.file_name,
        " of user ID ",
        photoObj.user_id, 
        "\n"
      );
    } catch (error) {
      console.error("Error create photo", error);
    }

  }

  try {
    schemaInfo = await SchemaInfo.create({
      version: versionString,
    });
    console.log("SchemaInfo object created with version ", schemaInfo.version);
  } catch (error) {
    console.error("Error create schemaInfo", reportError);
  }

  mongoose.disconnect();
}

dbLoad();

