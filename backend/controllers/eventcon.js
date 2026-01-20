import Event from '../models/Event.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

// CREATE EVENT (Admin only)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category, attendees, endDate, imageUrl } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let imageUrlToUse = null;
    
    // Handle image upload to Cloudinary if provided
    if (imageUrl && imageUrl.startsWith('data:')) {
      try {
        console.log('📸 Uploading event image to Cloudinary...');
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: 'swish/events',
          resource_type: 'auto',
          width: 800,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          timeout: 60000,
        });
        imageUrlToUse = result.secure_url;
        console.log('✅ Event image uploaded successfully:', imageUrlToUse);
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ 
          message: 'Error uploading image to Cloudinary', 
          error: cloudinaryError.message 
        });
      }
    } else if (imageUrl && imageUrl.startsWith('http')) {
      // Already a URL, keep as is
      imageUrlToUse = imageUrl;
    }

    // Create new event
    const newEvent = new Event({
      title,
      description,
      date: new Date(date),
      time,
      endDate: endDate ? new Date(endDate) : null,
      location,
      category: category || 'other',
      attendees: attendees || 0,
      image: imageUrlToUse,
      createdBy: userId,
      registeredUsers: [],
    });

    await newEvent.save();
    await newEvent.populate('createdBy', 'name email');

    console.log(`✅ Event created by admin: ${title}`);
    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.status(200).json({
      message: 'Events retrieved successfully',
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// GET SINGLE EVENT
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({
      message: 'Event retrieved successfully',
      event,
    });
  } catch (error) {
    console.error('Get event by id error:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// UPDATE EVENT (Admin only - only event creator)
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    const { title, description, date, time, location, category, attendees, endDate, imageUrl } = req.body;

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator of the event
    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update events you created' });
    }

    // Handle image upload to Cloudinary if provided
    if (imageUrl && imageUrl.startsWith('data:')) {
      try {
        console.log('📸 Uploading new event image to Cloudinary...');
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: 'swish/events',
          resource_type: 'auto',
          width: 800,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          timeout: 60000,
        });
        event.image = result.secure_url;
        console.log('✅ Event image updated successfully:', event.image);
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ 
          message: 'Error uploading image to Cloudinary', 
          error: cloudinaryError.message 
        });
      }
    } else if (imageUrl && imageUrl.startsWith('http')) {
      // Already a URL, keep as is
      event.image = imageUrl;
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (time) event.time = time;
    if (location) event.location = location;
    if (category) event.category = category;
    if (attendees !== undefined) event.attendees = attendees;
    if (endDate) event.endDate = new Date(endDate);

    await event.save();
    await event.populate('createdBy', 'name email');

    console.log(`✅ Event updated: ${event.title}`);
    res.status(200).json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// DELETE EVENT (Admin only - only event creator)
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator of the event
    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete events you created' });
    }

    await Event.findByIdAndDelete(eventId);

    console.log(`✅ Event deleted: ${event.title}`);
    res.status(200).json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

// REGISTER FOR EVENT
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user already registered
    if (event.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.registeredUsers.push(userId);
    event.attendees = event.registeredUsers.length;
    await event.save();

    console.log(`✅ User registered for event: ${event.title}`);
    res.status(200).json({
      message: 'Registered for event successfully',
      event,
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
};

// UNREGISTER FROM EVENT
export const unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from registered users
    event.registeredUsers = event.registeredUsers.filter(id => id.toString() !== userId);
    event.attendees = event.registeredUsers.length;
    await event.save();

    console.log(`✅ User unregistered from event: ${event.title}`);
    res.status(200).json({
      message: 'Unregistered from event successfully',
      event,
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Error unregistering from event', error: error.message });
  }
};
