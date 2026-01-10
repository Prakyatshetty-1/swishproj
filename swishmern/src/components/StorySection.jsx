import "../styles/story-section.css"

export default function StorySection({ stories }) {
  return (
    <div className="story-section">
      {stories.map((story) => (
        <div key={story.id} className="story-card">
          {story.icon ? (
            <div className="story-add-icon">{story.icon}</div>
          ) : (
            <img src={story.image || "/placeholder.svg"} alt={story.name} />
          )}
          <p className="story-name">{story.name}</p>
        </div>
      ))}
    </div>
  )
}
