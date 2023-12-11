require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./models/user.model");

const saltRounds = 10;

const { PORT } = process.env;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { DB_URL } = process.env;

mongoose
  .connect(DB_URL)
  .then(() => console.log("DB is connected"))
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.post("/register/", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const newUser = new User({
        username,
        email,
        password: hash,
      });

      await newUser.save();
      res.status(201).send(newUser);
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// app.post("/login/", async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const userU = await User.findOne({ username });
//     const userE = await User.findOne({ email });

//     if (userU) {
//       bcrypt.compare(password, userU.password, (err, result) => {
//         if (result === true) {
//           res.status(200).json({
//             message: "Valid User",
//           });
//         }
//       });
//     } else if (userE) {
//       bcrypt.compare(password, userE.password, (err, result) => {
//         if (result === true) {
//           res.status(200).json({
//             message: "Valid User",
//           });
//         }
//       });
//     } else {
//       res.status(500).json({
//         message: "Not a valid User",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });
app.post("/login/", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userU = await User.findOne({ username });
    const userE = await User.findOne({ email });

    const user = userU || userE;

    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result === true) {
          res.status(200).json({
            message: "Valid User",
          });
        } else {
          res.status(500).json({
            message: "Not a valid User",
          });
        }
      });
    } else {
      res.status(500).json({
        message: "Not a valid User",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get((req, res, next) => {
  res.status(404).json({
    message: "Route Not Found",
  });
  next();
});
app.get((error, req, res, next) => {
  res.status(500).json({
    message: "Internal Server Error",
  });
  next();
});
// server listen
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
