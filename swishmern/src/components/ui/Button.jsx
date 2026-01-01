import React from "react";
import "../../styles/Button.css";

export const Button = ({ children, variant = "brand", className, ...props }) => {
  // Map the "variant" prop to a CSS class
  const variantClass = variant === "hero" ? "btn-hero" : "btn-brand";
  
  return (
    <button className={`btn ${variantClass} ${className || ""}`} {...props}>
      {children}
    </button>
  );
};