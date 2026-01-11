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