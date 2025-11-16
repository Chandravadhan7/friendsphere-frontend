import { useEffect, useState } from "react";
import "./friendRequestCard.css";
export default function FriendRequestCard({ item }) {
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const [mutualFriends, setMutualFriends] = useState([]);
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
    <div className="request-card">
      <div className="request-pic-cont">
        <img src={item?.profile_img_url} className="request-pic" />
      </div>
      <div className="request-name">
        <div className="request-name-user">{item?.name}</div>
        {mutualFriends.length > 0 && (
          <div style={{ fontSize: "80%", color: "#3B82F6" }}>
            {mutualFriends.length} mutual Friends
          </div>
        )}
      </div>
      <div className="request-btns">
        <button>confrim</button>
        <button>reject</button>
      </div>
    </div>
  );
}
