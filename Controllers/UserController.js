import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModal from "../Models/userModel.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    let users = await UserModal.find();
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails;
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get a user
export const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModal.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such user found !");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

//  Update a user
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { _id, currentUserId, currentUserAdminStatus, password } = req.body;

    if (id === _id || currentUserAdminStatus) {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await UserModal.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWT_KEY,
        { expiresIn: "1hr" }
      );

      res.status(200).json({ user, token });
    } else {
      res
        .status(403)
        .json("Access Denied! You can only update your own profile.");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { currentUserId, currentUserAdminStatus } = req.body;
    if (id === currentUserId || currentUserAdminStatus) {
      await UserModal.findByIdAndDelete(id);
      res.status(200).json("Sucessfully deleted the user");
    } else {
      res
        .status(403)
        .json("Access Denied! You can only delete your own profile.");
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const id = req.params.id; // THis is the id where user follow (followUser)
    const { _id } = req.body; // This is a user who wants to follow others. (followingUser)
    console.log(id, _id);
    if (_id == id) {
      res.status(403).json("Action forbidden");
    } else {
      const followUser = await UserModal.findById(id);
      const followingUser = await UserModal.findById(_id);
      if (!followUser.followers.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed !");
      } else {
        res.status(403).json("You have already followed this user");
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};

// Un - Follow a user
export const UnFollowUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { _id } = req.body;

    if (_id === id) {
      res.status(403).json("Action forbidden");
    } else {
      const followUser = await UserModal.findById(id);
      const followingUser = await UserModal.findById(_id);
      if (followUser.followers.includes(_id)) {
        await followUser.updateOne({ $pull: { followers: _id } });
        await followingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User Unfollowed !");
      } else {
        res.status(403).json("You are not following this user");
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};
