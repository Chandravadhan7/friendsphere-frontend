import { useEffect, useState } from "react";
import "./profilepage.css";
import { getApiUrl } from "../config/api";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Post from "../components/post/post";
import { CiCirclePlus } from "react-icons/ci";
import { RiEmotionLaughFill, RiFontSize } from "react-icons/ri";
import { SiWorkplace } from "react-icons/si";
import { RiSchoolLine } from "react-icons/ri";
import { LiaUniversitySolid } from "react-icons/lia";
import { IoHomeOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { GiRelationshipBounds } from "react-icons/gi";
import { PiDotsThreeBold } from "react-icons/pi";
import FriendCard from "../components/friendCard/friendCard";
import { Link } from "react-router-dom";

export default function Profile() {
  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [feeling, setFeeling] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");
  const [activeTab, setActiveTab] = useState("Posts");
  const [showWorkplaceForm, setShowWorkplaceForm] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [showUniversityForm, setShowUniversityForm] = useState(false);
  const [showCityForm, setShowCityForm] = useState(false);
  const [showHometownForm, setShowHometownForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [showGenderForm, setShowGenderForm] = useState(false);
  const [workplace, setWorkplace] = useState("");
  const [secondaryschool, setSecondaryschool] = useState("");
  const [university, setUniversity] = useState("");
  const [currentcity, setCurrentcity] = useState("");
  const [hometown, setHometown] = useState("");
  const [relationshipstatus, setRelationshipstatus] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [about, setAbout] = useState(null);
  const [friends, setFriends] = useState([]);

  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);

  const handlePicChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageUrl = await uploadImage(file, type, userId);
    if (imageUrl) {
      if (type === "profile") {
        setProfilePic(imageUrl);
      } else {
        setCoverPic(imageUrl);
      }
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const fileType = selectedFile.type;
      setPreviewUrl(URL.createObjectURL(selectedFile));

      if (fileType.startsWith("image/")) {
        setContent("image");
      } else if (fileType.startsWith("video/")) {
        setContent("video");
      }
    }
  };

  const handleFeelingClick = () => {
    setContent("feeling");
    setFeeling("😊 Happy");
  };

  const handleLocationClick = () => {
    setContent("location");
    setLocation("📍 New York");
  };

  const handleUpload = async () => {
    if (!content) return alert("Please enter post content!");

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("content", content);
    formData.append("description", description);
    if (file) formData.append("file", file);
    if (feeling) formData.append("feeling", feeling);
    if (location) formData.append("location", location);

    try {
      const response = await fetch(getApiUrl("/post/createpost"), {
        method: "POST",
        body: formData,
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
      });

      if (!response.ok) throw new Error("Failed to upload post");

      console.log("Post created successfully");
      alert("Post uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const getPosts = async () => {
    const response = await fetch(getApiUrl(`/post/posts/${userId}`), {
      method: "GET",
      headers: {
        sessionId,
        userId,
      },
    });

    if (!response.ok) {
      throw new Error("failed to fetch posts");
    }

    const postReponse = await response.json();
    setPosts(postReponse);
  };

  const getUser = async () => {
    const response = await fetch(getApiUrl(`/user/${userId}`), {
      method: "GET",
      headers: {
        sessionId,
        userId,
      },
    });

    if (!response.ok) {
      throw new Error("failed to fetch user details");
    }

    const userResponse = await response.json();
    setUserDetails(userResponse);
  };

  useEffect(() => {
    if (userId) {
      getPosts();
      getUser();
    }
  }, [userId]);

  const saveAboutInfo = async (field, value) => {
    try {
      const payload = { [field]: value };

      const response = await fetch(getApiUrl("/bio"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: userId,
          sessionId: sessionId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update about info");
      const data = await response.json();
      console.log("Updated successfully", data);
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  const getBio = async () => {
    try {
      const response = await fetch(getApiUrl(`/bio/${userId}`), {
        method: "GET",
        headers: {
          userId: userId,
          sessionId: sessionId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bio");
      }

      const text = await response.text();

      // If response body is empty, don't parse it as JSON
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
  }, [userId]);

  const getAllFriends = async () => {
    const response = await fetch(getApiUrl(`/friendship/friends/${userId}`), {
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

  const uploadImage = async (file, type, userId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const endpoint =
      type === "profile"
        ? getApiUrl("/user/update-profile-pic")
        : getApiUrl("/user/update-cover-pic");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          sessionId: sessionId,
          userId: userId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type} picture`);
      }

      const imageUrl = await response.text();
      return imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  return (
    <div className="profil-cont">
      <div className="cover-profile" style={{ position: "relative" }}>
        <img
          src={userDetails?.cover_pic_url}
          alt="cover"
          className="cover-image"
        />
        <label
          htmlFor="cover-file-input"
          className="cover-pic-plus-btn"
          title="Add/Change Cover Picture"
        >
          <CameraAltIcon style={{ fontSize: "20px" }} />
          <input
            id="cover-file-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handlePicChange(e, "cover")}
          />
        </label>
        <div className="profile-pic-wrapper">
          <img
            src={userDetails?.profile_img_url}
            alt="profile"
            className="profile-pic"
          />
          <label
            htmlFor="profile-file-input"
            className="profile-pic-plus-btn"
            title="Add/Change Profile Picture"
          >
            <CameraAltIcon style={{ fontSize: "16px" }} />
            <input
              id="profile-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handlePicChange(e, "profile")}
            />
          </label>
        </div>
      </div>
      <div className="profile-username">
        <div className="pro-username-text">
          <div className="pro-username-text-1">{userDetails?.name}</div>
          <div className="pro-username-text-2">
            <div>1,120 friends</div>
          </div>
        </div>
        <div className="buttons">
          <button className="add-story-btn">Add Story</button>
          <button className="profile-menu-btn">
            <PiDotsThreeBold /> Profile
          </button>
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
              <div className="user-info-title">About</div>
              {about?.currentCity && (
                <div className="about-info-item">
                  <div className="about-icon-container">
                    <IoHomeOutline />
                  </div>
                  <div className="about-text">
                    <span className="about-label">Lives in</span>
                    <span className="about-value">{about?.currentCity}</span>
                  </div>
                </div>
              )}
              {about?.secondarySchool && (
                <div className="about-info-item">
                  <div className="about-icon-container">
                    <RiSchoolLine />
                  </div>
                  <div className="about-text">
                    <span className="about-label">Went to</span>
                    <span className="about-value">
                      {about?.secondarySchool}
                    </span>
                  </div>
                </div>
              )}
              {about?.university && (
                <div className="about-info-item">
                  <div className="about-icon-container">
                    <LiaUniversitySolid />
                  </div>
                  <div className="about-text">
                    <span className="about-label">Studied at</span>
                    <span className="about-value">{about?.university}</span>
                  </div>
                </div>
              )}
              {about?.homeTown && (
                <div className="about-info-item">
                  <div className="about-icon-container">
                    <CiLocationOn />
                  </div>
                  <div className="about-text">
                    <span className="about-label">From</span>
                    <span className="about-value">{about?.homeTown}</span>
                  </div>
                </div>
              )}
              {about?.relationShipStatus && (
                <div className="about-info-item">
                  <div className="about-icon-container">
                    <GiRelationshipBounds />
                  </div>
                  <div className="about-text">
                    <span className="about-label">Relationship</span>
                    <span className="about-value">
                      {about?.relationShipStatus}
                    </span>
                  </div>
                </div>
              )}
              {about?.workPlace && (
                <div className="about-info-item">
                  <div className="about-icon-container">
                    <SiWorkplace />
                  </div>
                  <div className="about-text">
                    <span className="about-label">Works at</span>
                    <span className="about-value">{about?.workPlace}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="user-posts">
              <div className="side11">
                <div className="thought">
                  <div className="thought-pro">
                    <img
                      src={"https://i.ibb.co/67HWYXmq/icons8-user-96.png"}
                      className="post-pro-pic"
                      alt="profile"
                    />
                  </div>
                  <input
                    placeholder="Share your thoughts with the world..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="thought-cont"
                  />
                </div>

                {/* File Preview Pill */}
                {file && (
                  <div className="file-preview-pill">
                    <span className="file-icon">
                      {content === "image" ? "🖼️" : "🎥"}
                    </span>
                    <span className="file-name">{file.name}</span>
                    <button
                      className="remove-file"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setContent("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="contents">
                  <label
                    htmlFor="file-input"
                    className="contents1"
                    style={{ color: "#3B82F6" }}
                  >
                    <div>
                      <CollectionsOutlinedIcon />
                    </div>
                    <div className="pvfl">Photo</div>
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*, video/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  <label
                    htmlFor="video-input"
                    className="contents1"
                    style={{ color: "lightgreen" }}
                  >
                    <div>
                      <VideocamOutlinedIcon />
                    </div>
                    <div className="pvfl">Video</div>
                  </label>
                  <input
                    id="video-input"
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  <div
                    className="contents1"
                    onClick={handleFeelingClick}
                    style={{ color: "orange" }}
                  >
                    <SentimentSatisfiedOutlinedIcon />
                    <div className="pvfl">Feeling</div>
                  </div>

                  <div
                    className="contents1"
                    onClick={handleLocationClick}
                    style={{ color: "purple" }}
                  >
                    <PlaceOutlinedIcon />
                    <div className="pvfl">Location</div>
                  </div>

                  <button className="shr-btnn" onClick={handleUpload}>
                    Share post
                  </button>
                </div>
              </div>

              {/* Display Posts */}
              {posts.map((item) => (
                <Post postItem={item} key={item.postId} />
              ))}
            </div>
          </>
        )}

        {activeTab === "About" && (
          <>
            <div className="about">
              <div className="about-title">About</div>
              <div className="about-content">
                {/* Workplace */}
                {about?.workPlace ? (
                  <div className="about-card">
                    <div className="about-card-icon">
                      <SiWorkplace />
                    </div>
                    <div className="about-card-content">
                      <div className="about-card-text">
                        Works at <strong>{about?.workPlace}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWorkplaceForm(true)}
                      className="about-card-menu"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWorkplaceForm(true)}
                    className="add-info-btn"
                  >
                    <CiCirclePlus size={22} />
                    <span>Add a workplace</span>
                  </button>
                )}

                {/* Secondary School */}
                {about?.secondarySchool ? (
                  <div className="about-card">
                    <div className="about-card-icon">
                      <RiSchoolLine />
                    </div>
                    <div className="about-card-content">
                      <div className="about-card-text">
                        Went to <strong>{about?.secondarySchool}</strong>
                      </div>
                      <div className="about-card-subtext">High School</div>
                    </div>
                    <button
                      onClick={() => setShowSchoolForm(true)}
                      className="about-card-menu"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSchoolForm(true)}
                    className="add-info-btn"
                  >
                    <CiCirclePlus size={22} />
                    <span>Add secondary school</span>
                  </button>
                )}

                {/* University */}
                {about?.university ? (
                  <div className="about-card">
                    <div className="about-card-icon">
                      <LiaUniversitySolid />
                    </div>
                    <div className="about-card-content">
                      <div className="about-card-text">
                        Studied at <strong>{about?.university}</strong>
                      </div>
                      <div className="about-card-subtext">Computer Science</div>
                    </div>
                    <button
                      onClick={() => setShowUniversityForm(true)}
                      className="about-card-menu"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowUniversityForm(true)}
                    className="add-info-btn"
                  >
                    <CiCirclePlus size={22} />
                    <span>Add university</span>
                  </button>
                )}

                {/* Current City */}
                {about?.currentCity ? (
                  <div className="about-card">
                    <div className="about-card-icon">
                      <IoHomeOutline />
                    </div>
                    <div className="about-card-content">
                      <div className="about-card-text">
                        Lives in <strong>{about?.currentCity}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCityForm(true)}
                      className="about-card-menu"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCityForm(true)}
                    className="add-info-btn"
                  >
                    <CiCirclePlus size={22} />
                    <span>Add current city</span>
                  </button>
                )}

                {/* Hometown */}
                {about?.homeTown ? (
                  <div className="about-card">
                    <div className="about-card-icon">
                      <CiLocationOn />
                    </div>
                    <div className="about-card-content">
                      <div className="about-card-text">
                        From <strong>{about?.homeTown}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowHometownForm(true)}
                      className="about-card-menu"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHometownForm(true)}
                    className="add-info-btn"
                  >
                    <CiCirclePlus size={22} />
                    <span>Add hometown</span>
                  </button>
                )}

                {/* Relationship Status */}
                {about?.relationShipStatus ? (
                  <div className="about-card">
                    <div className="about-card-icon">
                      <GiRelationshipBounds />
                    </div>
                    <div className="about-card-content">
                      <div className="about-card-text">
                        Relationship status{" "}
                        <strong>{about?.relationShipStatus}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRelationshipForm(true)}
                      className="about-card-menu"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRelationshipForm(true)}
                    className="add-info-btn"
                  >
                    <CiCirclePlus size={22} />
                    <span>Add relationship status</span>
                  </button>
                )}

                {/* Gender */}
                {about?.gender ? (
                  <div className="about-card">
                    <div className="about-card-icon">
                      <SiWorkplace />
                    </div>
                    <div className="about-card-content">
                      <div className="about-card-text">
                        Gender <strong>{about?.gender}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowGenderForm(true)}
                      className="about-card-menu"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowGenderForm(true)}
                    className="add-info-btn"
                  >
                    <CiCirclePlus size={22} />
                    <span>Add gender</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Dialogs */}
            {showWorkplaceForm && (
              <div
                className="modal-overlay"
                onClick={() => setShowWorkplaceForm(false)}
              >
                <div
                  className="modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Add Workplace</h3>
                    <button
                      className="modal-close"
                      onClick={() => setShowWorkplaceForm(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="modal-input"
                      value={workplace}
                      placeholder="Workplace"
                      onChange={(e) => setWorkplace(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={() => setShowWorkplaceForm(false)}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-save-btn"
                      onClick={() => {
                        saveAboutInfo("workPlace", workplace);
                        setShowWorkplaceForm(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showSchoolForm && (
              <div
                className="modal-overlay"
                onClick={() => setShowSchoolForm(false)}
              >
                <div
                  className="modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Add Secondary School</h3>
                    <button
                      className="modal-close"
                      onClick={() => setShowSchoolForm(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="modal-input"
                      value={secondaryschool}
                      placeholder="Secondary school"
                      onChange={(e) => setSecondaryschool(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={() => setShowSchoolForm(false)}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-save-btn"
                      onClick={() => {
                        saveAboutInfo("secondarySchool", secondaryschool);
                        setShowSchoolForm(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showUniversityForm && (
              <div
                className="modal-overlay"
                onClick={() => setShowUniversityForm(false)}
              >
                <div
                  className="modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Add University</h3>
                    <button
                      className="modal-close"
                      onClick={() => setShowUniversityForm(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="modal-input"
                      value={university}
                      placeholder="University"
                      onChange={(e) => setUniversity(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={() => setShowUniversityForm(false)}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-save-btn"
                      onClick={() => {
                        saveAboutInfo("university", university);
                        setShowUniversityForm(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCityForm && (
              <div
                className="modal-overlay"
                onClick={() => setShowCityForm(false)}
              >
                <div
                  className="modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Add Current City</h3>
                    <button
                      className="modal-close"
                      onClick={() => setShowCityForm(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="modal-input"
                      value={currentcity}
                      placeholder="Current City"
                      onChange={(e) => setCurrentcity(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={() => setShowCityForm(false)}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-save-btn"
                      onClick={() => {
                        saveAboutInfo("currentCity", currentcity);
                        setShowCityForm(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showHometownForm && (
              <div
                className="modal-overlay"
                onClick={() => setShowHometownForm(false)}
              >
                <div
                  className="modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Add Hometown</h3>
                    <button
                      className="modal-close"
                      onClick={() => setShowHometownForm(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="modal-input"
                      value={hometown}
                      placeholder="Hometown"
                      onChange={(e) => setHometown(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={() => setShowHometownForm(false)}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-save-btn"
                      onClick={() => {
                        saveAboutInfo("homeTown", hometown);
                        setShowHometownForm(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRelationshipForm && (
              <div
                className="modal-overlay"
                onClick={() => setShowRelationshipForm(false)}
              >
                <div
                  className="modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Add Relationship Status</h3>
                    <button
                      className="modal-close"
                      onClick={() => setShowRelationshipForm(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="modal-input"
                      value={relationshipstatus}
                      placeholder="Relationship status"
                      onChange={(e) => setRelationshipstatus(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={() => setShowRelationshipForm(false)}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-save-btn"
                      onClick={() => {
                        saveAboutInfo("relationShipStatus", relationshipstatus);
                        setShowRelationshipForm(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showGenderForm && (
              <div
                className="modal-overlay"
                onClick={() => setShowGenderForm(false)}
              >
                <div
                  className="modal-dialog"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Add Gender</h3>
                    <button
                      className="modal-close"
                      onClick={() => setShowGenderForm(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="modal-input"
                      value={gender}
                      placeholder="Gender"
                      onChange={(e) => setGender(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      onClick={() => setShowGenderForm(false)}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-save-btn"
                      onClick={() => {
                        saveAboutInfo("gender", gender);
                        setShowGenderForm(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
