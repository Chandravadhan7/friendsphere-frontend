import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./pages/loginpage";
import Home from "./pages/home";
import Header from "./components/header/header";
import Friends from "./pages/friends";
import FriendRequestPage from "./pages/friendRequestPage";
import SuggestionsPage from "./pages/suggestionsPage";
import AllFriends from "./pages/AllFriends";
import UserProfile from "./pages/userprofile";
import Conversations from "./pages/conversations";
import FriendsProfile from "./pages/profilepage";
import Profile from "./pages/profile";
import SignUp from "./pages/signUp";
import ProtectedRoute from "./components/protectedRoute";

export default function App() {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/signup"];

  // Update online status on mount and unmount
  useEffect(() => {
    // TEMPORARILY DISABLED: Enable this when backend endpoint is ready
    return;

    const userId = localStorage.getItem("userId");
    const sessionId = localStorage.getItem("sessionId");

    if (!userId || !sessionId) {
      console.log("No user session found, skipping online status updates");
      return;
    }

    const updateOnlineStatus = async (isOnline) => {
      try {
        // Try PUT method first (common for updates), fallback to POST if needed
        const response = await fetch(
          `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/user/${userId}/online-status?isOnline=${isOnline}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              sessionId: sessionId,
              userId: userId,
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          }
        );

        if (!response.ok) {
          // If PUT fails with 405, the endpoint might not exist or use different method
          if (response.status === 405 || response.status === 404) {
            console.debug(
              "Online status endpoint not available or uses different method"
            );
            return; // Silently skip
          }
          console.warn(`Failed to update online status: ${response.status}`);
        }
      } catch (err) {
        // Silently fail if backend is not accessible
        if (err.name !== "AbortError" && err.name !== "TimeoutError") {
          console.debug("Online status update failed:", err.message);
        }
      }
    };

    // Set online on mount
    updateOnlineStatus(true);

    // Set offline on page close/refresh using sendBeacon (non-blocking)
    const handleBeforeUnload = () => {
      try {
        navigator.sendBeacon(
          `http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/user/${userId}/online-status?isOnline=false`
        );
      } catch (err) {
        console.debug("Beacon failed:", err);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Periodic heartbeat to maintain online status (every 30 seconds)
    const heartbeat = setInterval(() => {
      updateOnlineStatus(true);
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Set offline on component unmount
      updateOnlineStatus(false);
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        {/* Conditionally render Header except on login and signup pages */}
        {!hideHeaderPaths.includes(location.pathname) && <Header />}

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friendrequest" element={<FriendRequestPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/friends/list" element={<AllFriends />} />
          {/* <Route path="profile/:userId" element={<UserProfile />} /> */}
          <Route path="/chats" element={<Conversations />} />
          <Route path="/profile/:user_id" element={<FriendsProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends/homecontent" element={<Friends />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}
