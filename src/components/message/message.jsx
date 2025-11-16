import { formatDistanceToNowStrict } from "date-fns";
import "./message.css";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import { useState } from "react";
import { MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { useNavigate } from "react-router-dom";

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

  // Function to render message content with clickable links
  const renderMessageContent = (content) => {
    if (!content) return null;

    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlPattern);

    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        // Check if it's an internal link to our app
        const isInternalLink =
          part.includes(window.location.hostname) ||
          part.includes("social-media0282");

        return (
          <a
            key={index}
            href={part}
            style={{
              color: isUserMessage ? "#E0F2FE" : "#60A5FA",
              textDecoration: "underline",
              wordBreak: "break-all",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (isInternalLink) {
                // Extract path and query params for internal navigation
                try {
                  const url = new URL(part);
                  const path = url.pathname;
                  const search = url.search;
                  navigate(path + search);
                } catch (err) {
                  // Fallback to opening in new tab if URL parsing fails
                  window.open(part, "_blank");
                }
              } else {
                // External link - open in new tab
                window.open(part, "_blank");
              }
            }}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
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
        ) : (
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {renderMessageContent(message?.content)}
          </div>
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
