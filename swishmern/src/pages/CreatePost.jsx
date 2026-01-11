import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, X, MapPin, Users, Hash, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "../styles/CreatePost.css";

export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e) { e.preventDefault(); setIsDragging(false); }
  function handleDrop(e) {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  }
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handlePost() {
    if (!selectedImage) return;
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      navigate("/explore");
    }, 1500);
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
            {isPosting ? "..." : "Post"}
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
              <span>Add location</span>
            </div>
            <span className="meta-val">Campus Library</span>
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
              <span>Add topics</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}                                                                       