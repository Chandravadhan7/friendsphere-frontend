import { setLikes } from "../store/slices/likesSlices";

export const fetchLikes = () => async (dispatch) => {
  try {
    const response = await fetch(
      "http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/likes/userLikes",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          sessionId: localStorage.getItem("sessionId"),
          userId: localStorage.getItem("userId"),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch likes. Status: ${response.status}`);
    }

    const text = await response.text();
    const userLikes = text ? JSON.parse(text) : [];

    console.log("Fetched Likes:", userLikes);

    dispatch(setLikes(userLikes));
  } catch (error) {
    console.error("Error fetching likes:", error);
  }
};
