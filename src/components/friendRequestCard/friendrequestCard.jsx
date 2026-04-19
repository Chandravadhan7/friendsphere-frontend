import { useEffect, useState } from "react";
import "./friendRequestCard.css";
import { getApiUrl } from "../../config/api";
export default function FriendRequestCard({ item }) {
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const [mutualFriends, setMutualFriends] = useState([]);
  const getMutualsFriends = async () => {
    const response = await fetch(
      getApiUrl(`/friendship/mutual-friends/${item?.userId}`),
      {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("failed to fetch");
    }

    const mutualResponse = await response.json();
    setMutualFriends(mutualResponse);

    console.log(mutualResponse);
  };

  useEffect(() => {
    getMutualsFriends();
  }, []);
  return (
    <div className="request-card">
      <div
        className="request-pic-cont"
        style={
          !item?.profile_img_url
            ? {
                backgroundColor: [
                  "#ec4899",
                  "#00d4ff",
                  "#10b981",
                  "#fbbf24",
                  "#a855f7",
                ][item?.name ? item?.name.length % 5 : 0],
              }
            : {}
        }
      >
        {item?.profile_img_url ? (
          <img
            src={item?.profile_img_url}
            className="request-pic"
            alt={item?.name}
          />
        ) : (
          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#000" }}>
            {item?.name?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>
      <div className="request-name">
        <div className="request-name-user">{item?.name}</div>
        {mutualFriends.length > 0 && (
          <div className="request-mutual">
            {mutualFriends.length} mutual{" "}
            {mutualFriends.length === 1 ? "Friend" : "Friends"}
          </div>
        )}
      </div>
      <div className="request-btns">
        <button className="request-confirm-btn">Accept</button>
        <button className="request-reject-btn">Decline</button>
      </div>
    </div>
  );
}
