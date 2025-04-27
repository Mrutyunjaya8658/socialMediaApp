import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  // Check if user is available before rendering
  if (!user) {
    return <div>Loading...</div>; // Or any fallback UI you prefer
  }

  return (
    <div className="w-fit my-10 pr-32">
      <div className="flex items-center gap-2">
        <Link to={`/profile/${user._id}`}>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt={user?.username || "@shadcn"} />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>

        <div>
          <h1 className="font-semibold text-sm">{user?.username}</h1>
          <span className="text-gray-600 text-sm">{user?.bio || 'bio here..'}</span>
        </div>
      </div>
      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;
