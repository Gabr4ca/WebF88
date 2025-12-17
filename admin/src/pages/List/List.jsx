import React, {useEffect, useState} from "react";
import "./List.css";
import axios from "axios";
import {toast} from "react-toastify";
import {useContext} from "react";
import {StoreContext} from "../../context/StoreContext";
import {useNavigate} from "react-router-dom";

const List = ({url}) => {
  const navigate = useNavigate();
  const {token, admin} = useContext(StoreContext);
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list-all`, {
      headers: {token},
    });
    if (response.data.success) {
      setList(response.data.data);
    } else {
      toast.error("Error");
    }
  };

  const toggleFood = async (foodId) => {
    const response = await axios.post(`${url}/api/food/toggle`, {id: foodId}, {headers: {token}});
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error("Error");
    }
  };
  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    }
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Food List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={index} className={`list-table-format ${item.isDeleted ? "hidden-item" : ""}`}>
              <img src={`${url}/images/` + item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              <button
                onClick={() => toggleFood(item._id)}
                className={`toggle-btn ${item.isDeleted ? "show-btn" : "hide-btn"}`}
              >
                {item.isDeleted ? "Show" : "Hide"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;
