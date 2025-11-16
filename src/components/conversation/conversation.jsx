import { useEffect, useState } from "react";
import "./conversation.css";
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
  const [groupMemberNames, setGroupMemberNames] = useState([]);
  const [displayName, setDisplayName] = useState("Loading...");

  const getParticipants = async () => {
    try {
      const response = await fetch(
        `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/conversation-participants/${conversationId}`,
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

      // Fetch names for all participants (for groups)
      const memberNames = await Promise.all(
        participantsResponse
          .filter((p) => p.userId !== userId) // Exclude current user
          .map(async (participant) => {
            try {
              const userRes = await fetch(
                `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/user/${participant.userId}`,
                {
                  method: "GET",
                  headers: { sessionId, userId },
                }
              );
              if (userRes.ok) {
                const user = await userRes.json();
                return user.name;
              }
            } catch (err) {
              console.debug("Failed to fetch user name", err);
            }
            return "Unknown";
          })
      );
      setGroupMemberNames(memberNames.filter(Boolean));
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  };

  useEffect(() => {
    getParticipants();
  }, [conversationId]);

  const getUser = async () => {
    const response = await fetch(
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/user/${otherUserId}`,
      {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      }
    );

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
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/conversations/${conversationId}`,
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

  // Update display name when data is loaded
  useEffect(() => {
    if (convo?.isGroup) {
      // For groups, show group title or member names
      if (convo.title) {
        setDisplayName(convo.title);
      } else if (groupMemberNames.length > 0) {
        setDisplayName(groupMemberNames.join(", "));
      } else {
        setDisplayName("Group Chat");
      }
    } else {
      // For 1-on-1 chats, show the other user's name
      if (userDetails?.name) {
        setDisplayName(userDetails.name);
      } else {
        setDisplayName("Chat");
      }
    }
  }, [convo, userDetails, groupMemberNames]);

  const getUnseenMessage = async () => {
    try {
      const response = await fetch(
        `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/messages/latest-unseen-message/${conversationId}`,
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
        `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/messages/latest-message/${conversationId}`,
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
    try {
      const response = await fetch(
        `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/conversation-participants/last-seen/${conversationId}/${userId}`,
        {
          method: "PATCH",
          headers: {
            sessionId,
            userId,
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (response.ok) {
        setUnseenMessage([]);
      } else {
        console.warn("Failed to update last seen status:", response.status);
      }
    } catch (err) {
      // Silently handle errors - don't block conversation opening
      console.debug("Last seen update failed (non-critical):", err.message);
    }
  };

  const handleConversationClick = async () => {
    // Don't wait for setLastSeen to complete - open conversation immediately
    setLastSeen(); // Fire and forget
    onClick();
  };

  // Function to get preview text for messages (hide URLs)
  const getMessagePreview = (content) => {
    if (!content) return "";

    // Check if message contains "shared a post" pattern
    if (content.includes("shared a post")) {
      // Extract just the "username shared a post" part, remove URL
      const lines = content.split("\n");
      return lines[0]; // Return first line only (username shared a post)
    }

    // For other messages, truncate if too long
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
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
        <div className="name-u">{displayName}</div>
        <div className="last-msg">
          {unseenMessage.length > 0 ? (
            <>
              <GoDotFill style={{ color: "#3B82F6", fontSize: "120%" }} />
              <div>{getMessagePreview(unseenMessage[0]?.content)}</div>
            </>
          ) : (
            <>
              {latestMessage && latestMessage.senderId === userId && (
                <RiCheckDoubleLine style={{ fontSize: "120%" }} />
              )}
              <div>{getMessagePreview(latestMessage?.content)}</div>
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
