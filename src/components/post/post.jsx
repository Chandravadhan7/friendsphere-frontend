import { useEffect, useState } from "react";
import "./post.css";
import { formatDistanceToNowStrict } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikes } from "../../pages/fetchLikes";
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
  const [conversationNames, setConversationNames] = useState({});
  const [loadingNames, setLoadingNames] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();
  const postId = postItem?.postId;
  const getRelativeTime = (epoch) => {
    return formatDistanceToNowStrict(new Date(epoch), { addSuffix: true });
  };

  const handleLike = async () => {
    try {
      const response = await fetch(
        `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/likes/post?postId=${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            userId: userId,
            sessionId: sessionId,
          },
        }
      );
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
        `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/likes/post/dislike?postId=${postId}`,
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
    const response = await fetch(
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/comments?postId=${postId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          userId: userId,
          sessionId: sessionId,
        },
      }
    );
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
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/comments/postcomment?postId=${postId}`,
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
    const response = await fetch(
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/user/${postItem?.userId}`,
      {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      }
    );

    if (!response.ok) {
      throw new Error("failed to fetch user details");
    }

    const userResponse = await response.json();
    setUserDetails(userResponse);
    console.log(userResponse);
  };

  useEffect(() => {
    getUser();
  }, [postItem?.userId]);

  const getConversations = async () => {
    try {
      setLoadingNames(true);
      const response = await fetch(
        `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/conversations?userId=${userId}`,
        {
          headers: { sessionId, userId },
        }
      );
      if (response.ok) {
        const convos = await response.json();
        setConversations(convos);

        // Fetch names for each conversation
        const names = {};
        const namePromises = convos.map(async (convo) => {
          if (convo.isGroup) {
            names[convo.conversationId] = convo.title || "Unnamed Group";
          } else {
            // Fetch participants for 1-on-1 chats
            try {
              const partRes = await fetch(
                `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/conversation-participants/${convo.conversationId}`,
                { headers: { sessionId, userId } }
              );
              if (partRes.ok) {
                const participants = await partRes.json();
                const otherUser = participants.find(
                  (p) => p.userId !== Number(userId)
                );
                if (otherUser) {
                  const userRes = await fetch(
                    `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/user/${otherUser.userId}`,
                    { headers: { sessionId, userId } }
                  );
                  if (userRes.ok) {
                    const user = await userRes.json();
                    names[convo.conversationId] = user.name || "Unknown User";
                  } else {
                    names[convo.conversationId] = "Chat";
                  }
                } else {
                  names[convo.conversationId] = "Chat";
                }
              } else {
                names[convo.conversationId] = "Chat";
              }
            } catch (err) {
              console.error("Failed to fetch conversation name", err);
              names[convo.conversationId] = "Chat";
            }
          }
        });

        await Promise.all(namePromises);
        console.log("Conversation names loaded:", names);
        setConversationNames(names);
        setLoadingNames(false);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoadingNames(false);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    getConversations();
  };

  const shareToChat = async (conversationId) => {
    try {
      const postUrl = `${window.location.origin}/home?postId=${postItem?.postId}`;
      const userName = userDetails?.name || "Someone";
      const shareMessage = `${userName} shared a post\n${postUrl}`;

      const response = await fetch(
        "http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/messages",
        {
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
        }
      );

      if (response.ok) {
        alert("Post shared successfully!");
        setShowShareModal(false);
      } else {
        alert("Failed to share post");
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
      `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/post/delete-post?postId=${postItem?.postId}`,
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
              {loadingNames ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#888",
                  }}
                >
                  Loading conversations...
                </div>
              ) : (
                <>
                  {conversations
                    .filter((convo) => {
                      const name =
                        conversationNames[convo.conversationId] || "";
                      return name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    })
                    .map((convo) => (
                      <div
                        key={convo.conversationId}
                        className="share-conversation-item"
                        onClick={() => shareToChat(convo.conversationId)}
                      >
                        <div className="share-convo-icon">
                          {convo.isGroup ? "👥" : "👤"}
                        </div>
                        <div className="share-convo-name">
                          {conversationNames[convo.conversationId] ||
                            "Loading..."}
                        </div>
                      </div>
                    ))}
                  {conversations.filter((convo) => {
                    const name = conversationNames[convo.conversationId] || "";
                    return name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase());
                  }).length === 0 &&
                    !loadingNames && (
                      <div className="no-conversations">
                        No conversations found
                      </div>
                    )}
                </>
              )}
            </div>
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
