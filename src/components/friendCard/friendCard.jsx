import { useEffect, useState } from "react";
import "./friendCard.css";
import { getApiUrl } from "../../config/api";

export default function FriendCard({ friendItem, onClick, isSelected }) {
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
      }
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

  return (
    <div className="AFri" onClick={onClick}>
      <div className="Afri-pic-cont">
        <img src={friendItem?.profile_img_url} className="Afri-pic" />
      </div>
      <div className="Afri-name">
        <div className={`Afri-name-text ${isSelected ? "selected-text" : ""}`}>
          {friendItem?.name}
        </div>
        {mutualFriends.length > 0 && (
          <div className={`mutual-text ${isSelected ? "selected-mutual" : ""}`}>
            {mutualFriends.length} mutual Friends
          </div>
        )}
      </div>
    </div>
  );
}
