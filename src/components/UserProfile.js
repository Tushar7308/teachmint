import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function UserProfile({ userData, postCounts, userBlogs }) {
  const [country, setCountry] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [conti, setConti] = useState([]);
  const [countryTime, setCountryTime] = useState();
  const [isStart, setisStart] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch country data
        const countryResponse = await fetch(
          "http://worldtimeapi.org/api/timezone"
        );
        const countryData = await countryResponse.json();
        setConti(countryData);
        const countries = countryData.map((timezone) => timezone.split("/")[1]); // Use [1] to get the country
        setCountry(countries);
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTime = async () => {
      if (!selectedCountry) return;

      try {
        const timeResponse = await fetch(
          `http://worldtimeapi.org/api/timezone/${selectedCountry}`
        );
        const timeData = await timeResponse.json();

        // Log the timeData object to the console
        // console.log("Time Data:", timeData);

        // Check if the API response contains the correct property for the UTC datetime
        const utcDatetime = timeData.utc_datetime || timeData.utc_offset;

        // Set the current time
        setCurrentTime(utcDatetime || "");
      } catch (error) {
        console.error("Error fetching time data:", error);
      }
    };
    // Call fetchTime immediately to get the initial time
    fetchTime();

    // Set up interval to call fetchTime every second
    const intervalId = setInterval(fetchTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const { userId } = useParams();
  const navigate = useNavigate();

  const user = userData.find((user) => user.id === parseInt(userId));

  const currentData = conti.find((item) => {
    return item.includes(selectedCountry);
  });
  useEffect(() => {
    const updateTime = () => {
      const getExistingTime = JSON.parse(localStorage.getItem(selectedCountry));

      if (getExistingTime) {
        const [hour, minute, second] = getExistingTime.split(":").map(Number);
        console.log({second , getExistingTime})
        // Increment the seconds
        const newSecond = (+second + 1) % 60;
        // Update minutes and hours if needed
        const newMinute = newSecond === 0 ? (+minute + 1) % 60 : +minute;
        const newHour =
          newMinute === 0 && newSecond === 0 ? (+hour + 1) % 24 : +hour;

        console.log({ newSecond, newMinute, newHour });
        // Format the new time string
        const newTimeString = `${newHour}:${String(newMinute).padStart(
          2,
          "0"
        )}:${String(newSecond).padStart(2, "0")}`;
        console.log(newTimeString);
        localStorage.setItem(currentData, JSON.stringify(newTimeString));
        setCountryTime(newTimeString);
        return ;
      }
      let date = new Date();
      const timeString = date.toLocaleTimeString("en-US", {
        timeZone: selectedCountry,
        hour12:false
      });
      localStorage.setItem(currentData, JSON.stringify(timeString));
      setCountryTime(timeString);
    };

    if (selectedCountry) {
      updateTime();
    }

    const interval = setInterval(() => {
      if (selectedCountry) {
        updateTime();
      }
    }, 1000);

    if (!isStart) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [selectedCountry, isStart]);

  if (!user) {
    return <div>User not found</div>;
  }

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={goBack}
          className="text-white flex-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          Back
        </button>

        <select
          className="flex-1"
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
          }}
        >
          <option key="" value="">
            Country Dropdown
          </option>
          {conti.map(
            (timezone) =>
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
          )}
        </select>

        <div className="border border-black flex-1">{countryTime}</div>
        <div className="border border-black flex-1">
          <button
            className="flex-2"
            onClick={() => {
              setisStart((pre) => !pre);
            }}
          >
            Pause/Start
          </button>
        </div>
      </div>
      <h1 className="text-3xl w-1/3 font-bold mb-4 mx-6">Profile Page</h1>
      <div className="font-wrap flex-block w-1/2 px-2 py-1 mx-6 gap-4 border border-black rounded-md ">
        <p>
          <span className="font-bold">Name:</span> {user.name}
        </p>
        <p>
          <span className="font-bold">Username:</span> {user.username}
        </p>
        <p>
          <span className="font-bold">Address:</span> {user.address.street},{" "}
          {user.address.city}
        </p>
        <p>
          <span className="font-bold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-bold">Catch Phrase:</span>{" "}
          {user.company.catchPhrase}
        </p>
      </div>
      <div className="flex mx-2 rounded-md ">
        <ul className="my-4 flex flex-wrap px-4 gap-4">
          {userBlogs[user.id] &&
            userBlogs[user.id].map((post) => (
              <li
                className="flex border border-black mb-4 gap-2 rounded-xs px-2 py-2 max-w-[20rem]"
                key={post.id}
              >
                <div className="flex flex-col mb-4 mx-2 ">
                  <p className="flex text-lg font-semibold">{post.title}</p>
                  <p className="flex text-gray-600">{post.body}</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
