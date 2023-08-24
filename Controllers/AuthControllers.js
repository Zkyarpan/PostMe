import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModal from "../Models/userModel.js";

// Registering a new user
export const registerUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPass;
    const newUser = new UserModal(req.body);
    const { username } = req.body;
    const oldUser = await UserModal.findOne({ username });
    if (oldUser) {
      return res.status(400).json({ message: "Username is already taken!" });
    }
    const user = await newUser.save();
    const token = jwt.sign(
      {
        username: user.username,
        id: user._id,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during registration" });
  }
};

//  Login User
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModal.findOne({ username: username });
    if (user) {
      const validity = await bcrypt.compare(password, user.password);

      if (!validity) {
        res.status(400).json("Wrong Password");
      } else {
        const token = jwt.sign(
          {
            username: user.username,
            id: user._id,
          },
          process.env.JWT_KEY,
          { expiresIn: "1h" }
        );
        res.status(200).json({ user, token });
      }
    } else {
      res.status(401).json("User does not exist.");
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred during login", error });
  }
};
