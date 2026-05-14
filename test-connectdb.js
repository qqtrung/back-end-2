/*
Mỗi lần bị lỗi querySrv ECONNREFUSED, chạy 3 lệnh này trong CMD Admin:

# 1. Set DNS IPv6 sang Google
netsh interface ipv6 set dns "Wi-Fi" static 2001:4860:4860::8888
netsh interface ipv6 add dns "Wi-Fi" 2001:4860:4860::8844 index=2

# 2. Set DNS IPv4 sang Google  
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

# 3. Flush DNS cache
ipconfig /flushdns

Hoặc thêm vĩnh viễn vào code Node.js
Thêm 3 dòng này vào đầu file index.js (hoặc bất kỳ file nào connect MongoDB):
jsconst dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

*/


const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const url = "mongodb+srv://nqtrung2k5:TD0MjfZKygQ0w9x5@cluster0.2l2hq2s.mongodb.net/photo_sharing?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(url)
  .then(() => {
    console.log("MongoDB connected!");
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit();
  });

