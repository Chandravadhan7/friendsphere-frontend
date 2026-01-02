import { formatDistanceToNowStrict } from "date-fns";
import "./message.css";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import { useState } from "react";
import { MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaShare } from "react-icons/fa";

export default function Message({
  message,
  isUserMessage,
  style,
  onEdit,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const getRelativeTime = (epoch) => {
    return formatDistanceToNowStrict(new Date(epoch), { addSuffix: true });
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) onEdit(message);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) onDelete(message.messageId);
  };

  return (
    <div
      className="convo-page-side2-convo-msg"
      style={{
        ...style,
        backgroundColor: message.isDeleted
          ? "#1a1a1a"
          : isUserMessage
            ? "#3B82F6"
            : "#1F2A3C",
        borderColor: isUserMessage ? "green" : "#152135",
        position: "relative",
      }}
    >
      {isUserMessage && !message.isDeleted && (
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            color: "#fff",
          }}
        >
          <MdMoreVert />
        </button>
      )}

      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "5px",
            background: "#2a2a2a",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            zIndex: 100,
            minWidth: "100px",
          }}
        >
          <button
            onClick={handleEdit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            <MdEdit /> Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "none",
              border: "none",
              color: "#ff4444",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            <MdDelete /> Delete
          </button>
        </div>
      )}

      <div className="convo-page-side2-convo-msg-msg">
        {message.isDeleted ? (
          <em style={{ color: "#888" }}>This message was deleted</em>
        ) : message?.content?.includes("shared a post") ? (
          <div
            className="shared-post-message"
            onClick={() => {
              const lines = message.content.split("\n");
              const urlLine = lines.find((line) => line.includes("postId="));
              if (urlLine) {
                const postIdMatch = urlLine.match(/postId=(\d+)/);
                if (postIdMatch) {
                  navigate(`/home?postId=${postIdMatch[1]}`);
                }
              }
            }}
            style={{
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
              e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.3)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaShare style={{ color: "#66b3ff", fontSize: "14px" }} />
              <span style={{ color: "#e0e0e0" }}>
                {message.content.split("\n")[0]}
              </span>
            </div>
          </div>
        ) : (
          message?.content
        )}
      </div>
      <div className="convo-page-side2-convo-msg-time">
        <div className="time">
          {getRelativeTime(message?.createdAt)}
          {message.updatedAt && !message.isDeleted && " (edited)"}
        </div>
        <div className="tick">
          <DoneAllOutlinedIcon sx={{ fontSize: "15px" }} />
        </div>
      </div>
    </div>
  );
}
