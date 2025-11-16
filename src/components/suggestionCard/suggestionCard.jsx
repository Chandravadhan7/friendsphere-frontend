import { useEffect, useState } from "react";
import "./suggestionCard.css";
export default function SuggestionCard({ item }) {
  const [mutualFriends, setMutualFriends] = useState([]);
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");

  const [friendRequests, setFriendRequests] = useState({});

  const sendFriendRequest = async (id) => {
    await fetch(
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/friendship/friendrequest/${id}`,
      {
        method: "POST",
        headers: { userId: userId, sessionId: sessionId },
      }
    );

    setFriendRequests((prev) => ({ ...prev, [id]: true }));
  };

  const cancelFriendRequest = async (id) => {
    await fetch(
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/friendship/cancelrequest/${id}`,
      {
        method: "DELETE",
        headers: { userId: userId, sessionId: sessionId },
      }
    );

    setFriendRequests((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const getMutualsFriends = async () => {
    const response = await fetch(
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/friendship/mutual-friends/${item?.userId}`,
      {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      }
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
    <div className="suggestion-card">
      <div className="suggestion-pic-cont">
        <img src={item?.profile_img_url} className="suggestion-pic" />
      </div>
      <div className="suggestion-name">
        <div className="suggestion-name-user">{item?.name}</div>
        {mutualFriends.length > 0 && (
          <div style={{ fontSize: "80%", color: "#3B82F6" }}>
            {mutualFriends.length} mutual Friends
          </div>
        )}
      </div>
      <div className="suggestion-btns">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            friendRequests[item.userId]
              ? cancelFriendRequest(item.userId)
              : sendFriendRequest(item.userId);
          }}
        >
          {friendRequests[item.userId] ? "Cancel Request" : "Add Friend"}
        </button>
        <button
          style={{ backgroundColor: "red" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
