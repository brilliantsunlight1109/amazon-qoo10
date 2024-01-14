const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });
connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/create-subscription", require("./routes/stripe"));
app.use("/api/products", require("./routes/getAmazonProduct"));
app.use("/api/ngdata", require("./routes/ngData"));
app.use("/api/qoo10", require("./routes/qoo10"));


if (process.env.NODE_ENV === "production") {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, "client/build")));

  // Route all other requests to the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));