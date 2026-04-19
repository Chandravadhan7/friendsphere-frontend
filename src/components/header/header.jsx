import { useState, useEffect, useRef } from "react";
import "./header.css";
import { getApiUrl } from "../../config/api";
import {
  Home,
  Users,
  MessageSquare,
  Bell,
  Search,
  X,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Explore topics, people & more..."
              autoFocus
            />
            <X className="close-icon" onClick={handleSearchClose} size={20} />
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
                <Search className="search-icon" size={20} />
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
              <Search
                style={{ fontSize: "180%", color: "#fff", cursor: "pointer" }}
                size={24}
              />
            </div>
          )}
          <Link to="/*" className="header-icon-link">
            <Home size={22} className="header-icon" />
          </Link>
          <Link to="/friends" className="header-icon-link active">
            <Users size={22} className="header-icon" />
          </Link>
          <Link to="/chats" className="header-icon-link">
            <MessageSquare size={22} className="header-icon" />
          </Link>
          <Link to="#" className="header-icon-link">
            <Bell size={22} className="header-icon" />
          </Link>

          <div className="dropdown-wrapper" ref={dropdownRef}>
            <div
              className="header-avatar-initial"
              onClick={toggleDropdown}
              style={{ backgroundColor: "#fbbf24" }}
            >
              M
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  <UserCircle className="dropdown-icon" size={20} />
                  <span>View Profile</span>
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/friends")}
                >
                  <Users className="dropdown-icon" size={20} />
                  <span>Friends</span>
                </div>
                <div
                  className="dropdown-item dropdown-item-logout"
                  onClick={logout}
                >
                  <LogOut className="dropdown-icon" size={20} />
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
