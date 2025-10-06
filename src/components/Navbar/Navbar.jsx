import React, {useContext, useEffect, useState} from "react";
import "./Navbar.css";
import {assets} from "../../assets/assets";
import {Link, useNavigate} from "react-router-dom";
import {StoreContext} from "../../context/StoreContext";

const Navbar = ({setShowLogin}) => {
  const [menu, setMenu] = useState("home");
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const {getTotalCartAmount, token, user, logout} = useContext(StoreContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleMouseMove = (event) => {
      if (event.clientY < 100) {
        setIsNavbarVisible(true);
      } else if (isAtTop) {
        setIsNavbarVisible(true);
      } else {
        setIsNavbarVisible(false);
      }
    };

    const handleScroll = () => {
      if (window.scrollY < 50) {
        setIsAtTop(true);
      } else {
        setIsAtTop(false);
      }

      if (window.scrollY > lastScrollY) {
        // Scrolling down
        setIsNavbarVisible(false);
      } else {
        // Scrolling up
        setIsNavbarVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAtTop]);

  return (
    <div className={`navbar ${isNavbarVisible ? "visible" : "hidden"}`}>
      <Link to="/">
        <img src={assets.logo} className="logo" alt=""></img>
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => {
            setMenu("home");
            window.scrollTo({top: 0, behavior: "smooth"});
          }}
          className={menu === "home" ? "active" : ""}
        >
          Trang Chủ
        </Link>
        <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
          Thực Đơn
        </a>
        <a href="#app-download" onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>
          Ứng Dụng
        </a>
        <a href="#footer" onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>
          Liên Hệ
        </a>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className="navbar-profile">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="profile-avatar" />
            ) : (
              <img src={assets.profile_icon} alt="Profile" />
            )}
            <div className="navbar-profile-name">Hi, {user?.name || "User"}</div>
            <div className="navbar-profile-dropdown">
              <li onClick={() => navigate("/profile")}>
                <img src={assets.profile_icon} alt="" />
                <p>Profile</p>
              </li>
              <hr />
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" />
                <p>Orders</p>
              </li>
              {user?.email?.includes("admin") && (
                <>
                  <hr />
                  <li onClick={() => navigate("/admin")}>
                    <img src={assets.profile_icon} alt="" />
                    <p>Admin Panel</p>
                  </li>
                </>
              )}
              <hr />
              <li onClick={handleLogout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
