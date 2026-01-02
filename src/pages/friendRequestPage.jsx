import { useState, useEffect } from "react";
import FriendRequestCard from "../components/friendRequestCard/friendrequestCard";
import { Link } from "react-router-dom";
import { getApiUrl } from "../config/api";
import UserProfile from "./userprofile";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

export default function FriendRequestPage() {
  const [friendRequests, setFriendRequests] = useState([]);
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  const getFriendRequest = async () => {
    const response = await fetch(getApiUrl("/friendship/friendrequests"), {
      method: "GET",
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    const requestResponse = await response.json();
    setFriendRequests(requestResponse);
    console.log("friend", requestResponse);
  };

  useEffect(() => {
    getFriendRequest();
  }, []);

  const handleRequestClick = (id) => {
    setSelectedUserId(id);
    if (window.innerWidth <= 768) {
      setIsMobileProfileOpen(true);
    }
  };

  return (
    <div className="friend-cont">
      {/* Left Side: Friend Requests List */}
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
            <div className="friend-cont-side1-child-text">Friend Requests</div>
          </div>

          <div className="requests-number">
            {friendRequests.length} friend requests
          </div>

          <div className="friend-requests-grid">
            {friendRequests.map((item) => (
              <div
                key={item.userId}
                onClick={() => handleRequestClick(item.userId)}
                style={{ cursor: "pointer" }}
              >
                <FriendRequestCard item={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Side: User Profile */}
      {selectedUserId && (isMobileProfileOpen || window.innerWidth > 768) && (
        <div
          className="friend-cont-side2"
          style={{ padding: "0", width: "77%" }}
        >
          {/* Mobile Back Button */}
          {isMobileProfileOpen && window.innerWidth <= 768 && (
            <div
              className="mobile-back-button"
              onClick={() => setIsMobileProfileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                cursor: "pointer",
              }}
            >
              <ArrowBackOutlinedIcon style={{ marginRight: "8px" }} />
              <span>Back to Requests</span>
            </div>
          )}
          <UserProfile user_id={selectedUserId} />
        </div>
      )}
    </div>
  );
}
