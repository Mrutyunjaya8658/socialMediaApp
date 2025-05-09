import store from "@/redux/store";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: user?.profilePicture,
    bio: user?.bio,
    gender: user?.gender,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, profilePhoto: file });
    }
    
  };
  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };
  const imageRef = useRef();

  const editProfilehandler = async (req, res) => {
    const formData = new FormData();
    formData.append("bio",input.bio);
    formData.append("gender",input.gender);
    if (input.profilePhoto) {
    formData.append("profilePicture",input.profilePhoto);
    }
    try {
      setLoading(true);
      const res = await axios.post('https://socialmediaapp-c7ct.onrender.com/api/v1/user/profile/edit', formData,{
        
        withCredentials:true
      });
      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender
        }
        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`)
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally{
      setLoading(false)
    }
  };
  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="text-xl font-bold">Edit Profile</h1>
        <div className="flex items-center justify-between bg-gray-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={user?.profilePicture}
                alt={user?.username || "@shadcn"}
              />
              <AvatarFallback>
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-semibold text-sm">{user?.username}</h1>
              <span className="text-gray-600 text-sm">
                {user?.bio || "bio here.."}
              </span>
            </div>
          </div>
          <input ref={imageRef} onChange={fileHandler} type="file" className="hidden" />
          <Button onClick={() => imageRef.current.click()}>Change photo</Button>
        </div>
        <div>
          <h1
            className="font-bold text-xl mb-2
        "
          >
            Bio
          </h1>
          <Textarea
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            name="bio"
            className="focus-visible:ring-transparent"
          />
        </div>
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit">
              {" "}
              <Loader2 className="mr-2,h-4 w-4 animate-spin" /> please wait
            </Button>
          ) : (
            <Button onClick={editProfilehandler} className="w-fit">Submit</Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
