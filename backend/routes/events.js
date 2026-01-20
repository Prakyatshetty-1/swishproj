import express from 'express';
import { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  registerForEvent, 
  unregisterFromEvent 
} from '../controllers/eventcon.js';
import { verifyAdmin } from '../middleware/adminmid.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:eventId', getEventById);

// Admin only routes
router.post('/', verifyAdmin, createEvent);
router.put('/:eventId', verifyAdmin, updateEvent);
router.delete('/:eventId', verifyAdmin, deleteEvent);

// User registration routes
router.post('/:eventId/register', registerForEvent);
router.post('/:eventId/unregister', unregisterFromEvent);

export default router;
