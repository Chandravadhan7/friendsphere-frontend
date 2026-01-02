import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profilepage.css";
import { getApiUrl } from "../config/api";
import Post from "../components/post/post";
import { SiWorkplace } from "react-icons/si";
import { RiSchoolLine } from "react-icons/ri";
import { LiaUniversitySolid } from "react-icons/lia";
import { IoHomeOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { GiRelationshipBounds } from "react-icons/gi";
import { Link } from "react-router-dom";
import FriendCard from "../components/friendCard/friendCard";

export default function FriendsProfile() {
  const { user_id } = useParams();
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Posts");
  const [about, setAbout] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  let [friends, setFriends] = useState([]);

  const getPosts = async () => {
    const response = await fetch(getApiUrl(`/post/posts/${user_id}`), {
      method: "GET",
      headers: { sessionId, userId },
    });

    if (!response.ok) throw new Error("failed to fetch posts");

    const postReponse = await response.json();
    setPosts(postReponse);
  };

  const getUser = async () => {
    const response = await fetch(getApiUrl(`/user/${user_id}`), {
      method: "GET",
      headers: { sessionId, userId },
    });

    if (!response.ok) throw new Error("failed to fetch user details");

    const userResponse = await response.json();
    setUserDetails(userResponse);
  };

  useEffect(() => {
    if (user_id) {
      getPosts();
      getUser();
    }
  }, [user_id]);

  const checkOrCreateConversation = async () => {
    try {
      const response = await fetch(getApiUrl(`/conversations`), {
        method: "GET",
        headers: { sessionId, userId },
      });

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const allConversations = await response.json();
      let existingConvo = null;

      for (const convo of allConversations) {
        const res = await fetch(
          getApiUrl(`/conversation-participants/${convo.conversationId}`),
          {
            headers: { sessionId, userId },
          }
        );

        if (!res.ok) continue;

        const participants = await res.json();

        const isOther = participants.some(
          (p) => p.userId === parseInt(user_id)
        );
        const isSelf = participants.some((p) => p.userId === parseInt(userId));

        if (isOther && isSelf) {
          existingConvo = convo;
          break;
        }
      }

      if (existingConvo) {
        navigate("/chats", {
          state: { conversationId: existingConvo.conversationId },
        });
        return;
      }

      await createConversation();
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  const createConversation = async () => {
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

    if (!response.ok) throw new Error("Unable to create conversation");

    const convo = await response.json();

    await addParticipant(convo.conversationId, userId);
    await addParticipant(convo.conversationId, user_id);

    navigate("/chats", { state: { conversationId: convo.conversationId } });
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
        sessionId,
        userId,
      },
      body: JSON.stringify(participant),
    });

    if (!response.ok) throw new Error("Unable to add participant");

    const data = await response.json();
    console.log("Participant added:", data);
  };

  const getBio = async () => {
    try {
      const response = await fetch(getApiUrl(`/bio/${user_id}`), {
        method: "GET",
        headers: { userId, sessionId },
      });

      if (!response.ok) throw new Error("Failed to fetch bio");

      const text = await response.text();
      if (!text) {
        setAbout(null);
        return;
      }

      const bioResponse = JSON.parse(text);
      setAbout(bioResponse);
      console.log("Bio:", bioResponse);
    } catch (error) {
      console.error("getBio error:", error.message);
    }
  };

  useEffect(() => {
    getBio();
  }, [user_id]);

  const getMutualsFriends = async () => {
    const response = await fetch(
      getApiUrl(`/friendship/mutual-friends/${user_id}`),
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

    const mutualResponse = await response.json();
    setMutualFriends(mutualResponse);

    console.log(mutualResponse);
  };

  useEffect(() => {
    getMutualsFriends();
  }, []);

  const getAllFriends = async () => {
    const response = await fetch(getApiUrl(`/friendship/friends/${user_id}`), {
      method: "GET",
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error("failed to fetch friends");
    }

    const friendsresponse = await response.json();

    setFriends(friendsresponse);
    console.log("friends", friendsresponse);
  };

  useEffect(() => {
    getAllFriends();
  }, []);

  return (
    <div className="profil-cont">
      <div className="cover-profile">
        <img
          src={userDetails?.cover_pic_url}
          alt="cover"
          className="cover-image"
        />
        <div className="profile-pic-wrapper">
          <img
            src={userDetails?.profile_img_url}
            alt="profile"
            className="profile-pic"
          />
        </div>
      </div>

      <div className="profile-username">
        <div className="pro-username-text">
          <div className="pro-username-text-1">{userDetails?.name}</div>
          <div className="pro-username-text-2">
            <div>1,120 friends</div>
            {mutualFriends.length > 0 && (
              <div>{mutualFriends.length} mutual friends</div>
            )}
          </div>
        </div>
        <div className="buttons">
          <button>friend</button>
          <button onClick={checkOrCreateConversation}>message</button>
        </div>
      </div>

      <div className="pafi">
        {["Posts", "About", "Photos", "Friends"].map((tab) => (
          <div
            key={tab}
            className={`entity ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="user-pro-contents">
        {activeTab === "Posts" && (
          <>
            <div className="user-info">
              {about?.workPlace && (
                <div className="info-display">
                  <div className="info-display-icon1">
                    <SiWorkplace />
                  </div>
                  <div className="info-display-content">{about?.workPlace}</div>
                </div>
              )}
              {about?.secondarySchool && (
                <div className="info-display1">
                  <div className="info-display-icon1">
                    <RiSchoolLine />
                  </div>
                  <div className="info-display-content">
                    {about?.secondarySchool}
                  </div>
                </div>
              )}
              {about?.university && (
                <div className="info-display1">
                  <div className="info-display-icon1">
                    <LiaUniversitySolid />
                  </div>
                  <div className="info-display-content">
                    {about?.university}
                  </div>
                </div>
              )}
              {about?.currentCity && (
                <div className="info-display1">
                  <div className="info-display-icon1">
                    <IoHomeOutline />
                  </div>
                  <div className="info-display-content">
                    {about?.currentCity}
                  </div>
                </div>
              )}
              {about?.homeTown && (
                <div className="info-display1">
                  <div className="info-display-icon1">
                    <CiLocationOn />
                  </div>
                  <div className="info-display-content">{about?.homeTown}</div>
                </div>
              )}
              {about?.relationShipStatus && (
                <div className="info-display1">
                  <div className="info-display-icon1">
                    <GiRelationshipBounds />
                  </div>
                  <div className="info-display-content">
                    {about?.relationShipStatus}
                  </div>
                </div>
              )}
            </div>

            <div className="user-posts">
              {posts.length === 0 && (
                <div className="no-posts">No posts Yet</div>
              )}
              {posts.map((item) => (
                <Post postItem={item} key={item.postId} />
              ))}
            </div>
          </>
        )}

        {activeTab === "About" && (
          <div className="about">
            <div className="about-side1">About</div>
            <div className="about-side2">
              {about?.workPlace && (
                <div className="info-display">
                  <div className="info-display-icon">
                    <SiWorkplace />
                  </div>
                  <div className="info-display-content">
                    Works at{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {about.workPlace}
                    </span>
                  </div>
                </div>
              )}

              {about?.secondarySchool && (
                <div className="info-display">
                  <div className="info-display-icon">
                    <RiSchoolLine />
                  </div>
                  <div className="info-display-content">
                    Went to{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {about.secondarySchool}
                    </span>
                  </div>
                </div>
              )}

              {about?.university && (
                <div className="info-display">
                  <div className="info-display-icon">
                    <LiaUniversitySolid />
                  </div>
                  <div className="info-display-content">
                    Studied at{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {about.university}
                    </span>
                  </div>
                </div>
              )}

              {about?.currentCity && (
                <div className="info-display">
                  <div className="info-display-icon">
                    <IoHomeOutline />
                  </div>
                  <div className="info-display-content">
                    Lives in{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {about.currentCity}
                    </span>
                  </div>
                </div>
              )}

              {about?.homeTown && (
                <div className="info-display">
                  <div className="info-display-icon">
                    <CiLocationOn />
                  </div>
                  <div className="info-display-content">
                    From{" "}
                    <span style={{ fontWeight: "bold" }}>{about.homeTown}</span>
                  </div>
                </div>
              )}

              {about?.relationShipStatus && (
                <div className="info-display">
                  <div className="info-display-icon">
                    <GiRelationshipBounds />
                  </div>
                  <div className="info-display-content">
                    Relationship status{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {about.relationShipStatus}
                    </span>
                  </div>
                </div>
              )}

              {about?.gender && (
                <div className="info-display">
                  <div className="info-display-icon">
                    <SiWorkplace />
                  </div>
                  <div className="info-display-content">
                    Gender{" "}
                    <span style={{ fontWeight: "bold" }}>{about.gender}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Photos" && (
          <div className="photos-cont">
            {posts.map((item) => {
              return (
                <div className="photo">
                  <img src={item?.imageUrl} className="photo-img" />
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "Friends" && (
          <div className="frnds-cont">
            {friends.map((item) => {
              return (
                <Link className="frnd-card" to={`/profile/${item.userId}`}>
                  <FriendCard friendItem={item} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
