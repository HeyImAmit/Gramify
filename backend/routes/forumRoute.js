import express from "express";
import { getPosts, createPost } from "../controllers/forumController.js";
import requireAuth from "../middlewares/requireAuth.js";

const forumRouter = express.Router();
forumRouter.get("/posts", getPosts);
forumRouter.post("/posts", requireAuth, createPost);
export default forumRouter;
