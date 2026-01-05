import express from 'express';
import { signup, login, logout, refreshAccessToken, saveOnboarding } from '../controllers/authcon.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/save-onboarding', saveOnboarding);

export default router;
