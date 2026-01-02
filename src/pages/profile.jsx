import { useEffect, useState } from "react";
import "./profilepage.css";
import { getApiUrl } from "../config/api";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
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
          <CiCirclePlus />
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
            <CiCirclePlus />
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
          <button>Add Story</button>
          <button>
            <PiDotsThreeBold /> profile
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

                  <button className="share-btn" onClick={handleUpload}>
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
          <div className="about">
            <div className="about-side1">About</div>
            <div className="about-side2">
              {/* Workplace */}
              <div className="about-section">
                {showWorkplaceForm ? (
                  <>
                    <input
                      value={workplace}
                      placeholder="Workplace"
                      onChange={(e) => setWorkplace(e.target.value)}
                    />
                    <div className="add-cancel">
                      <button
                        onClick={() => setShowWorkplaceForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          saveAboutInfo("workPlace", workplace);
                          setShowWorkplaceForm(false);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : about?.workPlace ? (
                  <div className="info-display">
                    <div className="info-display-icon">
                      <SiWorkplace />
                    </div>
                    <div className="info-display-content">
                      Works at{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {about?.workPlace}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowWorkplaceForm(true)}
                      className="info-display-btn"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWorkplaceForm(true)}
                    className="add-btn"
                  >
                    <CiCirclePlus size={20} />
                    <span>Add a workplace</span>
                  </button>
                )}
              </div>

              {/* Secondary School */}
              <div className="about-section">
                {showSchoolForm ? (
                  <>
                    <input
                      value={secondaryschool}
                      placeholder="Secondary school"
                      onChange={(e) => setSecondaryschool(e.target.value)}
                    />
                    <div className="add-cancel">
                      <button
                        onClick={() => setShowSchoolForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          saveAboutInfo("secondarySchool", secondaryschool);
                          setShowSchoolForm(false);
                        }}
                      >
                        save
                      </button>
                    </div>
                  </>
                ) : about?.secondarySchool ? (
                  <div className="info-display">
                    <div className="info-display-icon">
                      <RiSchoolLine />
                    </div>
                    <div className="info-display-content">
                      Went to{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {about?.secondarySchool}
                      </span>
                    </div>
                    <button
                      onClick={() => setSecondaryschool(true)}
                      className="info-display-btn"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSchoolForm(true)}
                    className="add-btn"
                  >
                    <CiCirclePlus size={20} />
                    <span>Add secondary school</span>
                  </button>
                )}
              </div>

              {/* University */}
              <div className="about-section">
                {showUniversityForm ? (
                  <>
                    <input
                      value={university}
                      placeholder="University"
                      onChange={(e) => setUniversity(e.target.value)}
                    />
                    <div className="add-cancel">
                      <button
                        onClick={() => setShowUniversityForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          saveAboutInfo("university", university);
                          setShowUniversityForm(false);
                        }}
                      >
                        save
                      </button>
                    </div>{" "}
                  </>
                ) : about?.university ? (
                  <div className="info-display">
                    <div className="info-display-icon">
                      <LiaUniversitySolid />
                    </div>
                    <div className="info-display-content">
                      Studied at{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {about?.university}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowUniversityForm(true)}
                      className="info-display-btn"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowUniversityForm(true)}
                    className="add-btn"
                  >
                    <CiCirclePlus size={20} />
                    <span>Add university</span>
                  </button>
                )}
              </div>

              {/* Current City */}
              <div className="about-section">
                {showCityForm ? (
                  <>
                    <input
                      value={currentcity}
                      placeholder="Current City"
                      onChange={(e) => setCurrentcity(e.target.value)}
                    />
                    <div className="add-cancel">
                      <button
                        onClick={() => setShowCityForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          saveAboutInfo("currentCity", currentcity);
                          setShowCityForm(false);
                        }}
                      >
                        save
                      </button>
                    </div>{" "}
                  </>
                ) : about?.currentCity ? (
                  <div className="info-display">
                    <div className="info-display-icon">
                      <IoHomeOutline />
                    </div>
                    <div className="info-display-content">
                      Lives in{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {about?.currentCity}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCityForm(true)}
                      className="info-display-btn"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCityForm(true)}
                    className="add-btn"
                  >
                    <CiCirclePlus size={20} />
                    <span>Add current city</span>
                  </button>
                )}
              </div>

              {/* Hometown */}
              <div className="about-section">
                {showHometownForm ? (
                  <>
                    <input
                      value={hometown}
                      placeholder="Hometown"
                      onChange={(e) => setHometown(e.target.value)}
                    />
                    <div className="add-cancel">
                      <button
                        onClick={() => setShowHometownForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          saveAboutInfo("homeTown", hometown);
                          setShowHometownForm(false);
                        }}
                      >
                        save
                      </button>
                    </div>{" "}
                  </>
                ) : about?.homeTown ? (
                  <div className="info-display">
                    <div className="info-display-icon">
                      <CiLocationOn />
                    </div>
                    <div className="info-display-content">
                      From{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {about?.homeTown}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowHometownForm(true)}
                      className="info-display-btn"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHometownForm(true)}
                    className="add-btn"
                  >
                    <CiCirclePlus size={20} />
                    <span>Add hometown</span>
                  </button>
                )}
              </div>

              {/* Relationship Status */}
              <div className="about-section">
                {showRelationshipForm ? (
                  <>
                    <input
                      value={relationshipstatus}
                      placeholder="Relationship status"
                      onChange={(e) => setRelationshipstatus(e.target.value)}
                    />
                    <div className="add-cancel">
                      <button
                        onClick={() => setShowRelationshipForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          saveAboutInfo(
                            "relationShipStatus",
                            relationshipstatus
                          );
                          setShowRelationshipForm(false);
                        }}
                      >
                        save
                      </button>
                    </div>{" "}
                  </>
                ) : about?.relationShipStatus ? (
                  <div className="info-display">
                    <div className="info-display-icon">
                      <GiRelationshipBounds />
                    </div>
                    <div className="info-display-content">
                      Relationship status{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {about?.relationShipStatus}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowRelationshipForm(true)}
                      className="info-display-btn"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRelationshipForm(true)}
                    className="add-btn"
                  >
                    <CiCirclePlus size={20} />
                    <span>Add relationship status</span>
                  </button>
                )}
              </div>

              {/* Gender */}
              <div className="about-section">
                {showGenderForm ? (
                  <>
                    <input
                      value={gender}
                      placeholder="Gender"
                      onChange={(e) => setGender(e.target.value)}
                    />
                    <div className="add-cancel">
                      <button
                        onClick={() => setShowGenderForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        className="save-btn"
                        onClick={() => {
                          saveAboutInfo("gender", gender);
                          setShowGenderForm(false);
                        }}
                      >
                        save
                      </button>
                    </div>{" "}
                  </>
                ) : about?.gender ? (
                  <div className="info-display">
                    <div className="info-display-icon">
                      <SiWorkplace />
                    </div>
                    <div className="info-display-content">
                      Gender {about?.gender}
                    </div>
                    <button
                      onClick={() => setShowGenderForm(true)}
                      className="info-display-btn"
                    >
                      <PiDotsThreeBold />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowGenderForm(true)}
                    className="add-btn"
                  >
                    <CiCirclePlus size={20} />
                    <span>Add gender</span>
                  </button>
                )}
              </div>
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
