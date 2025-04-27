import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import postRoute from './routes/post.route.js';
import messageRoute from './routes/message.route.js';
import {app,server} from './socket/socket.js'
import path from 'path';
dotenv.config();

// CORS configuration
const corsOptions = {
    origin: true,
    credentials: true,
};

const __dirname = path.resolve();
console.log(__dirname);


// Middlewares
app.use(cors(corsOptions));  // CORS must be applied here
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// API routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/message', messageRoute);

app.use(express.static(path.join(__dirname,"/userview/dist")));
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname, "userview" , "dist","index.html"));
})

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    connectDB();
    console.log(`Server is running at http://localhost:${PORT}`);
});
