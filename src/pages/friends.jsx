import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./friends.css";
import { getApiUrl } from "../config/api";
import FriendRequestCard from "../components/friendRequestCard/friendrequestCard";
import SuggestionCard from "../components/suggestionCard/suggestionCard";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";
import { AiFillHome } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi";
import FriendCard from "../components/friendCard/friendCard";

export default function Friends() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestion, setSuggestion] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    getFriendRequest();
    getSuggestions();
    getAllFriends();
  }, []);

  const getAllFriends = async () => {
    try {
      const response = await fetch(getApiUrl(`/friendship/friends/${userId}`), {
        method: "GET",
        headers: { sessionId, userId },
      });

      if (!response.ok) throw new Error("Failed to fetch friends");

      const data = await response.json();
      setAllFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const getFriendRequest = async () => {
    try {
      const response = await fetch(getApiUrl("/friendship/friendrequests"), {
        method: "GET",
        headers: { sessionId, userId },
      });

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setFriendRequests(data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const getSuggestions = async () => {
    try {
      const response = await fetch(getApiUrl("/friendship/suggestions"), {
        method: "GET",
        headers: { sessionId, userId },
      });

      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      setSuggestion(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleMainNavClick = (path) => {
    navigate(path);
  };

  const path = location.pathname;

  const renderMainMenu = () => {
    if (isMobile && path !== "/friends") return null;

    return (
      <div className="friend-cont-side1">
        <div className="friends-header">
          <h2>Friends</h2>
        </div>

        <div
          className={`friend-menu-item ${path === "/friends/homecontent" ? "active" : ""}`}
          onClick={() => handleMainNavClick("/friends/homecontent")}
        >
          <div className="friend-menu-icon">
            <AiFillHome />
          </div>
          <div className="friend-menu-text">Home</div>
          <div className="friend-menu-arrow">
            <ArrowForwardIosOutlinedIcon />
          </div>
        </div>

        <div
          className={`friend-menu-item ${path === "/friendrequest" ? "active" : ""}`}
          onClick={() => handleMainNavClick("/friendrequest")}
        >
          <div className="friend-menu-icon">
            <FaUserFriends />
          </div>
          <div className="friend-menu-text">Friend Requests</div>
          <div className="friend-menu-arrow">
            <ArrowForwardIosOutlinedIcon />
          </div>
        </div>

        <div
          className={`friend-menu-item ${path === "/suggestions" ? "active" : ""}`}
          onClick={() => handleMainNavClick("/suggestions")}
        >
          <div className="friend-menu-icon">
            <MdPeopleAlt />
          </div>
          <div className="friend-menu-text">Suggestions</div>
          <div className="friend-menu-arrow">
            <ArrowForwardIosOutlinedIcon />
          </div>
        </div>

        <div
          className={`friend-menu-item ${path === "/friends/list" ? "active" : ""}`}
          onClick={() => handleMainNavClick("/friends/list")}
        >
          <div className="friend-menu-icon">
            <HiUserGroup />
          </div>
          <div className="friend-menu-text">All Friends</div>
          <div className="friend-menu-arrow">
            <ArrowForwardIosOutlinedIcon />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isMobile && path === "/friends") return null;

    const renderSection = () => {
      if (path === "/friends/homecontent") {
        return (
          <>
            {isMobile && (
              <div
                className="mobile-back-button"
                onClick={() => navigate("/friends")}
              >
                <ArrowBackIosOutlinedIcon />
                <span>Back</span>
              </div>
            )}
            {suggestion.length > 0 && (
              <div className="friend-cont-side21">Suggestions</div>
            )}
            <div className="friend-cont-side22">
              {suggestion.map((item) => (
                <SuggestionCard key={item.id} item={item} />
              ))}
            </div>
          </>
        );
      }

      if (path === "/friendrequest") {
        return (
          <>
            {isMobile && (
              <div
                className="mobile-back-button"
                onClick={() => navigate("/friends")}
              >
                <ArrowBackIosOutlinedIcon />
                <span>Back</span>
              </div>
            )}
            <div className="friend-cont-side21">
              <ArrowBackIosOutlinedIcon
                style={{
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "20px",
                }}
                onClick={() => navigate("/friends")}
              />
              Friend Requests
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "14px",
                margin: "10px 0 20px 0",
                paddingLeft: "10px",
              }}
            >
              {friendRequests.length} friend requests
            </div>
            <div
              className="friend-cont-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "0 10px",
              }}
            >
              {friendRequests.map((item) => (
                <FriendRequestCard key={item.id} item={item} />
              ))}
            </div>

            <div
              className="friend-cont-side21"
              style={{ marginTop: "40px", marginBottom: "20px" }}
            >
              Suggestions
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
                padding: "0 10px",
              }}
            >
              {suggestion.map((item) => (
                <SuggestionCard key={item.id} item={item} />
              ))}
            </div>
          </>
        );
      }

      if (path === "/suggestions") {
        return (
          <>
            {isMobile && (
              <div
                className="mobile-back-button"
                onClick={() => navigate("/friends")}
              >
                <ArrowBackIosOutlinedIcon />
                <span>Back</span>
              </div>
            )}
            <div className="friend-cont-side21">
              <ArrowBackIosOutlinedIcon
                style={{
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "20px",
                }}
                onClick={() => navigate("/friends")}
              />
              Suggestions
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "10px",
                marginTop: "20px",
              }}
            >
              {suggestion.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "linear-gradient(135deg, #121a2b, #0f1524)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: [
                          "#ec4899",
                          "#00d4ff",
                          "#10b981",
                          "#fbbf24",
                          "#a855f7",
                        ][item.name ? item.name.length % 5 : 0],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.profile_img_url ? (
                        <img
                          src={item.profile_img_url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        item.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "15px",
                        fontWeight: "500",
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                  <button
                    style={{
                      background: "#a855f7",
                      color: "#fff",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </>
        );
      }

      if (path === "/friends/list") {
        return (
          <>
            {isMobile && (
              <div
                className="mobile-back-button"
                onClick={() => navigate("/friends")}
              >
                <ArrowBackIosOutlinedIcon />
                <span>Back</span>
              </div>
            )}
            <div className="friend-cont-side21">
              <ArrowBackIosOutlinedIcon
                style={{
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "20px",
                }}
                onClick={() => navigate("/friends")}
              />
              All Friends
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
                padding: "20px 10px",
              }}
            >
              {allFriends.map((item) => (
                <FriendCard key={item.userId} friendItem={item} />
              ))}
            </div>
          </>
        );
      }

      return null;
    };

    return <div className="friend-cont-side2">{renderSection()}</div>;
  };

  return (
    <div className="friend-cont">
      {renderMainMenu()}
      {renderContent()}
    </div>
  );
}
