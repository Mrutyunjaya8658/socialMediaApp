import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const { selectedUser } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchAllMessage = async () => {
            try {
                const token = localStorage.getItem("token"); // 👈 Get token from storage

                const res = await axios.get(
                    `https://socialmediaapp-c7ct.onrender.com/api/v1/message/all/${selectedUser?._id}`,
                    {
                        
                        withCredentials: true,
                    }
                );

                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        };

        if(selectedUser?._id){  // 👈 small safety check
            fetchAllMessage();
        }
    }, [selectedUser?._id]); // 👈 dependency array updated
};

export default useGetAllMessage;
