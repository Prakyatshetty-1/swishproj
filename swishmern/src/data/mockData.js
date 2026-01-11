// src/data/mockData.js

export const trendingTags = [
  "ExamSeason",
  "Hackathon2026",
  "CampusLife",
  "Internships",
  "FreshersParty",
  "LibrarySquad",
  "CodingClub",
  "SportsMeet"
];

export const posts = [
  {
    id: 1,
    likes: 124,
    comments: [1, 2, 3], // Mock array to count length
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    user: { id: "u1", name: "Sarah" }
  },
  {
    id: 2,
    likes: 89,
    comments: [1, 2],
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80",
    user: { id: "u2", name: "Mike" }
  },
  {
    id: 3,
    likes: 256,
    comments: [1, 2, 3, 4, 5],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    user: { id: "u3", name: "Jessica" }
  },
  {
    id: 4,
    likes: 45,
    comments: [],
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
    user: { id: "u4", name: "David" }
  },
  {
    id: 5,
    likes: 12,
    comments: [],
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    user: { id: "u6", name: "Ryan" }
  },
  {
    id: 6,
    likes: 88,
    comments: [1, 2, 3],
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
    user: { id: "u7", name: "Group Study" }
  },
  {
    id: 7,
    likes: 230,
    comments: [1, 2, 3, 4],
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    user: { id: "u8", name: "Workshop" }
  },
  {
    id: 8,
    likes: 56,
    comments: [1],
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    user: { id: "u9", name: "Music Fest" }
  }
];

//mock data related to campus events -

export const campusEvents = [
  {
    id: "e1",
    title: "Annual Tech Symposium 2026",
    description: "Join us for the biggest tech event of the year featuring keynotes from industry leaders, workshops, and networking opportunities.",
    date: "2026-01-15",
    time: "9:00 AM - 5:00 PM",
    location: "Main Auditorium",
    category: "academic",
    attendees: 450,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
  },
  {
    id: "e2",
    title: "Career Fair Spring 2026",
    description: "Meet recruiters from top companies including Google, Microsoft, and Amazon. Bring your resume and dress professionally!",
    date: "2026-01-20",
    time: "10:00 AM - 4:00 PM",
    location: "Student Center Hall",
    category: "career",
    attendees: 800,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
  },
  {
    id: "e3",
    title: "Basketball Championship Finals",
    description: "Cheer for our campus team as they compete in the regional finals! Free entry for all students.",
    date: "2026-01-18",
    time: "7:00 PM",
    location: "Sports Complex",
    category: "sports",
    attendees: 1200,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
  },
  {
    id: "e4",
    title: "Creative Writing Workshop",
    description: "Learn storytelling techniques from published author Dr. Emily Rodriguez. Limited seats available!",
    date: "2026-01-22",
    time: "2:00 PM - 4:00 PM",
    location: "Library Room 201",
    category: "workshop",
    attendees: 35,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
  },
  {
    id: "e5",
    title: "International Food Festival",
    description: "Celebrate cultural diversity with food stalls from 20+ countries. Live performances and cooking demos!",
    date: "2026-01-25",
    time: "11:00 AM - 8:00 PM",
    location: "Campus Green",
    category: "cultural",
    attendees: 650,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
  },
  {
    id: "e6",
    title: "AI & Machine Learning Hackathon",
    description: "48-hour hackathon with $10,000 in prizes. Build innovative AI solutions and compete with the best!",
    date: "2026-02-01",
    endDate: "2026-02-03",
    time: "Starts 6:00 PM Friday",
    location: "Engineering Building",
    category: "academic",
    attendees: 200,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
  },
  {
    id: "e7",
    title: "Spring Semester Welcome Party",
    description: "Kick off the new semester with music, games, and free food! Meet new friends and reconnect with old ones.",
    date: "2026-01-11",
    time: "5:00 PM - 10:00 PM",
    location: "Student Union",
    category: "social",
    attendees: 500,
    image: "https://images.unsplash.com/photo-1529543544277-750e7b8dd87e?w=400&h=300&fit=crop",
  },
  {
    id: "e8",
    title: "Research Poster Presentation",
    description: "Undergraduate students showcase their research projects. Awards for best presentations in each category.",
    date: "2026-01-08",
    time: "1:00 PM - 5:00 PM",
    location: "Science Building Atrium",
    category: "academic",
    attendees: 150,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
  },
  {
    id: "e9",
    title: "Yoga & Wellness Week",
    description: "Free yoga sessions, meditation workshops, and wellness seminars all week long. No experience needed!",
    date: "2026-01-05",
    endDate: "2026-01-09",
    time: "7:00 AM - 8:00 AM daily",
    location: "Recreation Center",
    category: "sports",
    attendees: 75,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
  },
];