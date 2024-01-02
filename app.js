const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const sequelize = require("./models/index");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
//const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptons = {
	origin: 'http://localhost:5500/'
		};
app.use(cors(corsOptons));
//console.log(process.env.NODE_ENV)

app.use("/user", userRoutes);
app.use("/product", productRoutes);

app.use(compression());
//app.use(helmet());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(morgan('combined', { stream: accessLogStream }));

app.get("/", (req, res) => {
  return res.send("This is file");
});
const PORT = process.env.PORT || 5500;
sequelize.sync().then(() => {
  app.listen(PORT);
});
