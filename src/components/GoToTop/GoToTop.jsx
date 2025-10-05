// src/components/GoToTopButton/GoToTopButton.jsx
import React, {useState, useEffect} from "react";
import "./GoToTop.css"; // We will create this CSS file next
import {useNavigate} from "react-router-dom";

const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up a listener for the scroll event
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    // Clean up the listener when the component is unmounted
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    navigate("/");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="go-to-top">
      <button onClick={scrollToTop} className={`top-btn ${isVisible ? "visible" : ""}`} title="Go to top">
        {/* You can use an SVG icon here for better visuals */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
};

export default GoToTop;
