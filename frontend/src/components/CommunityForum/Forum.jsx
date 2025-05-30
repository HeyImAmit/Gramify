import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Forum.css";
import { useStore } from "../../context/StoreContext";

const Forum = () => {
  const { url, user } = useStore();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${url}/api/forum/posts`);
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const createPost = async () => {
    setError(null);
    if (!user) {
      navigate("/login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${url}/api/forum/posts`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setContent("");
      fetchPosts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [url]);

  return (
    <div className={`forum-container ${!user ? "no-user" : ""}`}>
      {!user && (
        <div className="login-prompt">
          *Please log in to post new messages with you as its author.
        </div>
      )}

      {user && (
        <div className="create-post">
          <h3>Create a Post</h3>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            placeholder="Enter a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <textarea
            placeholder="Write your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <button onClick={createPost} disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      )}

      <div className="post-list">
        {posts.length === 0 && (
          <p className="no-posts-msg">No posts yet. Be the first to share!</p>
        )}
        {posts.map((p) => (
          <div
            key={p._id}
            className={`post-card ${
              user && p.author?._id === user._id ? "self" : ""
            }`}
          >
            <h4>{p.title}</h4>
            <p>{p.content}</p>
            <div className="post-meta">
              <span className="meta-item">
                <i className="fas fa-user-circle"></i>{" "}
                {p.author?.name || "Anonymous"}
              </span>
              <span className="meta-item">
                <i className="far fa-clock"></i>{" "}
                {new Date(p.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
