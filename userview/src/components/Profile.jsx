import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import store from "@/redux/store";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");

  const { userProfile,user } = useSelector((store) => store.auth);
  const loggedinuserprpofile = user?._id == userProfile?._id
  const isFollowing = false;
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const displayPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;
  return (
    <div className="flex max-w-5xl mx-auto justify-center pl-10">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilePhoto"
              />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>
                {loggedinuserprpofile ? (
                  <>
                   <Link to="/account/edit">
                   <Button
                      className="hover:bg-gray-200 h-8"
                      variant="secondary"
                    >
                      Edit profile
                    </Button></Link> 
                    <Button
                      className="hover:bg-gray-200 h-8"
                      variant="secondary"
                    >
                      view Archieve
                    </Button>
                    <Button
                      className="hover:bg-gray-200 h-8"
                      variant="secondary"
                    >
                      Add tools
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button variant="secondary">Unfollow</Button>
                    <Button variant="secondary">Message</Button>
                  </>
                ) : (
                  <Button className="bg-[#0095F6] hover:bg-[#29485d]">
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.length}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers?.length}
                  </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following?.length}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here...."}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
                <span>broooooooooooooo</span>
                <span>broooooooooooooo</span>
                <span>broooooooooooooo</span>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
          <span
  className={`py-3 cursor-pointer ${
    activeTab == "posts" ? "font-bold" : ""
  }`}
  onClick={() => handleTabChange("posts")}
>
  POSTS
</span>
<span
  className={`py-3 cursor-pointer ${
    activeTab == "posts" ? "font-bold" : ""
  }`}
  onClick={() => handleTabChange("saved")}
>
  SAVED
</span>
            <span className="py-3 cursor-pointer">REELS</span>
            <span className="py-3 cursor-pointer">TAGS</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {displayPost?.length > 0 ? (
              displayPost.map((post, index) => (
                <div key={post?._id || index} className="relative group cursor-pointer">
                  <img
                    src={post.image}
                    alt="postImage"
                    className="rounded-sm my-2 w-full h-48 aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-4">
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <Heart/>
                        <span>{post?.likes?.length}</span>
                      </button>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <MessageCircle/>
                        <span>{post?.comments?.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No posts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
