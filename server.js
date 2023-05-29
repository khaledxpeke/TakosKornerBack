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
const noingredientRoutes = require("./routes/NoingredientRoutes");
const { userAuth } = require("./middleware/auth");
app.timeout = 300000;
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
server = app.listen(3300, function () {
  console.log("Server is listening on port 3300");
});

app.use(cookieParser());
app.use("/api/auth", require("./routes/userRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/desert", require("./routes/desertRoutes"));
app.use("/api/supplement", require("./routes/supplementRoutes"));
app.use("/api/ingrediant", require("./routes/ingrediantRoutes"));
app.use("/api/type", require("./routes/typeRoutes"));
app.use("/api/pack", require("./routes/packRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/noIngredient", require("./routes/NoingredientRoutes"));
app.use("/api/uploads", express.static("uploads"));
app.get(userAuth, (req, res) => res.send("User Route"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
