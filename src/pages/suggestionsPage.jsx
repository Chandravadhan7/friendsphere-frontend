import Suggestion from "../components/suggestion/suggestion";
import { useEffect, useState } from "react";
import { getApiUrl } from "../config/api";
import UserProfile from "./userprofile";
import { Link } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

export default function SuggestionsPage() {
  const [suggestion, setSuggestion] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");

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
    setSuggestion(suggested);
    console.log("suggestions", suggested);
  };

  useEffect(() => {
    getSuggestions();
  }, []);

  const handleSuggestionClick = (userId) => {
    setSelectedUserId(userId);
    if (window.innerWidth <= 768) {
      setIsMobileProfileOpen(true);
    }
  };

  return (
    <div className="friend-cont">
      {/* Left Side: Suggestions List */}
      {(!isMobileProfileOpen || window.innerWidth > 768) && (
        <div className="friend-cont-side1">
          <div className="friend-cont-side1-child">
            <Link
              to="/friends"
              style={{ textDecoration: "none", color: "black" }}
            >
              <ArrowBackOutlinedIcon
                style={{
                  fontSize: "30px",
                  marginTop: "10px",
                  marginLeft: "10px",
                  color: "#fff",
                }}
              />
            </Link>
            <div className="friend-cont-side1-child-text">Suggestions</div>
          </div>
          {suggestion.map((item) => (
            <div
              key={item.userId}
              onClick={() => handleSuggestionClick(item.userId)}
              style={{ cursor: "pointer" }}
            >
              <Suggestion suggestedItem={item} />
            </div>
          ))}
        </div>
      )}

      {selectedUserId && (isMobileProfileOpen || window.innerWidth > 768) && (
        <div className="friend-cont-side2">
          {isMobileProfileOpen && window.innerWidth <= 768 && (
            <div
              className="mobile-back-button"
              onClick={() => setIsMobileProfileOpen(false)}
            >
              <ArrowBackOutlinedIcon />
              <span>Back to Suggestions</span>
            </div>
          )}
          <UserProfile user_id={selectedUserId} />
        </div>
      )}
    </div>
  );
}
