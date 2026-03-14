import { formatDistanceToNowStrict } from "date-fns";
import "./comment.css";
import { useEffect, useState } from "react";
import { getApiUrl } from "../../config/api";

export default function Comment({ comment }) {
  let sessionId = localStorage.getItem("sessionId");
  let userId = localStorage.getItem("userId");
  let [replies, setReplies] = useState([]);
  let [showReplies, setShowReplies] = useState(false);
  let [reply, setReply] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const getRelativeTime = (epoch) => {
    return formatDistanceToNowStrict(new Date(epoch), { addSuffix: true });
  };

  const getReplies = async () => {
    const response = await fetch(
      getApiUrl(`/comments/replies/${comment?.commentId}`),
      {
        method: "GET",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      }
    );
    if (!response.ok) {
      throw new Error("failed to fetch replies");
    }
    const repliesResponse = await response.json();
    setReplies(repliesResponse);
    console.log("comment replies", repliesResponse);
  };

  useEffect(() => {
    getReplies();
  }, []);

  const addReply = async () => {
    let inputObj = { content: reply };
    const response = await fetch(
      getApiUrl(
        `/comments/postComment?postId=${comment?.postId}&parentId=${comment?.commentId}`
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: userId,
          sessionId: sessionId,
        },
        body: JSON.stringify(inputObj),
      }
    );
    if (!response.ok) {
      throw new Error("failed to add reply");
    }
    const replyResponse = await response.json();
    setReplies([...replies, replyResponse]);
    setReply("");
  };

  const getUser = async () => {
    const response = await fetch(getApiUrl(`/user/${comment?.userId}`), {
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

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="whole-cont1">
      <div className="comment-cont">
        <div className="comment-cont-s1">
          <div className="comment-cont-s1-img-cont">
            <img
              src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
              className="post-pro-pic"
              alt="profile"
            />
          </div>
        </div>
        <div className="comment-cont-s2">
          <div className="comment-cont-s2-1">
            <div className="comm-username">
              <div style={{ fontSize: "105%", fontWeight: "555" }}>
                {userDetails?.name}
              </div>
              <div className="com-time">
                {getRelativeTime(comment?.createdAt)}
              </div>
            </div>
            <div className="comm-content">{comment?.content}</div>
          </div>
          <div className="comment-cont-s2-2">
            <div className="com-like">like</div>
            <div
              className="com-reply"
              onClick={() => setShowReplies(!showReplies)}
              style={{ cursor: "pointer" }}
            >
              reply
            </div>
          </div>
        </div>
      </div>
      {showReplies && (
        <div className="reply-section">
          <div className={replies.length > 0 ? "reply-child" : "d-none"}>
            {replies.map((item) => {
              return <Comment comment={item} />;
            })}
          </div>
          <div className="add-reply">
            <div className="pic-cont">
              <img
                src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
                className="post-pro-pic"
                alt="profile"
              />
            </div>
            <input
              placeholder="reply to user"
              onChange={(e) => setReply(e.target.value)}
              value={reply}
              className="comment-bar"
            />
            <button
              onClick={() => {
                addReply();
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
              className="reply-btn"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
