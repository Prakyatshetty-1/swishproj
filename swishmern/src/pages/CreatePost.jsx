import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Image, X, MapPin, Users, Hash, ArrowLeft } from "lucide-react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/CreatePost.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [user, setUser] = useState(null);

  //get the user id from localstorage on mount
  useEffect(()=>{
    const storedUser = localStorage.getItem("user");
    if(storedUser){
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  },[navigate]);

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e) { e.preventDefault(); setIsDragging(false); }

  function handleDrop(e) {
    e.preventDefault(); 
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  }

  //helper function to handle file processing
  function processFile(file){
    if(file && file.type.startsWith("image/")){
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  }

  async function handlePost() {
    if (!imageFile || !user) return alert("Please select an image");

    setIsPosting(true);

    const tagsArray = hashtags.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag!== "")
    .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    const formData = new FormData();
    formData.append("userId", user.id || user._id);
    formData.append("caption",caption);
    formData.append("image", imageFile);
    formData.append("location", location);
    formData.append("hashtags",JSON.stringify(tagsArray));

    try{
      await axios.post(`${API_BASE_URL}/posts`, formData, {
        headers: {"Content-Type": "multipart/form-data"},
      });
      setIsPosting(false);
      alert("Post created successfully.");
      navigate("/home");
    }
    catch(err){
      console.error("Post failed: ",err);
      setIsPosting(false);
      alert("Failed to create post. Please try again.");
    }
  }

  return (
  <div>
      <Sidebar />
      <div className="create-post-wrapper">
      <header className="post-header-grid">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-link">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
        
        <div className="header-center">
          <h1 className="page-heading">Create Post</h1>
        </div>
        
        <div className="header-right">
          <button 
            className="post-pill-btn"
            onClick={handlePost}
            disabled={isPosting || !selectedImage}
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </header>

      
      <div className="create-card">
        
        {!selectedImage ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`dashed-drop-zone ${isDragging ? "active" : ""}`}
          >
            <div className="icon-placeholder-circle">
              <Image size={32} />
            </div>
            <p className="drop-label">Drag and drop your photo</p>
            <p className="drop-sublabel">or</p>
            <label className="blue-browse-btn">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} style={{display:'none'}} />
              Browse Files
            </label>
          </div>
        ) : (
          <div className="dashed-drop-zone" style={{ border: 'none', background: 'black' }}>
            <img src={selectedImage} alt="Preview" className="preview-full-img" />
            <button onClick={() => setSelectedImage(null)} className="clear-img-btn">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="caption-section">
          <div className="caption-box">
            <textarea 
              className="caption-field" 
              placeholder="Write a caption... Use #hashtags to reach more people"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>

      
        <div className="meta-options">
          <div className="meta-row">
            <div className="meta-left">
              <MapPin size={18} />
              <input 
              type="text"
              className="meta-input"
              style={{border:'none', outline:'none', marginLeft:'10px', width:'100%'}}
              placeholder="Add location (e.g. College Canteen)"
              value={location}
              onChange={(e)=> setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="meta-row">
            <div className="meta-left">
              <Users size={18} />
              <span>Tag people</span>
            </div>
          </div>
          
          <div className="meta-row">
            <div className="meta-left">
              <Hash size={18} />
              <input 
              type="text"
              className="meta-input"
              style={{border:'none', outline:'none', marginLeft:'10px', width:'100%'}}
              placeholder="Add # topics (comma separated)"
              value={hashtags}
              onChange={(e)=> setHashtags(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  );
}                                                                       