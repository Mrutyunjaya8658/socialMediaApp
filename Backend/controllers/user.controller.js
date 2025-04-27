import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDatauri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import mongoose from "mongoose";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password || !email) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "Email already registered",
        success: false,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    let user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({
        message: "Incorrect username or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect username or password",
        success: false,
      });
    }
    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const populatedPosts = await Promise.all(
      user.posts.map(async(postId)=>{
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null
      })
    )

    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
    };
    
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Logged in successfully ${user.username} `,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (req, res) => {
  try {
      const userId = req.params.id;

      // Check if ID is present
      if (!userId) {
          return res.status(400).json({ success: false, error: "User ID is required" });
      }

      // Check if it's a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ success: false, error: "Invalid user ID format" });
      }

      // Fetch user with populated posts and bookmarks
      const user = await User.findById(userId)
          .populate({ path: 'posts', options: { sort: { createdAt: -1 } } })
          .populate('bookmarks');

      if (!user) {
          return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.status(200).json({
          user,
          success: true,
      });

  } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const editProfile = async (req,res) => {
    try {
        const userId = req.id;
        const { gender, bio, } = req.body;
        const profilePicture = req.file;
        let cloudResponse;
        if (profilePicture) {
            const fileUri = getDatauri(profilePicture);
           cloudResponse= await cloudinary.uploader.upload(fileUri);
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({
                message: "User not found",
                success: false,
            })
        }
        if (bio) {
            user.bio = bio;
        }
        if (gender) {
            user.gender = gender;
        }
        if (profilePicture) {
            user.profilePicture = cloudResponse.secure_url;
        }

        await user.save();
        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user
        })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
          message: "Something went wrong while updating profile",
          success: false,
          error: error.message
      })
        
    }
}

export const getSuggestedUser = async (req,res) =>{
    try {
        const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password");
        if (!suggestedUsers) {
            return res.status(404).json({
                message: "No suggested users found",
                success: false,
            })
        }
        return res.status(200).json({
            users:suggestedUsers,
            success: true,
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const followOrUnfollow = async (req, res) => {
    try {
        const jiyeFollowKaribaMaaneMuHinKaruchiMoIdRu = req.id;
        const jahakuFollowKaribi = req.params.id;
        if (jiyeFollowKaribaMaaneMuHinKaruchiMoIdRu == jahakuFollowKaribi) {
            return res.status(400).json({
                message: "Cannot follow/unfollow yourself",
                success: false,
            })
        }
        const user = await User.findById(jiyeFollowKaribaMaaneMuHinKaruchiMoIdRu);
        const targetUser = await User.findById(jahakuFollowKaribi);

        if (!user || !targetUser) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            })
        }

        //check wheather to follow or unfollow the user

        const isFollowing = user.following.includes(jahakuFollowKaribi);
        if (isFollowing) {
            //unfollow logic
            await Promise.all([
                User.updateOne({_id:jiyeFollowKaribaMaaneMuHinKaruchiMoIdRu},{$pull:{following:jahakuFollowKaribi}}),
                User.updateOne({_id:jahakuFollowKaribi},{$pull:{followers:jiyeFollowKaribaMaaneMuHinKaruchiMoIdRu}})

            ])
            return res.status(200).json({
                message: "Unfollowed successfully",
                success: true,
            })
        }
        
        else{
            //follow logic
            await Promise.all([
                User.updateOne({_id:jiyeFollowKaribaMaaneMuHinKaruchiMoIdRu},{$push:{following:jahakuFollowKaribi}}),
                User.updateOne({_id:jahakuFollowKaribi},{$push:{followers:jiyeFollowKaribaMaaneMuHinKaruchiMoIdRu}})

            ])
            return res.status(200).json({
                message: "followed successfully",
                success: true,
            })
        }
    } catch (error) {
        console.log(error);
        
    }
}