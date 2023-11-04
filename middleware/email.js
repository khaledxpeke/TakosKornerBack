const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "khaledbouajila5481@gmail.com",
    pass: "xlwjzvtathzeqpwj",
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".handlebars",
      layoutsDir: "./src/api/views",
      defaultLayout: "index",
    },
    viewPath: "./",
  })
);

module.exports = transporter;
