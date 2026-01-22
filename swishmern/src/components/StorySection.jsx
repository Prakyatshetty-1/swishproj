import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Trash2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import "../styles/Home.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

export default function StorySection() {
  const [storyGroups, setStoryGroups] = useState([]); // ✅ Stores stories grouped by User
  const [currentUser, setCurrentUser] = useState(null);
  
  // Viewer State
  const [activeGroup, setActiveGroup] = useState(null); // Which user's stories are we watching?
  const [currentIndex, setCurrentIndex] = useState(0);  // Which story in the stack are we on?
  
  // Upload State
  const [uploadPreview, setUploadPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [captionText, setCaptionText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  // 1. Fetch & Group Stories
  const fetchStories = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      const userId = user.id || user._id;

      try {
        const res = await axios.get(`${API_BASE_URL}/stories/${userId}`);
        
        // ✅ GROUPING LOGIC: Combine stories from the same user
        const rawStories = res.data;
        const grouped = {};

        rawStories.forEach(story => {
            const uid = story.userId._id;
            if (!grouped[uid]) {
                grouped[uid] = { 
                    user: story.userId, 
                    stories: [] 
                };
            }
            grouped[uid].stories.push(story);
        });

        // Convert object to array (Current User first, then others)
        let groupsArray = Object.values(grouped);
        
        // Sort so "My Story" is always first if it exists
        groupsArray.sort((a, b) => {
            if (a.user._id === userId) return -1;
            if (b.user._id === userId) return 1;
            return 0;
        });

        setStoryGroups(groupsArray);

      } catch (err) {
        console.error("Error fetching stories:", err);
      }
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // 2. Handle File Select
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  // 3. Handle Upload
  const handlePostStory = async () => {
    if (!selectedFile || !currentUser) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("userId", currentUser.id || currentUser._id);
    formData.append("caption", captionText);

    try {
      await axios.post(`${API_BASE_URL}/stories`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Refresh list
      await fetchStories();
      closeUploadModal();

    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload story");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Handle Delete
  const handleDeleteStory = async (storyId) => {
    if (!confirm("Delete this story?")) return;
    try {
        await axios.delete(`${API_BASE_URL}/stories/${storyId}`, {
            data: { userId: currentUser.id || currentUser._id }
        });
        
        // Remove locally to avoid refetch
        const updatedStories = activeGroup.stories.filter(s => s._id !== storyId);
        
        if (updatedStories.length === 0) {
            // If no stories left for this user, close viewer and remove group
            setActiveGroup(null);
            fetchStories();
        } else {
            // Update the active group
            setActiveGroup({ ...activeGroup, stories: updatedStories });
            // Adjust index if we deleted the last one
            if (currentIndex >= updatedStories.length) {
                setCurrentIndex(updatedStories.length - 1);
            }
        }
    } catch (err) {
        console.error("Failed to delete story", err);
    }
  };

  // 5. Navigation Logic (Tap Left/Right)
  const handleNext = (e) => {
      e.stopPropagation();
      if (currentIndex < activeGroup.stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
      } else {
          setActiveGroup(null); // Close if finished
      }
  };

  const handlePrev = (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
      } else {
          // Optional: Go to previous user's story? For now just restart.
          setCurrentIndex(0);
      }
  };

  const openStoryGroup = (group) => {
      setActiveGroup(group);
      setCurrentIndex(0); // Start from first story
  };

  const closeUploadModal = () => {
      setUploadPreview(null);
      setSelectedFile(null);
      setCaptionText("");
  };

  // Helper to get current story object
  const currentStory = activeGroup ? activeGroup.stories[currentIndex] : null;

  useEffect(() => {
    if (currentStory && currentUser) {
      // Don't count view if it's your own story
      if (currentStory.userId._id === currentUser.id || currentStory.userId._id === currentUser._id) return;

      const recordView = async () => {
        try {
          await axios.put(`${API_BASE_URL}/stories/view`, {
            storyId: currentStory._id,
            userId: currentUser.id || currentUser._id
          });
        } catch (err) {
          console.error("Failed to record view", err);
        }
      };

      recordView();
    }
  }, [currentStory, currentUser]);

  return (
    <div className="stories-container">
      {/* 1. Add Story Button */}
      <div className="story-item add-story" onClick={() => fileInputRef.current.click()}>
        <div className="story-circle-wrapper">
           <img 
             src={currentUser?.avatarUrl || "https://ui-avatars.com/api/?name=Me"} 
             className="story-avatar" 
             alt="Me" 
           />
           <div className="add-story-icon"><Plus size={14} color="white" /></div>
        </div>
        <span className="story-username">Add Story</span>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{display:'none'}} 
          accept="image/*"
          onChange={handleFileSelect}
        />
      </div>

      {/* 2. List Story Groups (One circle per user) */}
      {storyGroups.map((group) => (
        <div key={group.user._id} className="story-item" onClick={() => openStoryGroup(group)}>
          <div className="story-circle-wrapper has-story">
            <img 
              src={group.user.avatarUrl || "https://ui-avatars.com/api/?name=User"} 
              className="story-avatar" 
              alt="User"
            />
          </div>
          <span className="story-username">
            {group.user._id === currentUser?._id || group.user._id === currentUser?.id ? "Your Story" : group.user.name.split(" ")[0]}
          </span>
        </div>
      ))}

      {/* 3. Upload Preview */}
      {uploadPreview && (
        <div className="story-viewer-overlay">
           <div className="story-viewer-content upload-mode">
              <h3>New Story</h3>
              <img src={uploadPreview} className="story-preview-img" alt="Preview" />
              <div className="caption-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Add a caption..." 
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handlePostStory} disabled={isUploading}>
                      {isUploading ? "..." : <Send size={20} />}
                  </button>
              </div>
              <button className="close-story-btn" onClick={closeUploadModal}>
                  <X size={24} color="white" />
              </button>
           </div>
        </div>
      )}

      {/* 4. Story Viewer (The Real Deal) */}
      {activeGroup && currentStory && (
        <div className="story-viewer-overlay" onClick={() => setActiveGroup(null)}>
          <div className="story-viewer-content" onClick={(e) => e.stopPropagation()}>
             
             {/* Progress Bars */}
             <div className="story-progress-container">
                 {activeGroup.stories.map((_, idx) => (
                     <div key={idx} className="progress-bar-bg">
                         <div 
                            className="progress-bar-fill"
                            style={{ width: idx <= currentIndex ? '100%' : '0%' }}
                         ></div>
                     </div>
                 ))}
             </div>

             {/* Navigation Hit Areas (Invisible) */}
             <div className="nav-hit-area left" onClick={handlePrev}></div>
             <div className="nav-hit-area right" onClick={handleNext}></div>

             <img src={currentStory.img} alt="Story" className="story-full-img" />
             
             {/* Header */}
             <div className="story-viewer-header">
               <img src={activeGroup.user.avatarUrl} className="viewer-avatar"/>
               <span>{activeGroup.user.name}</span>
               <span className="story-time">
                 {new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
             </div>

             {/* Caption */}
             {currentStory.caption && (
                 <div className="story-caption-overlay">
                     <p>{currentStory.caption}</p>
                 </div>
             )}

             {/* Delete Button (Owner Only) */}
             {(currentUser?.id === activeGroup.user._id || currentUser?._id === activeGroup.user._id) && (
                 <button 
                    className="delete-story-btn" 
                    onClick={() => handleDeleteStory(currentStory._id)}
                 >
                     <Trash2 size={24} color="white" />
                 </button>
             )}
          </div>
          
          <button className="close-story-btn" onClick={() => setActiveGroup(null)}>
            <X size={32} color="white" />
          </button>
        </div>
      )}
    </div>
  );
}