// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;
