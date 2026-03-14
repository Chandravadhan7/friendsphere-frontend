import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api";
import "./signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      setMessage("Please fill in all fields!");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(getApiUrl("/user/api/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const result = await response.text();
        setMessage(result || "Account created successfully!");
        setMessageType("success");
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setMessage("Something went wrong. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please check your connection.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(getApiUrl("/user/api/google-login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      if (!response.ok) {
        let errorMessage = "Google signup failed";
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const loginResponse = await response.json();
      localStorage.setItem("sessionId", loginResponse.sessionId);
      localStorage.setItem("userId", loginResponse.userId);
      console.log("Google signup successful:", loginResponse);

      navigate("/");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
      console.error("Error during Google signup:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage("Google signup failed. Please try again.");
    setMessageType("error");
  };

  return (
    <div className="signup-container">
      <div className="signup-card-wrapper">
        <div className="signup-card">
          {/* Header */}
          <div className="signup-header">
            <div className="signup-icon">
              <UserPlus size={32} />
            </div>
            <h1 className="signup-title">Join Us</h1>
            <p className="signup-subtitle">
              Create your account and connect with others
            </p>
          </div>

          {/* Form Fields */}
          <div className="signup-form">
            {/* Username Field */}
            <div className="input-group">
              <div className="input-icon">
                <User size={20} />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="form-input"
                placeholder="Username"
              />
            </div>

            {/* Email Field */}
            <div className="input-group">
              <div className="input-icon">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="form-input"
                placeholder="Email address"
              />
            </div>

            {/* Password Field */}
            <div className="input-group">
              <div className="input-icon">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="form-input password-input"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
              <div className="input-icon">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="form-input password-input"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`message ${messageType}`}>{message}</div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`submit-btn ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="spinner"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="divider" style={{ margin: "20px 0" }}>
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>

            {/* Google Signup Button */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="350"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="signup-footer">
            <p>
              Already have an account?{" "}
              <a href="/login" className="signin-link">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="terms-info">
          <p>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
