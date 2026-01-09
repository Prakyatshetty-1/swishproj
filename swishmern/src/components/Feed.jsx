import StorySection from "./StorySection"
import Post from "./Post"

export default function Feed() {
  const storiesData = [
    { id: 1, name: "Add Story", icon: "➕" },
    { id: 2, name: "Campus Updates", image: "/campus-updates.jpg" },
    { id: 3, name: "Lab Updates", image: "/lab-updates.jpg" },
    { id: 4, name: "Design Thinking", image: "/design-thinking-concept.png" },
    { id: 5, name: "Events", image: "/diverse-group-celebrating.png" },
    { id: 6, name: "Robotics", image: "/futuristic-robotics-lab.png" },
    { id: 7, name: "Writing", image: "/writing-process.png" },
  ]

  const postData = {
    author: "prof.chen",
    authorRole: "FACULTY",
    timeAgo: "3 hours ago",
    authorImage: "https://vargiskhan.com/log/wp-content/uploads/2020/06/dalousie.jpg",
    postImage: "https://vargiskhan.com/log/wp-content/uploads/2020/06/dalousie.jpg",
  }

  return (
    <div className="feed">
      <StorySection stories={storiesData} />
      <Post {...postData} />
    </div>
  )
}
