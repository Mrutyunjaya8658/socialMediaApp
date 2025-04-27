import { Message } from "../models/message.model.js";
import { Converstation } from "../models/converstation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        let converstation = await Converstation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!converstation) {
            converstation = await Converstation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        if (newMessage) {
            converstation.messages.push(newMessage._id);
        }

        await converstation.save();

        // Implement socket.io for real-time transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        res.status(201).json({
            message: "Message sent successfully",
            success: true,
            newMessage,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const converstation = await Converstation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");

        if (!converstation) {
            return res.status(200).json({
                messages: [],
                success: true,
            });
        }

        return res.status(200).json({
            success: true,
            messages: converstation.messages
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
