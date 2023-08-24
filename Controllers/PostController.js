import mongoose from "mongoose";

import UserModal from "../Models/userModel.js";
import PostModel from "../Models/postModel.js";

// Create new post
export const createPost = async (req, res) => {
  try {
    const newPost = new PostModel(req.body);
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get a post
export const getPost = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

// update a post
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post updated.");
    } else {
      res.status(403).json("You can only update your own post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const { userId } = req.body;
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted successfully");
    } else {
      res.status(403).json("You can only delete your own post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Like & dislike a post
export const likePost = async (req, res) => {
  try {
    const id = req.params.id;
    const { userId } = req.body;
    const post = await PostModel.findById(id);
    // Like functionality
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post liked");
    } else {
      // Unlike functionality
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post Unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//  GET Timeline Posts
export const getTimelinePost = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModal.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]).exec();
    const allPosts = currentUserPosts
      .concat(...followingPosts[0].followingPosts)
      .sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
    res.status(200).json(allPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
