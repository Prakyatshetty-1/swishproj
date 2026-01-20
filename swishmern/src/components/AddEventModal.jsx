import React from "react";
import { X, Upload } from "lucide-react";
import "../styles/AddEventModal.css";

export default function AddEventModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  onImageChange,
  isEditing,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-event-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-custom">
          <div className="header-content">
            <h2 className="modal-title">
              {isEditing ? "✏️ Edit Event" : "🎉 Create New Event"}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? "Update event details"
                : "Fill in the details to create a new campus event"}
            </p>
          </div>
          <button className="close-btn-custom" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="event-form-custom">
          <div className="form-section">
            <h3 className="section-title">📋 Event Details</h3>

            <div className="form-group-custom">
              <label htmlFor="title">Event Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                required
                placeholder="e.g., Annual Tech Symposium"
                className="form-input"
              />
            </div>

            <div className="form-group-custom">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                required
                placeholder="Describe your event in detail..."
                rows="4"
                className="form-textarea"
              ></textarea>
            </div>

            <div className="form-row-custom">
              <div className="form-group-custom">
                <label htmlFor="date">Start Date *</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={onInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group-custom">
                <label htmlFor="time">Time *</label>
                <input
                  id="time"
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={onInputChange}
                  placeholder="9:00 AM - 5:00 PM"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label htmlFor="endDate">End Date (Optional)</label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={onInputChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Location & Category Section */}
          <div className="form-section">
            <h3 className="section-title">📍 Location & Category</h3>

            <div className="form-group-custom">
              <label htmlFor="location">Location *</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                required
                placeholder="e.g., Main Auditorium, Campus Green"
                className="form-input"
              />
            </div>

            <div className="form-row-custom">
              <div className="form-group-custom">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                  className="form-select"
                >
                  <option value="academic">📚 Academic</option>
                  <option value="career">💼 Career</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="workshop">🛠️ Workshop</option>
                  <option value="cultural">🎭 Cultural</option>
                  <option value="social">🎊 Social</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              <div className="form-group-custom">
                <label htmlFor="attendees">Expected Attendees</label>
                <input
                  id="attendees"
                  type="number"
                  name="attendees"
                  value={formData.attendees}
                  onChange={onInputChange}
                  min="0"
                  placeholder="0"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="form-section">
            <h3 className="section-title">🖼️ Event Image</h3>

            <div className="image-upload-custom">
              {formData.imagePreview ? (
                <div className="image-preview-custom">
                  <img src={formData.imagePreview} alt="Event Preview" />
                  <button
                    type="button"
                    className="remove-image-btn-custom"
                    onClick={() =>
                      formData.setFormData((prev) => ({
                        ...prev,
                        image: null,
                        imagePreview: null,
                      }))
                    }
                    title="Remove image"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="upload-area-custom">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="file-input-custom"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="upload-label-custom">
                    <Upload size={40} />
                    <p className="upload-title">Click to upload event image</p>
                    <span className="upload-subtitle">
                      JPG, PNG, GIF • Max 5MB
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-custom">
            <button
              type="submit"
              className="btn-submit-custom"
              disabled={loading}
            >
              {loading ? "Processing..." : isEditing ? "Update Event" : "Create Event"}
            </button>
            <button
              type="button"
              className="btn-cancel-custom"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
