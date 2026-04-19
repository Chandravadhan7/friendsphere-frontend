import { useEffect, useState } from "react";
import "./friendCard.css";
import { getApiUrl } from "../../config/api";

export default function FriendCard({
  friendItem,
  onClick,
  isSelected,
  inModal,
}) {
  const [mutualFriends, setMutualFriends] = useState([]);
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");

  const getMutualsFriends = async () => {
    const response = await fetch(
      getApiUrl(`/friendship/mutual-friends/${friendItem?.userId}`),
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
  };

  useEffect(() => {
    getMutualsFriends();
  }, []);

  if (inModal) {
    return (
      <div
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 12px",
          backgroundColor: isSelected ? "hsl(222, 35%, 16%)" : "transparent",
          borderRadius: "8px",
          cursor: "pointer",
          borderLeft: isSelected
            ? "3px solid hsl(262, 80%, 60%)"
            : "3px solid transparent",
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "600",
            color: "#fff",
            overflow: "hidden",
            backgroundColor: !friendItem?.profile_img_url
              ? ["#ec4899", "#00d4ff", "#10b981", "#fbbf24", "#a855f7"][
                  friendItem?.name ? friendItem?.name.length % 5 : 0
                ]
              : "transparent",
          }}
        >
          {friendItem?.profile_img_url ? (
            <img
              src={friendItem.profile_img_url}
              alt={friendItem?.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#000" }}>
              {friendItem?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "hsl(210, 40%, 96%)",
              fontSize: "15px",
              fontWeight: "500",
            }}
          >
            {friendItem?.name}
          </span>
          {mutualFriends.length > 0 && (
            <span style={{ color: "hsl(215, 20%, 55%)", fontSize: "12px" }}>
              {mutualFriends.length} mutual friends
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="AFri" onClick={onClick}>
      <div
        className="Afri-pic-cont"
        style={
          !friendItem?.profile_img_url
            ? {
                backgroundColor: [
                  "#ec4899",
                  "#00d4ff",
                  "#10b981",
                  "#fbbf24",
                  "#a855f7",
                ][friendItem?.name ? friendItem?.name.length % 5 : 0],
              }
            : {}
        }
      >
        {friendItem?.profile_img_url ? (
          <img
            src={friendItem.profile_img_url}
            className="Afri-pic"
            alt={friendItem?.name}
          />
        ) : (
          <span style={{ color: "#000" }}>
            {friendItem?.name?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>
      <div className="Afri-name">
        <div className="Afri-name-text">{friendItem?.name}</div>
        {mutualFriends.length > 0 && (
          <div className="mutual-text">
            {mutualFriends.length} mutual friends
          </div>
        )}
      </div>
      <button
        className="unfriend-btn"
        onClick={(e) => {
          e.stopPropagation();
          // Unfriend logic here
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <line x1="17" y1="11" x2="23" y2="11"></line>
        </svg>
        Unfriend
      </button>
    </div>
  );
}
