import React from "react";
import "./Loading.css";

const Loading = ({size = "medium", message = "Loading..."}) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default Loading;
