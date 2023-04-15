const mongoose = require("mongoose");

const localDB = "mongodb+srv://khaledbouajila5481:khaled123@takoskorner.hfb67im.mongodb.net/TakosKorner";
const connectDB = async () => {
  await mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("MongoDB Connected")
}
module.exports = connectDB