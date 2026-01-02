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
    <div className="request-card">
      <div className="request-pic-cont">
        <img
          src={item?.profile_img_url}
          className="request-pic"
          alt={item?.name}
        />
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
        <button className="request-confirm-btn">confirm</button>
        <button className="request-reject-btn">reject</button>
      </div>
    </div>
  );
}
