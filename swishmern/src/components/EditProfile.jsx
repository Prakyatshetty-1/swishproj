import React, { useState } from "react"
import { X, Upload } from "lucide-react"
import "../styles/EditProfile.css"

const DEPARTMENTS = ['Information Tech', 'Computer Science', 'AI & DS', 'AI & ML','Mechanical', 'Civil']

export default function EditProfile({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    year: user?.year || "",
    department: user?.department || "",
    division: user?.division || "",
    avatarUrl: user?.avatarUrl || "/placeholder.svg",
  })

  const [photoPreview, setPhotoPreview] = useState(user?.avatarUrl || "/placeholder.svg")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
        setFormData((prev) => ({
          ...prev,
          avatarUrl: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Send update request to backend
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || user?._id,
          name: formData.name,
          year: formData.year,
          department: formData.department,
          division: formData.division,
          avatarUrl: formData.avatarUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update profile")
      }

      const data = await response.json()
      
      // Update localStorage with new user data
      const updatedUser = {
        ...user,
        ...data.user,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      
      // Call the onSave callback to update parent component
      onSave(updatedUser)
      
      // Show success message
      alert("Profile updated successfully!")
      
      // If avatar was changed, reload the page
      if (formData.avatarUrl !== user?.avatarUrl) {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        // Close the modal
        onClose()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert(`Failed to update profile: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user is faculty
  const isFaculty = user?.role === "faculty"

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-modal">
        {/* Header */}
        <div className="edit-profile-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Photo Upload Section */}
          <div className="photo-upload-section">
            <div className="photo-preview">
              <img src={photoPreview} alt="Profile preview" />
            </div>
            <label className="photo-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              <div className="upload-button">
                <Upload size={18} />
                <span>Change Photo</span>
              </div>
            </label>
            <p className="photo-info">JPG, PNG or GIF (Max 5MB)</p>
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required={!isFaculty}
              disabled={isFaculty}
            >
              <option value="">Select Year</option>
              <option value="1st Year (FE)">1st Year (FE)</option>
              <option value="2nd Year (SE)">2nd Year (SE)</option>
              <option value="3rd Year (TE)">3rd Year (TE)</option>
              <option value="Final Year (BE)">Final Year (BE)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {!isFaculty && (
            <div className="form-group">
              <label htmlFor="division">Division</label>
              <select
                id="division"
                name="division"
                value={formData.division}
                onChange={handleInputChange}
                required={!isFaculty}
              >
                <option value="">Select Division</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
