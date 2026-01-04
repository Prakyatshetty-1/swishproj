import React from "react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "../../styles/Logo.css"; // We'll add a tiny CSS file for this

export default function Logo() {
  return (
    <Link to="/" className="brand-logo">
      <div className="logo-icon-wrapper">
        <Sparkles size={20} fill="currentColor" />
      </div>
      <span className="logo-text">Swish</span>
    </Link>
  );
}