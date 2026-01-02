import { useEffect, useState } from "react";
import "./suggestionCard.css";
import { getApiUrl } from "../../config/api";
export default function SuggestionCard({ item }) {
  const [mutualFriends, setMutualFriends] = useState([]);
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");

  const [friendRequests, setFriendRequests] = useState({});

  const sendFriendRequest = async (id) => {
    await fetch(getApiUrl(`/friendship/friendrequest/${id}`), {
      method: "POST",
      headers: { userId: userId, sessionId: sessionId },
    });

    setFriendRequests((prev) => ({ ...prev, [id]: true }));
  };

  const cancelFriendRequest = async (id) => {
    await fetch(getApiUrl(`/friendship/cancelrequest/${id}`), {
      method: "DELETE",
      headers: { userId: userId, sessionId: sessionId },
    });

    setFriendRequests((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const getMutualsFriends = async () => {
    const response = await fetch(
      getApiUrl(`/friendship/mutual-friends/${item?.userId}`),
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
        <img
          src={item?.profile_img_url}
          className="suggestion-pic"
          alt={item?.name}
        />
      </div>
      <div className="suggestion-name">
        <div className="suggestion-name-user">{item?.name}</div>
        {mutualFriends.length > 0 && (
          <div className="suggestion-mutual">
            {mutualFriends.length} mutual{" "}
            {mutualFriends.length === 1 ? "Friend" : "Friends"}
          </div>
        )}
      </div>
      <div className="suggestion-btns">
        <button
          className="suggestion-add-btn"
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
          className="suggestion-remove-btn"
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
