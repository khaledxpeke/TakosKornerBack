const express = require("express");
const app = express();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const desertRoutes = require("./routes/desertRoutes");
const { userAuth } = require("./middleware/auth");

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
connectDB();
server = app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});

app.use(cookieParser());
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/desert", require("./routes/desertRoutes"));
app.use(userRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(desertRoutes);
app.get(userAuth, (req, res) => res.send("User Route"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
