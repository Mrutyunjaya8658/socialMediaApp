import sharp from 'sharp';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import { Comment } from '../models/comment.model.js';
    import cloudinary from '../utils/cloudinary.js';
import { getReceiverSocketId, io } from '../socket/socket.js';
export const addNewPost = async (req,res) => {
    try {
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(400).json({
                message: "No image provided",
                success: false,
            })
        }
        //image upload
        const optimizedImageBuffer = await sharp(image.buffer).resize({width:800 , height:800 , fit:'inside'}).toFormat('jpeg', {quality : 80}).toBuffer();
        //buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse  = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image:cloudResponse.secure_url,
            author:authorId
        })

        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({path:'author' , select:'-password'});
        res.status(201).json({
            message: "Post created successfully",
            success: true,
            post
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const getAllPost = async (req,res) => {
    try {
        const posts = await Post.find().sort({createdAt:-1}).populate({path:'author' , select:'username , profilePicture'})
        .populate({path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select: 'username , profilePicture'
            }
        })
        return res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            posts
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const getUserPost =  async (req,res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({author:authorId}).sort({createdAt:-1}).populate({
            path:'author',
            select:'username,password'
        }).populate({path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select: 'username , profilePicture'
            }
        })
        return res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            posts
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const likePost = async (req,res) => {
    try {
        const userId = req.id;
        const postid = req.params.id;
        const post = await Post.findById(postid);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            })
        }
        //like logic of a post
        await post.updateOne({$addToSet:{likes:userId}});
        await post.save();

        //implement socketio for real time notification
        const user = await User.findById(userId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if (postOwnerId != userId) {
            const notification = {
                type:'like',
                userId: userId,
                userDetails:user,
                postid,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }
        return res.status(200).json({
            message: "Post liked successfully",
            success: true,
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const disLikePost = async (req,res) => {
    try {
        const userId = req.id;
        const postid = req.params.id;
        const post = await Post.findById(postid);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            })
        }
        //like logic of a post
        await post.updateOne({$pull:{likes:userId}});
        await post.save();

        //implement socketio for real time notification
        //implement socketio for real time notification
        const user = await User.findById(userId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if (postOwnerId != userId) {
            const notification = {
                type:'dislike',
                userId: userId,
                userDetails:user,
                postid,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({
            message: "Post disliked successfully",
            success: true,
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentkrnewalaId = req.id;
        const { text } = req.body;
        
        const post = await Post.findById(postId);
        
        if (!text) {
            return res.status(400).json({
                message: "Comment text is required",
                success: false,
            });
        }

        // Create the comment
        const comment = await Comment.create({
            text,
            author: commentkrnewalaId,
            post: postId
        });

        // Populate author details
        await comment.populate({
            path: 'author',
            select: 'username profilePicture'
        });

        // Push the comment to the post
        post.comments.push(comment._id);
        await post.save();

        // Return the response
        return res.status(201).json({
            message: "Comment added successfully",
            success: true,
            comment
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};


export const getCommentByPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const comments  = await Comment.find({post:postId}).populate('author' , 'username , profilePicture');
        if (!comments) {
            return res.status(404).json({
                message: 'No comments',
                success: false
            })
        }
        return res.status(200).json({
            comments,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message:"post not found",
                success:false
            })
        }

        //check the logged in user is author or not
        if (post.author.toString() != authorId) {
            return res.status(403).json({
                message:"Unauthorized",
                success:false
            })
        }

        // /delete post
        await Post.findByIdAndDelete(postId);

        //remove the post id from user
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id=> id.toString()!= postId);
        await user.save();

        //delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            message:"Post deleted successfully",
            success:true
        })

    } catch (error) {
        console.log(error);
        
    }
}

export const bookmark = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            })
        }
        const user =  await User.findById(authorId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            })
        }
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({
                type: 'unsaved',
                message: "Post removed from bookmarks",
                success: true,
            })
        }
        else{
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({
                type: 'saved',
                message: "Post bookmarked",
                success: true,
            })
        }
    } catch (error) {
        console.log(error);
        
    }
}