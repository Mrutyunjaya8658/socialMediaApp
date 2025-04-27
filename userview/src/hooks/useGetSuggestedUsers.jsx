import { setSuggestedUsers } from "@/redux/authSlice";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import React, {useEffect} from "react";
import { useDispatch } from "react-redux";
const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get('https://socialmediaapp-c7ct.onrender.com/api/v1/user/suggested',{withCredentials:true});
                if (res.data.success) {
                    dispatch(setSuggestedUsers(res.data.users))
                    
                }
            } catch (error) {
                console.log(error);
                
            }
        }
        fetchSuggestedUsers();
    },[])
}
export default useGetSuggestedUsers