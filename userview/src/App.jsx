import React, { useEffect } from "react";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Chatpage from "./components/Chatpage";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/RTNSlice";
import ProtectedRoute from "./components/ProtectedRoute";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element:<ProtectedRoute><MainLayout /></ProtectedRoute> ,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/profile/:id",
        element:<ProtectedRoute><Profile /></ProtectedRoute> ,
      },
      {
        path: "/account/edit",
        element:<ProtectedRoute><EditProfile /></ProtectedRoute> ,
      },
      {
        path: "/chat",
        element:<ProtectedRoute><Chatpage /></ProtectedRoute> ,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

const App = () => {
  const { user } = useSelector((store) => store.auth); 
  const dispatch = useDispatch();
  const {socket} = useSelector(store=>store.socketio);

  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:8000", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"], 
      });

      dispatch(setSocket(socketio));

      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification))
      });
      
      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    }
    
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
};

export default App;
