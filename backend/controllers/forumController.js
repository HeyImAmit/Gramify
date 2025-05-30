import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await postModel.find().populate("author", "name email");
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

export const createPost = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json({ success: false, message: "Title and content are required" });
  }

  if (!req.user?._id) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  const userId = req.user._id;

  try {
    const newPost = await postModel.create({ title, content, author: userId });
    await userModel.findByIdAndUpdate(userId, {
      $push: { posts: newPost._id },
    });
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not create post" });
  }
};
