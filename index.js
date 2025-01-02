const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const exphbs = require("express-handlebars");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const http = require("http")
const app = express();
const server = http.createServer(app);
const { swaggerUi, swaggerSpec } = require('./utils/swagger/swagger');

const createAdminIfNotExists = require("./utils/createAdmin");
const initSocket = require("./utils/socket")

const resumeRoute = require("./routes/resume");
const authRoute = require("./routes/auth");
const blogRoute = require("./routes/blog");
const shopRoute = require("./routes/shop");
const chatRoute = require("./routes/chat");
const notesRoute = require("./routes/notes");

dotenv.config();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: {
    formatDate: (date) => {
      const formattedDate = new Date(date).toLocaleString("ua-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return formattedDate;
    },
    eq: (a, b) => a === b,

    inc: (num) => num + 1,
    dec: (num) => num - 1,
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(methodOverride("_method"));

app.use("/resume-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use("/", resumeRoute);
app.use("/auth", authRoute);
app.use("/blog", blogRoute);
app.use("/shop", shopRoute);
app.use("/chat", chatRoute);
app.use("/notes", notesRoute);

initSocket(server);

async function start() {
  try {
    if (process.env.NODE_ENV !== "test") {
      await mongoose.connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.winiz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
      );

      await createAdminIfNotExists(mongoose);

      server.listen(PORT, () => {
        console.log(`Сервер запустився на порту: ${PORT}`);
      });
      console.log("Підключення до основної бази даних успішно!!");
    } else {
      console.log("Підключення до тестової бази даних успішно!");
    }
  } catch (error) {
    console.error("При запуску сервера виникла помилка:", error);
  }
}
start();

module.exports = app
