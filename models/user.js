const Mongoose = require("mongoose");
const UserSchema = new Mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },

});

const User = Mongoose.model("User", UserSchema);
module.exports = User;
