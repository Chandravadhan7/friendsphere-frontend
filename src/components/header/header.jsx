import { useState, useEffect, useRef } from "react";
import "./header.css";
import { getApiUrl } from "../../config/api";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { GrHomeRounded } from "react-icons/gr";
import { FiMessageSquare } from "react-icons/fi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaUserFriends, FaSignOutAlt } from "react-icons/fa";
import { HiUserCircle, HiUsers, HiLogout } from "react-icons/hi";
import { RiUserLine, RiTeamLine, RiLogoutBoxRLine } from "react-icons/ri";

export default function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsSearchOpen(false);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchToggle = () => setIsSearchOpen(!isSearchOpen);
  const handleSearchClose = () => setIsSearchOpen(false);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const logout = async () => {
    try {
      const sessionKey = localStorage.getItem("sessionId");
      const userId = localStorage.getItem("userId");

      const response = await fetch(getApiUrl("/user/api/logout"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          sessionId: sessionKey,
          userId: userId,
        },
      });

      if (!response.ok) {
        console.log("session id not found");
      }
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (err) {
      console.log("error occurred");
    }
  };

  if (isMobile && isSearchOpen) {
    return (
      <div className="header mobile-search-mode">
        <div className="mobile-search-container">
          <div className="search-input-wrap mobile-search">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Explore topics, people & more..."
              autoFocus
            />
            <CloseIcon className="close-icon" onClick={handleSearchClose} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="header">
      <div className="header1">
        <div className="header11">
          <Link to="/" className="head-logo">
            FriendSphere
          </Link>
          {!isMobile && (
            <div className="head-search">
              <div className="search-input-wrap">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder="Explore topics, people & more..."
                />
              </div>
            </div>
          )}
        </div>
        <div className="header12">
          {isMobile && (
            <div className="mobile-search-icon" onClick={handleSearchToggle}>
              <SearchIcon
                style={{ fontSize: "180%", color: "#fff", cursor: "pointer" }}
              />
            </div>
          )}
          <Link to="/*">
            <GrHomeRounded style={{ fontSize: "150%", color: "#fff" }} />
          </Link>
          <Link to="/friends">
            <PeopleAltOutlinedIcon
              style={{ fontSize: "180%", color: "#fff" }}
            />
          </Link>
          <Link to="/chats">
            <FiMessageSquare style={{ fontSize: "180%", color: "#fff" }} />
          </Link>
          <Link>
            <IoIosNotificationsOutline
              style={{ fontSize: "200%", color: "#fff" }}
            />
          </Link>

          <div className="dropdown-wrapper" ref={dropdownRef}>
            <div className="post-pro-pic-cont" onClick={toggleDropdown}>
              <img
                src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
                className="post-pro-pic"
                alt="profile"
              />
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  <HiUserCircle className="dropdown-icon" />
                  <span>View Profile</span>
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/friends")}
                >
                  <RiTeamLine className="dropdown-icon" />
                  <span>Friends</span>
                </div>
                <div
                  className="dropdown-item dropdown-item-logout"
                  onClick={logout}
                >
                  <RiLogoutBoxRLine className="dropdown-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
