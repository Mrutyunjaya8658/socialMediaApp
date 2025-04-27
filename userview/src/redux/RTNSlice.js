import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      const newNotification = action.payload;

      if (newNotification.type === 'like') {
        // Prevent duplicate notifications
        const exists = state.likeNotification.some(
          (item) => item.userId === newNotification.userId && item.postid === newNotification.postid
        );

        if (!exists) {
          state.likeNotification.push(newNotification);
        }
      } else if (newNotification.type === 'dislike') {
        // Remove notification when user dislikes
        state.likeNotification = state.likeNotification.filter(
          (item) => item.userId !== newNotification.userId || item.postid !== newNotification.postid
        );
      }
    },

    clearNotifications: (state) => {
      // Reset the like notifications
      state.likeNotification = [];
    },
  },
});

export const { setLikeNotification, clearNotifications } = rtnSlice.actions;
export default rtnSlice.reducer;
