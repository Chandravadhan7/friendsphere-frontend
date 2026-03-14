import { useState, useEffect } from "react";
import "./suggestion.css";
import { getApiUrl } from "../../config/api";
export default function Suggestion({ suggestedItem }) {
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const [friendRequests, setFriendRequests] = useState({});
  const [mutualFriends, setMutualFriends] = useState([]);

  const getMutualsFriends = async () => {
    const response = await fetch(
      getApiUrl(`/friendship/mutual-friends/${suggestedItem?.userId}`),
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

  useEffect(() => {
    const fetchPendingRequests = async () => {
      const response = await fetch(getApiUrl("/friendship/pending-requests"), {
        method: "GET",
        headers: { userId: userId, sessionId: sessionId },
      });

      if (!response.ok) {
        console.error("Failed to fetch pending requests");
        return;
      }

      const pendingRequests = await response.json();

      const requestMap = {};
      pendingRequests.forEach((id) => (requestMap[id] = true));
      setFriendRequests(requestMap);
    };

    fetchPendingRequests();
  }, []);

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

  return (
    <div className="suggestion">
      <div className="sugg-pic-cont">
        <img src={suggestedItem?.profile_img_url} className="sugg-pic" />
      </div>
      <div className="sugg-name">
        <div className="sugg-name-user">{suggestedItem?.name}</div>
        {mutualFriends.length > 0 && (
          <div style={{ fontSize: "80%", color: "#3B82F6" }}>
            {mutualFriends.length} mutual Friends
          </div>
        )}
      </div>
      <div className="sugg-add">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            friendRequests[suggestedItem.userId]
              ? cancelFriendRequest(suggestedItem.userId)
              : sendFriendRequest(suggestedItem.userId);
          }}
        >
          {friendRequests[suggestedItem.userId]
            ? "Cancel Request"
            : "Add Friend"}
        </button>
      </div>
    </div>
  );
}
