import { useEffect, useState } from "react";
import "./home.css";
import "./emptyState.css";
import Post from "../components/post/post";
import Suggestion from "../components/suggestion/suggestion";
import { getApiUrl } from "../config/api";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { Link, useLocation } from "react-router-dom";
import { fetchLikes } from "./fetchLikes";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [feeling, setFeeling] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [posts, setPosts] = useState([]);
  const [suggestion, setSuggestions] = useState([]);
  const [buttonState, setButtonState] = useState("see more");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleHeight = () => {
    setButtonState(buttonState === "see less" ? "see more" : "see less");
  };

  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const fileType = selectedFile.type;
      setPreviewUrl(URL.createObjectURL(selectedFile));

      if (fileType.startsWith("image/")) {
        setContent("image");
      } else if (fileType.startsWith("video/")) {
        setContent("video");
      }
    }
  };
  const fetchwithauth = async () => {
    let sessionKey = localStorage.getItem("sessionId");
    const response = await fetch(getApiUrl("/user/api/validate"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        sessionId: sessionKey,
      },
    });
    if (!response.ok) {
      alert("session expired.Please login again");
      navigate("/login");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userId");
    }
  };

  useEffect(() => {
    fetchwithauth();
  }, []);

  const handleFeelingClick = () => {
    setContent("feeling");
    setFeeling("😊 Happy");
  };

  const handleLocationClick = () => {
    setContent("location");
    setLocationTag("📍 New York");
  };

  const handleUpload = async () => {
    if (!content) return alert("Please enter post content!");

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("content", content);
    formData.append("description", description);
    if (file) formData.append("file", file);
    if (feeling) formData.append("feeling", feeling);
    if (locationTag) formData.append("location", locationTag);

    try {
      const response = await fetch(getApiUrl("/post/createpost"), {
        method: "POST",
        body: formData,
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      });

      if (!response.ok) throw new Error("Failed to upload post");

      console.log("Post created successfully");
      alert("Post uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const getPosts = async () => {
    try {
      if (!sessionId || !userId) {
        console.error("Missing sessionId or userId");
        return;
      }

      const response = await fetch(getApiUrl("/post/feed"), {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const postResp = await response.json();
      console.log("Fetched Posts:", postResp);
      // Sort posts by createdAt in descending order (latest first)
      const sortedPosts = postResp.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    console.log("Updated Posts State:", posts);
  }, [posts]);

  const getSuggestions = async () => {
    const response = await fetch(getApiUrl("/friendship/suggestions"), {
      method: "GET",
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const suggested = await response.json();
    setSuggestions(suggested);

    console.log("suggestions", suggested);
  };

  useEffect(() => {
    getSuggestions();
  }, []);

  useEffect(() => {
    dispatch(fetchLikes());
  }, [dispatch]);
  const likes = useSelector((state) => state.likes.likes);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const postId = searchParams.get("postId");
    if (postId && posts.length > 0) {
      setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [location.search, posts]);

  return (
    <div className="whole">
      <div className="side1">
        <div className="side11">
          <div className="thought">
            <div className="thought-pro">
              <img
                src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
                className="post-pro-pic"
                alt="profile"
              />
            </div>
            <input
              placeholder="Share your thoughts with the world..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="thought-cont"
            />
          </div>

          {/* File Preview Pill */}
          {file && (
            <div className="file-preview-pill">
              <span className="file-icon">
                {content === "image" ? "🖼️" : "🎥"}
              </span>
              <span className="file-name">{file.name}</span>
              <button
                className="remove-file"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setContent("");
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="contents">
            {/* Photo Upload */}
            <label
              htmlFor="file-input"
              className="contents1"
              style={{ color: "#3B82F6" }}
            >
              <div>
                <CollectionsOutlinedIcon />
              </div>
              <div className="pvfl">Photo</div>
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*, video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Video Upload */}
            <label
              htmlFor="video-input"
              className="contents1"
              style={{ color: "lightgreen" }}
            >
              <div>
                <VideocamOutlinedIcon />
              </div>
              <div className="pvfl">Video</div>
            </label>
            <input
              id="video-input"
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Feeling Selection */}
            <div
              className="contents1"
              onClick={handleFeelingClick}
              style={{ color: "orange" }}
            >
              😊
              <div className="pvfl">Feeling</div>
            </div>

            {/* Location Input */}
            <div
              className="contents1"
              onClick={handleLocationClick}
              style={{ color: "purple" }}
            >
              <PlaceOutlinedIcon />
              <div className="pvfl">Location</div>
            </div>

            {/* Share Button */}
            <button className="btn-share" onClick={handleUpload}>
              Share post
            </button>
          </div>
        </div>
        <div className="side12">
          {posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No Posts Yet</h3>
              <p>Posts from your friends will appear here.</p>
              <p>Start by adding friends or create your first post above!</p>
              <Link to="/suggestions" className="empty-state-btn">
                Find Friends
              </Link>
            </div>
          ) : (
            posts.map((item) => {
              return (
                <div key={item.postId} id={`post-${item.postId}`}>
                  <Post postItem={item} likes={likes} />
                </div>
              );
            })
          )}
        </div>
      </div>
      <div
        className="side2"
        style={
          buttonState === "see less"
            ? { height: "100vh", overflow: "scroll", scrollbarWidth: "none" }
            : {}
        }
      >
        <div className="side21">Suggested for you ✨</div>
        <div className="side22">
          {suggestion.length === 0 ? (
            <div className="empty-suggestions">
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                No suggestions available right now. Check back later!
              </p>
            </div>
          ) : (
            suggestion.map((item) => {
              return (
                <Link
                  key={item?.userId}
                  to={`/profile/${item?.userId}`}
                  style={{ textDecoration: "none" }}
                >
                  <Suggestion suggestedItem={item} />
                </Link>
              );
            })
          )}
        </div>
        <div className="side23">
          <button onClick={toggleHeight}>
            {buttonState === "see more" ? "see more" : "see less"}
          </button>
        </div>
      </div>
    </div>
  );
}
