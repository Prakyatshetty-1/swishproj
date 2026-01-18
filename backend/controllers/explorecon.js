import User from '../models/User.js';

// GET ALL USERS (with optional filtering)
export const getAllUsers = async (req, res) => {
  try {
    const { excludeUserId } = req.query;
    
    // Build filter to exclude specific user if provided
    const filter = {};
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }
    
    // Get current user's following list to exclude them
    let followingList = [];
    if (excludeUserId) {
      const currentUser = await User.findById(excludeUserId, { followingList: 1 }).lean();
      followingList = currentUser?.followingList || [];
    }
    
    // Also exclude users that current user is already following
    if (followingList.length > 0) {
      filter._id = { 
        $ne: excludeUserId,
        $nin: followingList
      };
    }
    
    const users = await User.find(filter, {
      name: 1,
      email: 1,
      avatarUrl: 1,
      role: 1,
      about: 1,
      department: 1,
      year: 1,
      followers: 1,
      following: 1,
      posts: 1,
    }).lean();

    res.status(200).json({
      message: 'Users fetched successfully',
      users: users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        about: user.about,
        department: user.department,
        year: user.year,
        followers: user.followers,
        following: user.following,
        posts: user.posts,
      })),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// SEARCH USERS (search by name, email, role, or department)
export const searchUsers = async (req, res) => {
  try {
    const { query, excludeUserId } = req.query;

    // Validate search query
    if (!query || query.trim().length < 1) {
      return res.status(200).json({
        message: 'Empty search query',
        users: [],
      });
    }

    // Build search filter
    const searchFilter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { role: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
      ],
    };

    // Exclude current user if provided
    if (excludeUserId) {
      searchFilter._id = { $ne: excludeUserId };
    }

    const users = await User.find(searchFilter, {
      name: 1,
      email: 1,
      avatarUrl: 1,
      role: 1,
      about: 1,
      department: 1,
      year: 1,
      followers: 1,
      following: 1,
      posts: 1,
    }).limit(20).lean();

    console.log(`✅ Search results for "${query}": ${users.length} users found`);

    res.status(200).json({
      message: 'Users found successfully',
      users: users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        about: user.about,
        department: user.department,
        year: user.year,
        followers: user.followers,
        following: user.following,
        posts: user.posts,
      })),
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};
