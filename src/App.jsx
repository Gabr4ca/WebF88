import React, {useEffect, useState} from "react";
import Navbar from "./components/Navbar/Navbar";
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import GoToTopButton from "./components/GoToTop/GoToTop";
import UserProfile from "./components/UserProfile/UserProfile";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

const App = () => {
  // const [data, setData] = useState([]);
  // useEffect(() => {
  //   fetch("http://localhost:3001/taikhoan")
  //     .then((res) => res.json())
  //     .then((data) => setData(data))
  //     .catch((err) => console.log(err));
  // }, []);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* <div>
        <table>
          <thead>
            <th>username</th>
            <th>password</th>
            <th>name</th>
            <th>address</th>
            <th>phone</th>
            <th>email</th>
            <th>status</th>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.username}</td>
                <td>{d.password}</td>
                <td>{d.name}</td>
                <td>{d.address}</td>
                <td>{d.phone}</td>
                <td>{d.email}</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <ErrorBoundary>
          <Navbar setShowLogin={setShowLogin} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/myorders" element={<UserProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </ErrorBoundary>
      </div>
      <Footer />
      <GoToTopButton />
    </>
  );
};

export default App;
