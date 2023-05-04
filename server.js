const express = require("express");
const app = express();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const desertRoutes = require("./routes/desertRoutes");
const supplementRoutes = require("./routes/supplementRoutes");
const ingrediantRoutes = require("./routes/ingrediantRoutes");
const typeRoutes = require("./routes/typeRoutes");
const packRoutes = require("./routes/packRoutes");
const historyRoutes = require("./routes/historyRoutes");
const { userAuth } = require("./middleware/auth");

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
server = app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});

app.use(cookieParser());
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/desert", require("./routes/desertRoutes"));
app.use("/api/supplement", require("./routes/supplementRoutes"));
app.use("/api/ingrediant", require("./routes/ingrediantRoutes"));
app.use("/api/type", require("./routes/typeRoutes"));
app.use("/api/pack", require("./routes/packRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/uploads", express.static("uploads"));
app.use(userRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(desertRoutes);
app.use(supplementRoutes);
app.use(ingrediantRoutes);
app.use(typeRoutes);
app.use(packRoutes);
app.use(historyRoutes);
app.get(userAuth, (req, res) => res.send("User Route"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
