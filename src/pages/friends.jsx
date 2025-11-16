import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./friends.css";
import FriendRequestCard from "../components/friendRequestCard/friendrequestCard";
import SuggestionCard from "../components/suggestionCard/suggestionCard";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";

export default function Friends() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestion, setSuggestion] = useState([]);
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
  }, []);

  const getFriendRequest = async () => {
    try {
      const response = await fetch(
        "http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/friendship/friendrequests",
        {
          method: "GET",
          headers: { sessionId, userId },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setFriendRequests(data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const getSuggestions = async () => {
    try {
      const response = await fetch(
        "http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/friendship/suggestions",
        {
          method: "GET",
          headers: { sessionId, userId },
        }
      );

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
        <div
          className="friend-cont-side1-child"
          style={{ textAlign: "left", fontSize: "180%", lineHeight: "200%" }}
        >
          Friends
        </div>

        <div
          className="friend-cont-side1-child"
          onClick={() => handleMainNavClick("/friends/homecontent")}
        >
          <div className="f-c-s1-c-icon">
            <img
              src="https://i.ibb.co/67HWYXmq/icons8-user-96.png"
              className="post-pro-pic"
              alt="profile"
            />
          </div>
          <div className="f-c-s1-c-text">Home</div>
          <div className="f-c-s1-c-arrow">
            <ArrowForwardIosOutlinedIcon />
          </div>
        </div>

        <div
          className="friend-cont-side1-child"
          onClick={() => handleMainNavClick("/friendrequest")}
        >
          <div className="f-c-s1-c-icon">
            <img
              src="https://i.ibb.co/67HWYXmq/icons8-user-96.png"
              className="post-pro-pic"
              alt="profile"
            />
          </div>
          <div className="f-c-s1-c-text">Friend Requests</div>
          <div className="f-c-s1-c-arrow">
            <ArrowForwardIosOutlinedIcon />
          </div>
        </div>

        <div
          className="friend-cont-side1-child"
          onClick={() => handleMainNavClick("/suggestions")}
        >
          <div className="f-c-s1-c-icon">
            <img
              src="https://i.ibb.co/67HWYXmq/icons8-user-96.png"
              className="post-pro-pic"
              alt="profile"
            />
          </div>
          <div className="f-c-s1-c-text">Suggestions</div>
          <div className="f-c-s1-c-arrow">
            <ArrowForwardIosOutlinedIcon />
          </div>
        </div>

        <div
          className="friend-cont-side1-child"
          onClick={() => handleMainNavClick("/friends/list")}
        >
          <div className="f-c-s1-c-icon">
            <img
              src="https://i.ibb.co/67HWYXmq/icons8-user-96.png"
              className="post-pro-pic"
              alt="profile"
            />
          </div>
          <div className="f-c-s1-c-text">All Friends</div>
          <div className="f-c-s1-c-arrow">
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
            {friendRequests.length > 0 && (
              <div className="friend-cont-side21">Friend Requests</div>
            )}
            <div className="friend-cont-side22">
              {friendRequests.map((item) => (
                <FriendRequestCard key={item.id} item={item} />
              ))}
            </div>
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
            <div className="friend-cont-side21">Friend Requests</div>
            <div className="friend-cont-side22">
              {friendRequests.map((item) => (
                <FriendRequestCard key={item.id} item={item} />
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
            <div className="friend-cont-side21">Suggestions</div>
            <div className="friend-cont-side22">
              {suggestion.map((item) => (
                <SuggestionCard key={item.id} item={item} />
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
            <div className="friend-cont-side21">All Friends</div>
            <div className="friend-cont-side22">
              <p style={{ color: "#fff" }}>
                All friends list will be displayed here
              </p>
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
