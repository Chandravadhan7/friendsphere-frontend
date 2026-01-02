import { useEffect, useState } from "react";
import "./post.css";
import { formatDistanceToNowStrict } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikes } from "../../pages/fetchLikes";
import { getApiUrl } from "../../config/api";
import Comment from "../comments/comment";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { FaRegComment } from "react-icons/fa";
import ShareIcon from "@mui/icons-material/Share";
import { BsThreeDots } from "react-icons/bs";
export default function Post({ postItem, likes }) {
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const [comments, setCommments] = useState([]);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [senderDetails, setSenderDetails] = useState(null);

  const dispatch = useDispatch();
  const postId = postItem?.postId;
  const getRelativeTime = (epoch) => {
    return formatDistanceToNowStrict(new Date(epoch), { addSuffix: true });
  };

  const handleLike = async () => {
    try {
      const response = await fetch(getApiUrl(`/likes/post?postId=${postId}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: userId,
          sessionId: sessionId,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to like post. Status: ${response.status}`);
      }
      const result = await response.text();
      console.log(result);
      dispatch(fetchLikes());
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handledislike = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/likes/post/dislike?postId=${postId}`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            userId: userId,
            sessionId: sessionId,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to dislike post. Status: ${response.status}`);
      }
      console.log("Post disliked");
      dispatch(fetchLikes());
    } catch (error) {
      console.error("Error disliking post:", error);
    }
  };

  const likesState = useSelector((state) => state.likes);
  const liked = likesState.likes.some((like) => like.postId === postId);

  const getComments = async () => {
    const response = await fetch(getApiUrl(`/comments?postId=${postId}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        userId: userId,
        sessionId: sessionId,
      },
    });
    if (!response.ok) {
      throw new Error("unable to fetch comments");
    }

    const commentsResponse = await response.json();
    setCommments(commentsResponse);
    console.log("comments", commentsResponse);
  };

  useEffect(() => {
    getComments();
  }, []);

  const addComment = async () => {
    let inputobj = { content: comment };
    const response = await fetch(
      getApiUrl(`/comments/postcomment?postId=${postId}`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: userId,
          sessionId: sessionId,
        },
        body: JSON.stringify(inputobj),
      }
    );
    if (!response.ok) {
      throw new Error("commenting on post is failed");
    }

    const commentResponse = await response.json();
    console.log("comment message", commentResponse);
  };

  const getUser = async () => {
    const response = await fetch(getApiUrl(`/user/${postItem?.userId}`), {
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

  const getSenderDetails = async () => {
    const response = await fetch(getApiUrl(`/user/${userId}`), {
      method: "GET",
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error("failed to fetch sender details");
    }

    const senderResponse = await response.json();
    setSenderDetails(senderResponse);
  };

  useEffect(() => {
    getUser();
    getSenderDetails();
  }, [postItem?.userId]);

  const getConversations = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/conversations?userId=${userId}`),
        {
          headers: {
            sessionId: sessionId,
            userId: String(userId),
          },
        }
      );
      if (response.ok) {
        const convos = await response.json();
        console.log("Raw conversations:", convos);

        // Enrich conversations with participant names
        const enrichedConvos = await Promise.all(
          convos.map(async (convo) => {
            if (!convo.isGroup) {
              try {
                // Get participants for 1-on-1 conversations
                const participantsResponse = await fetch(
                  getApiUrl(
                    `/conversation-participants/${convo.conversationId}`
                  ),
                  {
                    headers: {
                      sessionId: sessionId,
                      userId: String(userId),
                    },
                  }
                );

                if (participantsResponse.ok) {
                  const participants = await participantsResponse.json();
                  console.log(
                    `Participants for convo ${convo.conversationId}:`,
                    participants
                  );

                  const otherUser = participants.find(
                    (p) => p.userId !== Number(userId)
                  );
                  console.log("Other user:", otherUser);

                  if (otherUser) {
                    // Get other user's details
                    const userResponse = await fetch(
                      getApiUrl(`/user/${otherUser.userId}`),
                      {
                        headers: {
                          sessionId: sessionId,
                          userId: String(userId),
                        },
                      }
                    );

                    if (userResponse.ok) {
                      const userDetails = await userResponse.json();
                      console.log("User details:", userDetails);
                      convo.participantNames = [
                        userDetails.name ||
                          userDetails.fullname ||
                          "Unknown User",
                      ];
                    } else {
                      console.error(
                        "Failed to fetch user details:",
                        userResponse.status
                      );
                    }
                  }
                } else {
                  console.error(
                    "Failed to fetch participants:",
                    participantsResponse.status
                  );
                }
              } catch (error) {
                console.error("Error enriching conversation:", error);
              }
            }
            return convo;
          })
        );

        console.log("Enriched conversations:", enrichedConvos);
        setConversations(enrichedConvos);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    setSelectedConversations([]);
    getConversations();
  };

  const toggleConversationSelection = (conversationId) => {
    setSelectedConversations((prev) => {
      if (prev.includes(conversationId)) {
        return prev.filter((id) => id !== conversationId);
      } else {
        if (prev.length >= 4) {
          alert("You can only select up to 4 conversations");
          return prev;
        }
        return [...prev, conversationId];
      }
    });
  };

  const shareToMultipleChats = async () => {
    try {
      const postUrl = `${window.location.origin}/home?postId=${postItem?.postId}`;
      const senderName = senderDetails?.name || "Someone";
      const shareMessage = `${senderName} shared a post\n${postUrl}`;

      const sharePromises = selectedConversations.map((conversationId) =>
        fetch(getApiUrl("/messages"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            sessionId: sessionId,
            userId: userId,
          },
          body: JSON.stringify({
            conversationId: conversationId,
            senderId: userId,
            messageType: "TEXT",
            content: shareMessage,
            createdAt: Date.now(),
            updatedAt: null,
            isDeleted: false,
            replyToMessageId: null,
          }),
        })
      );

      const results = await Promise.all(sharePromises);
      const allSuccessful = results.every((res) => res.ok);

      if (allSuccessful) {
        alert(
          `Post shared successfully to ${selectedConversations.length} chat(s)!`
        );
        setShowShareModal(false);
        setSelectedConversations([]);
      } else {
        alert("Some shares failed. Please try again.");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      alert("Error sharing post");
    }
  };

  const hasDescription = !!postItem?.description;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const deletePost = async () => {
    const response = await fetch(
      getApiUrl(`/post/delete-post?postId=${postItem?.postId}`),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          userId: userId,
          sessionId: sessionId,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete post");
    }

    alert("Post deleted successfully!");
    window.location.reload(); // Reload the page after deletion
  };

  return (
    <div className={`whole-cont ${showComments ? "expanded" : ""}`}>
      {postItem?.sharedBy && (
        <div className="post-shared-indicator">
          <img
            src={
              postItem.sharedBy.profileImg ||
              "https://i.ibb.co/67HWYXmq/icons8-user-96.png"
            }
            className="shared-user-pic"
            alt="shared by"
          />
          <div className="shared-info">
            <div className="shared-user-name">{postItem.sharedBy.name}</div>
            <div className="shared-text">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              {postItem.sharedBy.name.toLowerCase()} shared a post
            </div>
          </div>
        </div>
      )}
      <div
        className="post-cont"
        style={!hasDescription ? { minHeight: "450px" } : {}}
      >
        <div
          className="post-pro"
          style={hasDescription ? { height: "15%" } : {}}
        >
          <div className="post-pro-pic-cont">
            <img
              src={
                userDetails?.profile_img_url ||
                "https://i.ibb.co/67HWYXmq/icons8-user-96.png"
              }
              className="post-pro-pic"
              alt="profile"
            />
          </div>
          <div className="post-pro-name">
            <div className="post-pro-user-name">{userDetails?.name}</div>
            <div className="post-pro-name-time">
              {getRelativeTime(postItem?.createdAt)}
            </div>
          </div>
          <div className="dropdown-container">
            <BsThreeDots
              style={{ fontSize: "140%", cursor: "pointer" }}
              onClick={toggleDropdown}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={deletePost}>
                  Delete
                </div>
              </div>
            )}
          </div>
        </div>

        {hasDescription && (
          <div className="post-des">{postItem?.description}</div>
        )}

        <div
          className="post-content"
          style={hasDescription ? { height: "75%" } : {}}
        >
          <img src={postItem?.imageUrl} className="post-pro-pic1" />
        </div>

        <div className="post-lcs">
          <div
            className="post-like"
            onClick={liked ? handledislike : handleLike}
          >
            {liked ? (
              <FavoriteIcon sx={{ color: "red" }} />
            ) : (
              <FavoriteBorderOutlinedIcon />
            )}
          </div>
          <div
            className="post-comment"
            onClick={() => setShowComments(!showComments)}
          >
            <FaRegComment style={{ fontSize: "130%" }} />
          </div>
          <div className="post-share" onClick={handleShareClick}>
            <ShareIcon />
          </div>
        </div>
      </div>

      {showShareModal && (
        <div
          className="share-modal-overlay"
          onClick={() => setShowShareModal(false)}
        >
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share to chat</h3>
              <button
                className="share-close-btn"
                onClick={() => setShowShareModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="share-search">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="share-search-input"
              />
            </div>
            <div className="share-conversations-list">
              {conversations
                .filter((convo) => {
                  const name = convo.isGroup
                    ? convo.title || ""
                    : convo.participantNames?.join(", ") || "";
                  return name.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((convo) => (
                  <div
                    key={convo.conversationId}
                    className={`share-conversation-item ${selectedConversations.includes(convo.conversationId) ? "selected" : ""}`}
                    onClick={() =>
                      toggleConversationSelection(convo.conversationId)
                    }
                  >
                    <div className="share-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedConversations.includes(
                          convo.conversationId
                        )}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="share-convo-icon">
                      {convo.isGroup ? "👥" : "👤"}
                    </div>
                    <div className="share-convo-name">
                      {convo.isGroup
                        ? convo.title || "Unnamed Group"
                        : convo.participantNames?.join(", ") || "Unknown User"}
                    </div>
                  </div>
                ))}
              {conversations.filter((convo) => {
                const name = convo.isGroup
                  ? convo.title || ""
                  : convo.participantNames?.join(", ") || "";
                return name.toLowerCase().includes(searchQuery.toLowerCase());
              }).length === 0 && (
                <div className="no-conversations">No conversations found</div>
              )}
            </div>
            {selectedConversations.length > 0 && (
              <div className="share-modal-footer">
                <div className="share-selected-count">
                  {selectedConversations.length} selected
                </div>
                <button
                  className="share-send-btn"
                  onClick={shareToMultipleChats}
                >
                  <ShareIcon style={{ fontSize: "20px" }} />
                  <span>Share</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showComments && (
        <div className="comments">
          <div className="comment-child">
            {comments.map((item) => (
              <Comment comment={item} key={item.commentId} />
            ))}
          </div>
          <div className="add-comment">
            <div className="pic-cont">
              <img
                src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
                className="post-pro-pic"
                alt="profile"
              />
            </div>
            <input
              placeholder="write a comment"
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              className="comment-bar"
            />
            <button
              onClick={() => {
                addComment();
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
              className="comment-btn"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
