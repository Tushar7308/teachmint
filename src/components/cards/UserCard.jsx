import React, { useState, useEffect, useRef } from "react";
import UserProfile from "../UserProfile";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const UserCard = ({ user, isSelected, onClick }) => (
  <Link to={`/userProfile/${user.id}`}>
    <li
      className={`flex justify-between flex-1 p-2 border border-black rounded-lg ${
        isSelected ? "bg-gray-200" : ""
      }`}
      onClick={onClick}
    >
      <p className="font-semibold">Name: {user.name}</p>
      <p className="flex">Post Count: {user.postCount || 0}</p>
    </li>
  </Link>
);

const UserDirectory = () => {
  const [userData, setUserData] = useState([]);
  const [postCounts, setPostCounts] = useState({});
  const [userBlogs, setBlogs] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const userDirectoryRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user data
      const userResponse = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      const userData = await userResponse.json();

      // Fetch post data
      const postResponse = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );
      const posts = await postResponse.json();

      // Calculate post counts for each user
      const counts = {};
      const userBlogs = {};

      posts.forEach((post) => {
        counts[post.userId] = (counts[post.userId] || 0) + 1;
        userBlogs[post.userId] = userBlogs[post.userId] || [];
        userBlogs[post.userId].push(post);
      });

      setUserData(
        userData.map((user) => ({
          ...user,
          postCount: counts[user.id] || 0,
        }))
      );
      setPostCounts(counts);
      setBlogs(userBlogs);
    };

    fetchData();
  }, []);

  const handleUserClick = (userId) => {
    setSelectedUserId((prevSelectedUserId) =>
      prevSelectedUserId === userId ? null : userId
    );
  };

  const handleClickOutside = (event) => {
    if (
      userDirectoryRef.current &&
      !userDirectoryRef.current.contains(event.target)
    ) {
      // Clicked outside of the user directory, deselect user
      setSelectedUserId(null);
    }
  };

  useEffect(() => {
    // Attach click event listener to handle clicks outside of the user directory
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={userDirectoryRef}>
      <h1 className="text-center">Directory</h1>
      <Routes>
        <Route
          path="/"
          element={
            <ul className="flex flex-col flex-wrap my-6 mx-4 rounded-lg gap-4">
              {userData.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isSelected={selectedUserId === user.id}
                  onClick={() => handleUserClick(user.id)}
                />
              ))}
            </ul>
          }
        />
        <Route
          path="/userProfile/:userId"
          element={
            <UserProfile
              userData={userData}
              postCounts={postCounts}
              userBlogs={userBlogs}
              selectedUserId={selectedUserId}
            />
          }
        />
      </Routes>
      <hr />
    </div>
  );
};

export default UserDirectory;
