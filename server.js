const express = require("express");
const app = express();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { userAuth } = require("./middleware/auth");
const path = require("path");
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
app.use("/api/extra", require("./routes/extraRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/drink", require("./routes/drinkRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/carousel", require("./routes/carouselMediaRoutes"));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.get(userAuth, (req, res) => res.send("User Route"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
