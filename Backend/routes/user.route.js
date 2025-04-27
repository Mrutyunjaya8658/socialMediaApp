import express from 'express'
import { editProfile, followOrUnfollow, getProfile, getSuggestedUser, login, logout, register } from '../controllers/user.controller.js';
import isAuthenticated from '../middleWare/isAuthenticated.js';
import upload from '../middleWare/multer.js';

const router = express.Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated , getProfile);
router.route('/profile/edit').post(isAuthenticated ,upload.single('profilePicture'), editProfile);
router.route('/suggested').get(isAuthenticated , getSuggestedUser);
router.route('/followunfollow/:id').post(isAuthenticated , followOrUnfollow);

export default router;