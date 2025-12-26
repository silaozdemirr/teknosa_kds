require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use(require("./routes/authRoutes"));
app.use(require("./routes/dashboardRoutes"));
app.use(require("./routes/subeRoutes"));
app.use(require("./routes/demoRoutes"));
app.use(require("./routes/ilceRoutes"));

app.listen(process.env.PORT, () =>
  console.log("Server:", process.env.PORT)
);
