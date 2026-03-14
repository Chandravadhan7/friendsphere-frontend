import { use, useEffect, useRef } from "react";
import "./chatbox.css";
import { useState } from "react";
import Message from "../components/message/message";
import { getApiUrl } from "../config/api";
import { RxCross1 } from "react-icons/rx";
import { MdBlock } from "react-icons/md";
import { MdOutlineReportProblem } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { formatDistanceToNowStrict } from "date-fns";

export default function ChatBox({ conversationId }) {
  let [message, setMessage] = useState("");
  let [userDetails, setUserDetails] = useState(null);
  let [messages, setMessages] = useState([]);
  let sessionId = localStorage.getItem("sessionId");
  let userId = Number(localStorage.getItem("userId"));
  let [convo, setConvo] = useState(null);
  const [toogle, setToggle] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [commonGroups, setCommonGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  const toogleSide22 = () => {
    setToggle(!toogle);
    if (!toogle) {
      // Opening the panel
      console.log("Opening panel, convo:", convo);
      console.log("Is group?", convo?.isGroup);
    }
  };

  // Format last seen time
  const getLastSeenText = (lastSeen, isOnline) => {
    if (isOnline) return "online";
    if (!lastSeen) return "offline";
    return `last seen ${formatDistanceToNowStrict(new Date(lastSeen), { addSuffix: true })}`;
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle emoji click
  const onEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        sendMessage();
      }
    }
  };

  let inputobj = {
    conversationId: conversationId,
    senderId: userId,
    messageType: "TEXT",
    content: message,
    createdAt: Date.now(),
    updatedAt: null,
    isDeleted: false,
    replyToMessageId: null,
  };
  const sendMessage = async () => {
    if (editingMessage) {
      // Edit existing message
      try {
        const { editConversationMessage } = await import(
          "../socket/chatService"
        );
        await editConversationMessage(
          conversationId,
          editingMessage.messageId,
          message
        );
        setMessage("");
        setEditingMessage(null);
      } catch (err) {
        console.error("edit via socket failed", err);
      }
    } else {
      // Send new message
      try {
        const { sendConversationMessage } = await import(
          "../socket/chatService"
        );
        await sendConversationMessage(conversationId, message);
        setMessage("");
      } catch (err) {
        console.error("send via socket failed", err);
        // fallback to REST POST
        const response = await fetch(getApiUrl("/messages"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            sessionId: sessionId,
            userId: userId,
          },
          body: JSON.stringify(inputobj),
        });
        if (!response.ok) throw new Error("unable to send message");
        setMessage("");
        await getMessages();
      }
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setMessage(msg.content);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const { deleteConversationMessage } = await import(
        "../socket/chatService"
      );
      await deleteConversationMessage(conversationId, messageId);
    } catch (err) {
      console.error("delete via socket failed", err);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setMessage("");
  };

  const handleDeleteConversation = async () => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        const response = await fetch(
          getApiUrl(`/conversations/${conversationId}`),
          {
            method: "DELETE",
            headers: {
              sessionId: sessionId,
              userId: userId,
            },
          }
        );

        if (response.ok) {
          alert("Conversation deleted successfully");
          window.location.href = "/conversations";
        } else {
          alert("Failed to delete conversation");
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
        alert("Error deleting conversation");
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        console.log(
          `Attempting to leave group: ${conversationId}, userId: ${userId}`
        );

        const response = await fetch(
          getApiUrl(`/conversation-participants/${conversationId}/${userId}`),
          {
            method: "DELETE",
            headers: {
              sessionId: sessionId,
              userId: String(userId),
            },
          }
        );

        console.log("Leave group response status:", response.status);

        if (response.ok) {
          alert("You have left the group");
          window.location.href = "/chats";
        } else {
          const errorText = await response.text();
          console.error("Failed to leave group:", errorText);
          alert(`Failed to leave group: ${errorText}`);
        }
      } catch (error) {
        console.error("Error leaving group:", error);
        alert("Error leaving group: " + error.message);
      }
    }
  };

  const getMessages = async () => {
    const response = await fetch(getApiUrl(`/messages/${conversationId}`), {
      method: "GET",
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error("failed to fetch messages");
    }

    const messageResponse = await response.json();

    setMessages(messageResponse);
    console.log(messageResponse);
  };

  useEffect(() => {
    getMessages();
  }, [conversationId]);

  // WebSocket subscription for live messages
  useEffect(() => {
    let subscription;
    let connected = false;
    let socketModule = null;

    async function setupSocket() {
      try {
        socketModule = await import("../socket/chatService");
        await socketModule.connect();
        subscription = await socketModule.subscribeConversation(
          conversationId,
          (payload) => {
            // Handle different message types
            if (payload.type === "EDIT") {
              // Update existing message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.messageId === payload.messageId
                    ? {
                        ...msg,
                        content: payload.decryptedContent || payload.content,
                        updatedAt: payload.updatedAt,
                      }
                    : msg
                )
              );
            } else if (payload.type === "DELETE") {
              // Mark message as deleted
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.messageId === payload.messageId
                    ? { ...msg, isDeleted: true, updatedAt: payload.updatedAt }
                    : msg
                )
              );
            } else {
              // New message (CHAT type)
              const incoming = {
                messageId:
                  payload.messageId || Math.random().toString(36).slice(2),
                senderId: payload.senderId,
                content: payload.decryptedContent || payload.content,
                createdAt: payload.createdAt,
                isDeleted: false,
              };
              setMessages((prev) => [...prev, incoming]);
            }
          }
        );
        connected = true;
      } catch (e) {
        console.warn("socket setup failed", e);
      }
    }

    if (conversationId) setupSocket();

    return () => {
      try {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe();
        }
        // Cleanup socket connection when component unmounts
        if (socketModule && socketModule.cleanup) {
          socketModule.cleanup();
        }
      } catch (e) {
        console.warn("cleanup error", e);
      }
    };
  }, [conversationId]);

  const [otherUserId, setOtherUserId] = useState(null);

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
      throw new Error("failed to fetch participants");
    }

    const participantsResponse = await response.json();

    console.log(participantsResponse);

    const otherUser = participantsResponse.find((p) => p.userId !== userId);
    setOtherUserId(otherUser?.userId); // Create state for this if needed

    console.log("Other participant ID:", otherUser?.userId);
  };

  const getGroupMembers = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/conversation-participants/${conversationId}`),
        {
          headers: { sessionId, userId: String(userId) },
        }
      );

      if (!response.ok) return;
      const participants = await response.json();

      // Fetch user details for each participant
      const memberDetails = [];
      for (const participant of participants) {
        try {
          const userRes = await fetch(
            getApiUrl(`/user/${participant.userId}`),
            { headers: { sessionId, userId: String(userId) } }
          );
          if (userRes.ok) {
            const user = await userRes.json();
            memberDetails.push(user);
          }
        } catch (err) {
          console.error(`Error fetching user ${participant.userId}:`, err);
        }
      }

      setGroupMembers(memberDetails);
      console.log("Group members:", memberDetails);
    } catch (err) {
      console.error("Error fetching group members:", err);
    }
  };

  useEffect(() => {
    getParticipants();
    getConversation();
  }, [conversationId]);

  useEffect(() => {
    // Fetch group members if it's a group conversation
    if (convo?.isGroup) {
      getGroupMembers();
    }
  }, [convo]);

  const getUser = async () => {
    const response = await fetch(getApiUrl(`/user/${otherUserId}`), {
      method: "GET",
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error("failed to fetch user details");
    }

    const userResponse = await response.json();
    setUserDetails(userResponse);
    console.log(userResponse);
  };

  const getCommonGroups = async () => {
    if (!otherUserId) return;

    try {
      // Fetch all conversations for current user
      const myConvosRes = await fetch(
        getApiUrl(`/conversations?userId=${userId}`),
        {
          headers: { sessionId, userId: String(userId) },
        }
      );

      if (!myConvosRes.ok) return;
      const myConvos = await myConvosRes.json();

      console.log("All my conversations:", myConvos);

      // Filter group conversations (isGroup === true)
      const groups = myConvos.filter((c) => c.isGroup);

      console.log("My group conversations:", groups);

      // Check each group for the other user as participant
      const common = [];
      for (const group of groups) {
        const participantsRes = await fetch(
          getApiUrl(`/conversation-participants/${group.conversationId}`),
          { headers: { sessionId, userId: String(userId) } }
        );

        if (participantsRes.ok) {
          const participants = await participantsRes.json();
          console.log(`Group ${group.title} participants:`, participants);
          console.log(`Looking for otherUserId: ${otherUserId}`);

          const hasOtherUser = participants.some(
            (p) => p.userId === otherUserId
          );

          console.log(`Has other user in group ${group.title}:`, hasOtherUser);

          if (hasOtherUser) {
            // Fetch member details for this group
            const memberDetails = [];
            console.log(
              `Fetching members for group ${group.groupName || group.conversationId}:`,
              participants
            );

            for (const participant of participants) {
              try {
                const userRes = await fetch(
                  getApiUrl(`/user/${participant.userId}`),
                  { headers: { sessionId, userId: String(userId) } }
                );
                if (userRes.ok) {
                  const user = await userRes.json();
                  console.log(`Fetched user:`, user);
                  memberDetails.push(user);
                }
              } catch (err) {
                console.error(
                  `Error fetching user ${participant.userId}:`,
                  err
                );
              }
            }

            console.log(
              `Group ${group.title || group.groupName} members:`,
              memberDetails
            );
            common.push({
              ...group,
              members: memberDetails,
            });
          }
        }
      }

      // Remove duplicates based on conversationId
      const uniqueCommon = common.filter(
        (group, index, self) =>
          index ===
          self.findIndex((g) => g.conversationId === group.conversationId)
      );

      console.log("Common groups (before dedupe):", common);
      console.log("Common groups (after dedupe):", uniqueCommon);

      setCommonGroups(uniqueCommon);
    } catch (err) {
      console.error("Error fetching common groups:", err);
    }
  };

  useEffect(() => {
    if (otherUserId) {
      getUser();
      getCommonGroups();

      // Refresh user status every 10 seconds
      const statusInterval = setInterval(() => {
        getUser();
      }, 10000);

      return () => clearInterval(statusInterval);
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
      throw new Error("failed to fetch");
    }
    const convoResponse = await response.json();
    setConvo(convoResponse);
    console.log(convoResponse);
  };
  useEffect(() => {
    getConversation();
  }, [conversationId]);

  const setLastSeen = async () => {
    const response = await fetch(
      getApiUrl(
        `/conversation-participants/last-seen/${conversationId}/${otherUserId}`
      ),
      {
        method: "PATCH",
        headers: {
          sessionId,
          userId,
        },
      }
    );

    const lastSeenResponse = await response.json();
    console.log("last seen", lastSeenResponse);
  };

  useEffect(() => {
    if (otherUserId) {
      setLastSeen();
    }
  }, [conversationId, otherUserId]);

  return (
    <div className="convo-page-side2">
      <div className="convo-page-side21">
        <div className="convo-page-side2-user">
          <div className="convo-page-side2-user-pic" onClick={toogleSide22}>
            <img
              src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
              className="convo-page-side2-user-pic-img"
            />
          </div>
          <div className="convo-page-side2-user-name" onClick={toogleSide22}>
            <div className="u-name">
              {" "}
              {convo?.isGroup
                ? convo?.title || "Unnamed Group"
                : userDetails?.name || "Unknown User"}
            </div>
            <div className="status">
              {convo?.isGroup
                ? `${convo?.title || "Group"}`
                : getLastSeenText(userDetails?.lastSeen, userDetails?.isOnline)}
            </div>
          </div>
          <div className="convo-page-side2-user-call"></div>
        </div>
        <div className="convo-page-side2-convo" ref={chatContainerRef}>
          {messages.map((item) => (
            <Message
              key={item.messageId}
              message={item}
              isUserMessage={item?.senderId === userId}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              style={{
                alignSelf:
                  item?.senderId === userId ? "flex-end" : "flex-start",
              }}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="convo-page-side2-search">
          {editingMessage && (
            <div
              style={{
                padding: "8px 12px",
                background: "#2a2a2a",
                borderRadius: "8px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  Editing message
                </div>
                <div style={{ fontSize: "14px", color: "#fff" }}>
                  {editingMessage.content.substring(0, 50)}...
                </div>
              </div>
              <button
                onClick={cancelEdit}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>
          )}
          <div className="convo-page-side2-search1">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BsEmojiSmile />
            </button>
          </div>
          <div className="convo-page-side2-search2">
            <input
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder=" Type a message"
              value={message}
            />
          </div>
          <div
            className="convo-page-side2-search3"
            style={{ display: "flex", gap: "5px", alignItems: "center" }}
          >
            <button onClick={sendMessage}>
              {editingMessage ? "Update" : "send"}
            </button>
          </div>
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "60px",
                left: "10px",
                zIndex: 1000,
              }}
            >
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
      {toogle && (
        <div className="convo-page-side22">
          {(() => {
            console.log("Convo data:", convo);
            console.log("Is group conversation:", convo?.isGroup);
            console.log("Group members:", groupMembers);
            return null;
          })()}
          {convo?.isGroup ? (
            // Group Info
            <>
              <div className="convo-cont-info">
                <div className="convo-head">
                  <button className="cross-btn" onClick={toogleSide22}>
                    <RxCross1 />
                  </button>
                  <div>Group info</div>
                </div>
                <div className="convo-img-cont">
                  <div className="group-icon-large">👥</div>
                  <div className="user-info-name">
                    {convo?.title || convo?.groupName || "Unnamed Group"}
                  </div>
                  <div className="user-info-email">
                    {groupMembers.length} members
                  </div>
                </div>
              </div>

              <div className="common-groups">
                <div className="common-groups-head">
                  {groupMembers.length} MEMBERS
                </div>
                <div className="group-members-list">
                  {groupMembers.map((member) => (
                    <div key={member.userId} className="group-member-item">
                      <img
                        src={
                          member.profile_img_url ||
                          "https://i.ibb.co/67HWYXmq/icons8-user-96.png"
                        }
                        alt={member.name}
                        className="member-avatar"
                      />
                      <div className="member-info">
                        <div className="member-name">
                          {member.userId === userId ? "You" : member.name}
                        </div>
                        <div className="member-status">
                          {member.email || "Available"}
                        </div>
                      </div>
                      {member.userId !== userId && (
                        <div className="member-role">Group admin</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="brd">
                <div
                  className="report"
                  onClick={handleLeaveGroup}
                  style={{ cursor: "pointer", color: "#e74c3c" }}
                >
                  <MdDeleteOutline style={{ fontSize: "135%" }} />
                  <div style={{ fontSize: "110%" }}>Leave Group</div>
                </div>
              </div>
            </>
          ) : (
            // User Info (1-on-1 chat)
            <>
              <div className="convo-cont-info">
                <div className="convo-head">
                  <button className="cross-btn" onClick={toogleSide22}>
                    <RxCross1 />
                  </button>
                  <div>User info</div>
                </div>
                <div className="convo-img-cont">
                  <img
                    src={
                      userDetails?.profile_img_url ||
                      "https://i.ibb.co/67HWYXmq/icons8-user-96.png"
                    }
                    className="convo-page-side2-user-pic-img"
                    alt="User profile"
                  />
                  <div className="user-info-name">{userDetails?.name}</div>
                  <div className="user-info-email">{userDetails?.email}</div>
                </div>
              </div>

              <div className="common-groups">
                <div className="common-groups-head">
                  {commonGroups.length}{" "}
                  {commonGroups.length === 1 ? "GROUP" : "GROUPS"} IN COMMON
                </div>
                <div className="group-members-list">
                  {commonGroups.length > 0 ? (
                    commonGroups.map((group) => {
                      console.log("Rendering group:", group);
                      console.log("Group members:", group.members);
                      return (
                        <div
                          key={group.conversationId}
                          className="group-member-item"
                          onClick={() =>
                            (window.location.href = `/chats?conversationId=${group.conversationId}`)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            className="member-avatar"
                            style={{
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "24px",
                            }}
                          >
                            👥
                          </div>
                          <div className="member-info">
                            <div className="member-name">
                              {group.title ||
                                group.groupName ||
                                "Unnamed Group"}
                            </div>
                            <div className="member-status">
                              {group.members && group.members.length > 0
                                ? group.members.map((m) => m.name).join(", ")
                                : "No members"}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-common-groups">
                      <span>📭</span>
                      <p>No groups in common</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="brd">
            <div className="report" style={{ cursor: "pointer" }}>
              <MdBlock style={{ fontSize: "135%" }} />
              <div style={{ fontSize: "110%" }}>Block</div>
            </div>
            <div className="report" style={{ cursor: "pointer" }}>
              <MdOutlineReportProblem style={{ fontSize: "135%" }} />
              <div style={{ fontSize: "110%" }}>Report</div>
            </div>
            <div
              className="report"
              onClick={handleDeleteConversation}
              style={{ cursor: "pointer" }}
            >
              <MdDeleteOutline style={{ fontSize: "135%" }} />
              <div style={{ fontSize: "110%" }}>Delete Chat</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
