import express from 'express';
import { signup, login, logout, refreshAccessToken, saveOnboarding, googleSignIn, setPassword } from '../controllers/authcon.js';
import { updateProfile, getUserById, followUser, unfollowUser } from '../controllers/profilecon.js';
import { getAllUsers, searchUsers } from '../controllers/explorecon.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/save-onboarding', saveOnboarding);
router.post('/google-signin', googleSignIn);
router.post('/set-password', setPassword);
router.post('/update-profile', updateProfile);
router.get('/users', getAllUsers);
router.get('/search-users', searchUsers);
router.get('/user/:userId', getUserById);
router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);

export default router;
