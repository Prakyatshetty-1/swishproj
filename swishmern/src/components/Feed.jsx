import React, {useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import StorySection from "./StorySection";
import Post from "./Post";

const API_BASE_URL = "http://localhost:5000/api";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const storiesData = [
    { id: 1, name: "Add Story", icon: "➕" },
    { id: 2, name: "Campus Updates", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150" },
    { id: 3, name: "Lab Updates", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150" },
    { id: 4, name: "Design", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=150" },
  ];

  //fetch posts from backend
  useEffect(()=>{
    const fetchPosts = async ()=>{
      try{
        const res = await axios.get(`${API_BASE_URL}/posts/feed`);
        setPosts(res.data);
      }
      catch(err){
        console.error("Error fetching feed:", err);
      }
      finally{
        setLoading(false);
      }
    };
    fetchPosts();
  },[]);

return (
    <div className="feed">
      <StorySection stories={storiesData} />
      
      {/* Loading State */}
      {loading && <p style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Loading posts...</p>}

      {/* Posts List */}
      <div className="feed-posts" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {posts.map((post) => {
          // MAP Backend Data -> Frontend Props
          const postProps = {
            id: post._id,
            author: post.userId?.name || "Unknown User",
            authorRole: post.userId?.role || "Student",
            authorImage: post.userId?.avatarUrl || "https://ui-avatars.com/api/?name=User",
            postImage: post.img, // Cloudinary url
            caption: post.caption,
            location: post.location,
            hashtags: post.hashtags,
            likes: post.likes ? post.likes.length : 0,
            commentCount: post.comments ? post.comments.length : 0,
            timeAgo: post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Just now"
          };

          return <Post key={post._id} {...postProps} />;
        })}

        {!loading && posts.length === 0 && (
          <p style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>
            No posts yet. Be the first to post!
          </p>
        )}
      </div>
    </div>
  );
}
