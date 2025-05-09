import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  TicketPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [postLike, setpostLike] = useState(post?.likes?.length);
  const [comment, setComment] = useState(post.comments);

  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText(disply);
    }
  };

  const likeOrDislikehandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `https://socialmediaapp-c7ct.onrender.com/api/v1/post/${post._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setpostLike(updatedLikes);
        setLiked(!liked);
        const updatedPostData = posts.map((p) =>
          p._id == post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id != user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `https://socialmediaapp-c7ct.onrender.com/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id == post._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `https://socialmediaapp-c7ct.onrender.com/api/v1/post/delete/${post._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPost = posts.filter(
          (postItem) => postItem._id != post?._id
        );
        dispatch(setPosts(updatedPost));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const bookMarkHandler = async ()=> {
    try {
      const res = await axios.get(`https://socialmediaapp-c7ct.onrender.com/api/v1/post/${post._id}/bookmark`,{withCredentials:true});
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      
    }
  }
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post?.author?.profilePicture} alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3">
          <h1>{post?.author?.username}</h1>
         {user?._id == post?.author?._id && <Badge variant="secondary">Author</Badge>}
          </div>
          
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-center text-sm">
            {
              post?.author?._id != user?._id && <Button
              variant="ghost"
              className="cursor-pointer w-fit text-[#ED4956] font-bold"
            >
              Unfollow
            </Button>
            }
            
            <Button
              variant="ghost"
              className="cursor-pointer w-fit text-[#ED4956] font-bold"
            >
              Add to fav
            </Button>
            {user && user?._id == post?.author?._id && (
              <Button
                onClick={deletePostHandler}
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-contain"
        src={post.image}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {liked ? (
            <Heart
              className="text-red-600 cursor-pointer hover:text-gray-500"
              size={"22px"}
              onClick={likeOrDislikehandler}
            />
          ) : (
            <Heart
              className="cursor-pointer hover:text-gray-500"
              size={"22px"}
              onClick={likeOrDislikehandler}
            />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-500"
          />
          <Send className="cursor-pointer hover:text-gray-500" />
        </div>
        <Bookmark onClick={bookMarkHandler} className="cursor-pointer hover:text-gray-500" />
      </div>
      <span className="font-medium mb-2 block text-sm">{postLike} likes</span>
      <p>
        <span className="font-medium mr-2">{post?.author?.username}</span>
        {post.caption}
      </p>
      {
        comment?.length > 0 && (
          <span
        onClick={() => {
          dispatch(setSelectedPost(post));
          setOpen(true);
        }}
        className="cursor-pointer text-gray-400 text-sm"
      >
        View all {comment.length} comments
      </span>
        )
      }
      
      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="add an account"
          className="text-sm w-full outline-none"
          value={text}
          onChange={changeEventHandler}
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-[#3BADF8] cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
