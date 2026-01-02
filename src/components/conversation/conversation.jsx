import { useEffect, useState } from "react";
import "./conversation.css";
import { getApiUrl } from "../../config/api";
import { RiCheckDoubleLine } from "react-icons/ri";
import { GoDotFill } from "react-icons/go";

export default function Conversation({ conversationId, onClick, isSelected }) {
  const [participants, setParticipants] = useState("");
  const sessionId = localStorage.getItem("sessionId");
  const userId = Number(localStorage.getItem("userId"));
  const [userDetails, setUserDetails] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [convo, setConvo] = useState(null);
  const [unseenMessage, setUnseenMessage] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);

  const getParticipants = async () => {
    const response = await fetch(
      getApiUrl(`/conversation-participants/${conversationId}`),
      {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch participants");
    }

    const participantsResponse = await response.json();
    setParticipants(participantsResponse);

    const otherUser = participantsResponse.find((p) => p.userId !== userId);
    setOtherUserId(otherUser?.userId);
  };

  useEffect(() => {
    getParticipants();
  }, [conversationId]);

  const getUser = async () => {
    const response = await fetch(getApiUrl(`/user/${otherUserId}`), {
      method: "GET",
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const userResponse = await response.json();
    setUserDetails(userResponse);
  };

  useEffect(() => {
    if (otherUserId) {
      getUser();
    }
  }, [otherUserId]);

  const getConversation = async () => {
    const response = await fetch(
      getApiUrl(`/conversations/${conversationId}`),
      {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch conversation");
    }

    const convoResponse = await response.json();
    setConvo(convoResponse);
  };

  useEffect(() => {
    getConversation();
  }, [conversationId]);

  const getUnseenMessage = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/messages/latest-unseen-message/${conversationId}`),
        {
          method: "GET",
          headers: {
            sessionId: sessionId,
            userId: userId,
          },
        }
      );

      const text = await response.text();

      if (!text || text === "null") {
        return;
      }

      const messageResponse = JSON.parse(text);
      setUnseenMessage(messageResponse);
    } catch (err) {
      console.error("Error fetching latest unseen message:", err);
    }
  };

  const getLatestMessages = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/messages/latest-message/${conversationId}`),
        {
          method: "GET",
          headers: {
            sessionId: sessionId,
            userId: userId,
          },
        }
      );

      const text = await response.text();

      if (!text || text === "null") {
        return;
      }

      const messageResponse = JSON.parse(text);
      setLatestMessage(messageResponse);
    } catch (err) {
      console.error("Error fetching latest unseen message:", err);
    }
  };

  useEffect(() => {
    if (otherUserId) {
      getUnseenMessage();
    }
    getLatestMessages();
  }, [conversationId, otherUserId]);

  const setLastSeen = async () => {
    const response = await fetch(
      getApiUrl(
        `/conversation-participants/last-seen/${conversationId}/${userId}`
      ),
      {
        method: "PATCH",
        headers: {
          sessionId,
          userId,
        },
      }
    );

    if (response.ok) {
      setUnseenMessage([]);
    }
  };

  const handleConversationClick = async () => {
    await setLastSeen();
    onClick();
  };

  return (
    <div
      onClick={handleConversationClick}
      className={`chat-cont ${isSelected ? "selected-chat" : ""}`}
    >
      <div className="chat-cont-pic">
        <img
          src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
          className="convo-page-side2-user-pic-img"
          alt="User"
        />
      </div>
      <div className="chat-cont-name">
        <div className="name-u">
          {convo?.isGroup
            ? convo?.title || "Unnamed Group"
            : userDetails?.name || "Unknown User"}
        </div>
        <div className="last-msg">
          {unseenMessage.length > 0 ? (
            <>
              <GoDotFill style={{ color: "#3B82F6", fontSize: "120%" }} />
              <div>
                {unseenMessage[0]?.content?.includes("shared a post")
                  ? unseenMessage[0].content.split("\n")[0]
                  : unseenMessage[0]?.content}
              </div>
            </>
          ) : (
            <>
              {latestMessage && latestMessage.senderId === userId && (
                <RiCheckDoubleLine style={{ fontSize: "120%" }} />
              )}
              <div>
                {latestMessage?.content?.includes("shared a post")
                  ? latestMessage.content.split("\n")[0]
                  : latestMessage?.content}
              </div>
            </>
          )}
        </div>
      </div>
      {unseenMessage && unseenMessage?.length > 0 && (
        <div className="chat-cont-time">
          <div className="chat-cont-time-child">{unseenMessage?.length}</div>
        </div>
      )}
    </div>
  );
}
