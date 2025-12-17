import React, {useContext, useEffect, useState} from "react";
import "./Users.css";
import axios from "axios";
import {toast} from "react-toastify";
import {StoreContext} from "../../context/StoreContext";
import {useNavigate} from "react-router-dom";

const Users = ({url}) => {
  const navigate = useNavigate();
  const {token, admin} = useContext(StoreContext);
  const [users, setUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editedUsers, setEditedUsers] = useState({});

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}/api/user/list`, {
        headers: {token},
      });
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        toast.error("Error fetching users");
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: {...prev[userId], role: newRole},
    }));
  };

  const handleStatusChange = (userId, newStatus) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: {...prev[userId], status: newStatus},
    }));
  };

  const saveChanges = async (userId) => {
    const changes = editedUsers[userId];
    if (!changes) return;

    try {
      // Update role if changed
      if (changes.role !== undefined) {
        const roleResponse = await axios.post(
          `${url}/api/user/update-role`,
          {targetUserId: userId, role: changes.role},
          {headers: {token}}
        );
        if (!roleResponse.data.success) {
          toast.error("Error updating role");
          return;
        }
      }

      // Update status if changed
      if (changes.status !== undefined) {
        const statusResponse = await axios.post(
          `${url}/api/user/update-status`,
          {targetUserId: userId, status: changes.status},
          {headers: {token}}
        );
        if (!statusResponse.data.success) {
          toast.error("Error updating status");
          return;
        }
      }

      toast.success("User updated successfully");

      // Clear edited state for this user
      setEditedUsers((prev) => {
        const newState = {...prev};
        delete newState[userId];
        return newState;
      });

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      toast.error("Error updating user");
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await axios.post(`${url}/api/user/delete`, {targetUserId: userToDelete._id}, {headers: {token}});

      if (response.data.success) {
        toast.success("User deleted successfully");
        await fetchUsers();
      } else {
        toast.error("Error deleting user");
      }
    } catch (error) {
      toast.error("Error deleting user");
    }

    setShowConfirm(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    } else {
      fetchUsers();
    }
  }, []);

  const hasChanges = (userId) => {
    return editedUsers[userId] !== undefined;
  };

  const getCurrentRole = (user) => {
    return editedUsers[user._id]?.role ?? user.role;
  };

  const getCurrentStatus = (user) => {
    return editedUsers[user._id]?.status ?? user.status;
  };

  return (
    <div className="users">
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button onClick={confirmDelete} className="btn-yes">
                Yes
              </button>
              <button onClick={cancelDelete} className="btn-no">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <h3>User Management</h3>
      <div className="users-table">
        <div className="users-table-header">
          <b>#</b>
          <b>Name</b>
          <b>Email</b>
          <b>Role</b>
          <b>Status</b>
          <b>Actions</b>
        </div>
        {users.map((user, index) => (
          <div key={user._id} className="users-table-row">
            <p>{index + 1}</p>
            <p>{user.name}</p>
            <p>{user.email}</p>
            <select
              className="user-role-select"
              value={getCurrentRole(user)}
              onChange={(e) => handleRoleChange(user._id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="user-status-select"
              value={getCurrentStatus(user)}
              onChange={(e) => handleStatusChange(user._id, e.target.value)}
            >
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
            <div className="users-actions">
              <button className="btn-save" onClick={() => saveChanges(user._id)} disabled={!hasChanges(user._id)}>
                Save
              </button>
              <button className="btn-delete" onClick={() => handleDeleteClick(user)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
