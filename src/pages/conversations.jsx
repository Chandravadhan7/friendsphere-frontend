import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./conversation.css";
import Conversation from "../components/conversation/conversation";
import ChatBox from "./chatbox";
import { getApiUrl } from "../config/api";
import { RiChatNewLine } from "react-icons/ri";
import { FaArrowLeftLong } from "react-icons/fa6";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { AiOutlineUserAdd } from "react-icons/ai";
import FriendCard from "../components/friendCard/friendCard";
import { FaCheck } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";

export default function Conversations() {
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvoId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState([]);
  const [allProcessedConversations, setAllProcessedConversations] = useState(
    [],
  );
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [togglenewgroup, setTogglenewgroup] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [selectedConversationId, setSelectedConversationId] =
    useState(initialConvoId);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupSubject, setGroupSubject] = useState("");
  const [groupIcon, setGroupIcon] = useState(null);
  const [about, setAbout] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);

  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 500;
      setIsMobile(mobile);
      if (!mobile) setIsMobileChatOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setSelectedFriendId(null);
    setSearchParams({ conversationId });
  };

  const toggleChats = () => {
    setToggle((prev) => {
      if (prev) {
        setTogglenewgroup(false);
        setSelectedGroupMembers([]);
        setShowGroupDetails(false);
      }
      return !prev;
    });
  };

  const toggleGroup = () => {
    setTogglenewgroup(true);
  };

  const toggleGroupMember = (id) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const handleIconUpload = (e) => {
    setGroupIcon(e.target.files[0]);
  };

  const createGroup = async () => {
    const conversation = {
      createdAt: Date.now(),
      isGroup: true,
      creatorId: userId,
      title: groupSubject,
    };

    const response = await fetch(getApiUrl("/conversations"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        sessionId,
        userId,
      },
      body: JSON.stringify(conversation),
    });

    if (!response.ok) {
      console.error("Failed to create group conversation");
      return;
    }

    const group = await response.json();
    const allMembers = [...selectedGroupMembers, +userId];

    for (const id of allMembers) {
      await addParticipant(group.conversationId, id);
    }

    // Delay to ensure conversation is ready
    setTimeout(() => {
      setSelectedConversationId(group.conversationId);
      setSearchParams({ conversationId: group.conversationId });
    }, 100);

    // Reset UI
    setToggle(false);
    setTogglenewgroup(false);
    setSelectedGroupMembers([]);
    setGroupSubject("");
    setGroupIcon(null);
    setShowGroupDetails(false);
  };

  const checkOrCreateConversation = async (friendId) => {
    try {
      const response = await fetch(getApiUrl("/conversations"), {
        method: "GET",
        headers: {
          sessionId,
          userId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const allConversations = await response.json();

      let existingConvo = null;

      for (const convo of allConversations) {
        const res = await fetch(
          getApiUrl(`/conversation-participants/${convo.conversationId}`),
          {
            headers: {
              sessionId,
              userId,
            },
          },
        );

        if (!res.ok) continue;

        const participants = await res.json();

        const isOther = participants.some(
          (p) => p.userId === parseInt(friendId),
        );
        const isSelf = participants.some((p) => p.userId === parseInt(userId));

        if (isOther && isSelf && !convo.isGroup) {
          existingConvo = convo;
          break;
        }
      }

      if (existingConvo) {
        setSelectedConversationId(existingConvo.conversationId);
        setSearchParams({ conversationId: existingConvo.conversationId });
        return;
      }

      await createConversation(friendId);
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  const createConversation = async (friendId) => {
    const conversation = {
      createdAt: Date.now(),
      isGroup: false,
      creatorId: userId,
    };

    const response = await fetch(getApiUrl("/conversations"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        sessionId,
        userId,
      },
      body: JSON.stringify(conversation),
    });

    if (!response.ok) {
      throw new Error("Unable to create conversation");
    }

    const convo = await response.json();

    await addParticipant(convo.conversationId, userId);
    await addParticipant(convo.conversationId, friendId);

    setSelectedConversationId(convo.conversationId);
    setSearchParams({ conversationId: convo.conversationId });
  };

  const addParticipant = async (convoId, uid) => {
    const participant = {
      conversationId: convoId,
      userId: uid,
      joinedAt: Date.now(),
      isAdmin: uid === userId,
    };

    const response = await fetch(getApiUrl("/conversation-participants"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        sessionId: sessionId,
        userId: userId,
      },
      body: JSON.stringify(participant),
    });

    if (!response.ok) {
      throw new Error("Unable to add participant");
    }

    const data = await response.json();
    console.log("Participant added:", data);
  };

  const getBio = async () => {
    try {
      const response = await fetch(getApiUrl(`/bio/${userId}`), {
        method: "GET",
        headers: { userId, sessionId },
      });

      if (!response.ok) throw new Error("Failed to fetch bio");

      const text = await response.text();
      setAbout(text ? JSON.parse(text) : null);
    } catch (error) {
      console.error("getBio error:", error.message);
    }
  };

  useEffect(() => {
    getBio();
  }, [userId]);

  const getMutualsFriends = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/friendship/mutual-friends/${userId}`),
        {
          method: "GET",
          headers: { sessionId, userId },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch mutual friends");

      const mutualResponse = await response.json();
      setMutualFriends(mutualResponse);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getMutualsFriends();
  }, [userId]);

  const getConversations = async () => {
    try {
      const resp = await fetch(getApiUrl("/conversations"), {
        headers: { sessionId, userId },
      });
      if (!resp.ok) throw new Error("failed to fetch conversations");
      const data = await resp.json();
      setConversations(data);
      console.log(data);
      filterConversationsWithMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filterConversationsWithMessages = async (allConvos) => {
    console.log(
      "Starting filterConversationsWithMessages with",
      allConvos.length,
      "conversations",
    );
    const results = [];
    for (const convo of allConvos) {
      try {
        // Fetch messages
        const msgRes = await fetch(
          getApiUrl(`/messages/${convo.conversationId}`),
          { headers: { sessionId, userId } },
        );
        if (!msgRes.ok) {
          console.log(`Failed to fetch messages for ${convo.conversationId}`);
          continue;
        }
        const msgs = await msgRes.json();
        console.log(
          `Conversation ${convo.conversationId} has ${msgs.length} messages:`,
          msgs,
        );

        if (msgs.length > 0 || convo.conversationId === initialConvoId) {
          // Fetch participants to get names
          const partRes = await fetch(
            getApiUrl(`/conversation-participants/${convo.conversationId}`),
            { headers: { sessionId, userId } },
          );

          let participantNames = [];
          if (partRes.ok) {
            const participants = await partRes.json();
            console.log(
              `Raw participants for ${convo.conversationId}:`,
              participants,
            );

            // Fetch user details for each participant to get their names
            for (const participant of participants) {
              if (participant.userId) {
                try {
                  const userRes = await fetch(
                    getApiUrl(`/user/${participant.userId}`),
                    { headers: { sessionId, userId } },
                  );
                  if (userRes.ok) {
                    const user = await userRes.json();
                    if (user.name) {
                      participantNames.push(user.name);
                    }
                  }
                } catch (error) {
                  console.error(
                    `Error fetching user ${participant.userId}:`,
                    error,
                  );
                }
              }
            }

            console.log(
              `Conversation ${convo.conversationId} participant names:`,
              participantNames,
            );
          }

          // Add latest message timestamp and participant names
          const latestMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          // Try different timestamp properties
          const messageTime =
            latestMessage?.timestamp ||
            latestMessage?.sentAt ||
            latestMessage?.createdAt;
          console.log(
            `Conversation ${convo.conversationId} latest message time:`,
            messageTime,
          );

          results.push({
            ...convo,
            latestMessageTime: messageTime || new Date(0).toISOString(),
            participantNames: participantNames,
          });
        }
      } catch (error) {
        console.error(
          `Error processing conversation ${convo.conversationId}:`,
          error,
        );
      }
    }

    // Sort by latest message timestamp (most recent first)
    results.sort((a, b) => {
      return new Date(b.latestMessageTime) - new Date(a.latestMessageTime);
    });

    console.log("Final sorted results:", results);
    setAllProcessedConversations(results);
    setFilteredConversations(results);
  };

  const getAllFriends = async () => {
    try {
      const resp = await fetch(getApiUrl(`/friendship/friends/${userId}`), {
        headers: { sessionId, userId },
      });
      if (!resp.ok) throw new Error("failed to fetch friends");
      setFriends(await resp.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getConversations();
    getAllFriends();
  }, []);

  useEffect(() => {
    const filterBySearch = () => {
      console.log("Search query:", searchQuery);
      console.log("All processed conversations:", allProcessedConversations);

      if (searchQuery.trim() === "") {
        // Show all processed conversations (already sorted)
        setFilteredConversations(allProcessedConversations);
      } else {
        // Filter the already processed conversations
        const results = allProcessedConversations.filter((convo) => {
          console.log(
            "Checking conversation:",
            convo.conversationId,
            "Participant names:",
            convo.participantNames,
          );

          // Search in participant names
          if (convo.participantNames && convo.participantNames.length > 0) {
            const nameMatch = convo.participantNames.some((name) =>
              name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            if (nameMatch) {
              console.log("Match found in participant names");
              return true;
            }
          }

          // Also check group name for group conversations
          if (
            convo.isGroup &&
            convo.groupName &&
            convo.groupName.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            console.log("Match found in group name");
            return true;
          }

          return false;
        });

        console.log("Filtered results:", results);
        setFilteredConversations(results);
      }
    };

    filterBySearch();
  }, [searchQuery, allProcessedConversations]);

  useEffect(() => {
    if (initialConvoId) {
      setSelectedConversationId(initialConvoId);
    }
  }, [initialConvoId]);

  return (
    <div
      className={`convo-page ${isMobile && isMobileChatOpen ? "mobile-chat-open" : ""}`}
    >
      {(!isMobile || !isMobileChatOpen) && (
        <div className="convo-page-side1">
          <div className="convo-page-side1-title">
            <div className="cpchat">Chats</div>
            <div className="cpicon">
              <AiOutlineUserAdd
                style={{ fontSize: "120%", marginTop: "5px" }}
                onClick={toggleChats}
              />
            </div>
          </div>
          <div className="convo-page-side1-search">
            <input
              placeholder="search conversation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="convo-page-side1-chats">
            {filteredConversations.length === 0 && searchQuery.trim() !== "" ? (
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  textAlign: "center",
                  marginTop: "40px",
                  fontSize: "15px",
                  padding: "0 20px",
                }}
              >
                No conversations found matching "{searchQuery}"
              </div>
            ) : (
              filteredConversations.map((item) => (
                <Conversation
                  key={item.conversationId}
                  conversationId={item.conversationId}
                  onClick={() => {
                    selectConversation(item.conversationId);
                    if (isMobile) setIsMobileChatOpen(true);
                  }}
                  isSelected={
                    String(selectedConversationId) ===
                    String(item.conversationId)
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ChatBox */}
      {selectedConversationId && (!isMobile || isMobileChatOpen) ? (
        <>
          {/* Add back button for mobile */}
          {isMobile && isMobileChatOpen && (
            <button
              className="mobile-back-btn"
              onClick={() => setIsMobileChatOpen(false)}
            >
              ← Back
            </button>
          )}
          <ChatBox
            conversationId={selectedConversationId}
            onBack={() => setIsMobileChatOpen(false)}
          />
        </>
      ) : !selectedConversationId && (!isMobile || !isMobileChatOpen) ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "hsl(222, 47%, 8%)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "hsl(222, 30%, 18%)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <RiChatNewLine size={32} color="hsl(215, 20%, 55%)" />
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "hsl(210, 40%, 96%)",
              marginBottom: "8px",
              margin: "0",
            }}
          >
            Your messages
          </h2>
          <p
            style={{
              color: "hsl(215, 20%, 55%)",
              fontSize: "14px",
              marginTop: "8px",
            }}
          >
            Select a conversation to start chatting
          </p>
        </div>
      ) : null}

      {/* Modals Overlay */}
      {toggle && (
        <div className="new-chat-modal-overlay" onClick={toggleChats}>
          <div
            className="new-chat-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="new-chat-modal-header">
              <h2>{togglenewgroup ? "New Group" : "New Chat"}</h2>
              <button className="new-chat-modal-close" onClick={toggleChats}>
                <RxCross1 />
              </button>
            </div>

            {togglenewgroup && showGroupDetails ? (
              <div className="new-chat-modal-body">
                <div
                  className="group-icon-section"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <label
                    className="group-icon-label"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      backgroundColor: "#2a2c36",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#8A94A6",
                      fontSize: "12px",
                      textAlign: "center",
                      padding: "10px",
                    }}
                  >
                    <input type="file" onChange={handleIconUpload} hidden />
                    <div className="icon-placeholder">ADD GROUP ICON</div>
                  </label>
                </div>
                <div
                  className="new-chat-modal-search"
                  style={{ marginTop: "20px" }}
                >
                  <input
                    type="text"
                    placeholder="Group subject (optional)"
                    value={groupSubject}
                    onChange={(e) => setGroupSubject(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "30px",
                  }}
                >
                  <button
                    onClick={createGroup}
                    style={{
                      backgroundColor: "#8b5cf6",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "24px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Create Group
                  </button>
                </div>
              </div>
            ) : togglenewgroup ? (
              <div className="new-chat-modal-body">
                <div className="new-chat-modal-search">
                  <div className="search-icon-wrapper">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinelinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  <input placeholder="search friends" />
                </div>
                <div className="new-chat-modal-list">
                  {friends.map((item) => {
                    const isSelected = selectedGroupMembers.includes(
                      item.userId,
                    );
                    return (
                      <div
                        key={item.userId}
                        className={`modal-friend-wrapper ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleGroupMember(item.userId)}
                      >
                        <FriendCard
                          friendItem={item}
                          isSelected={isSelected}
                          inModal={true}
                        />
                      </div>
                    );
                  })}
                </div>
                {selectedGroupMembers.length > 0 && (
                  <div className="modal-footer-action">
                    <button onClick={() => setShowGroupDetails(true)}>
                      Continue
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="new-chat-modal-body">
                <div className="new-chat-modal-search">
                  <div className="search-icon-wrapper">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinelinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  <input placeholder="search friends" />
                </div>

                <div className="modal-new-group-btn" onClick={toggleGroup}>
                  <div className="group-btn-icon">
                    <HiOutlineUserGroup size={24} />
                  </div>
                  <span>New Group</span>
                </div>

                <div className="new-chat-modal-list">
                  {friends.map((item) => (
                    <div className="modal-friend-wrapper" key={item.userId}>
                      <FriendCard
                        friendItem={item}
                        inModal={true}
                        onClick={async () => {
                          setSelectedFriendId(item.userId);
                          setToggle(false);
                          if (!isMobile) {
                            await checkOrCreateConversation(item.userId);
                          } else {
                            setTimeout(async () => {
                              await checkOrCreateConversation(item.userId);
                              setIsMobileChatOpen(true);
                            }, 100);
                          }
                        }}
                        isSelected={selectedFriendId === item.userId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
