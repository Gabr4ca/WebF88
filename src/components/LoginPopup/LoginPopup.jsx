import React, {useState, useContext} from "react";
import "./LoginPopup.css";
import {assets} from "../../assets/assets";
import {StoreContext} from "../../context/StoreContext";

const LoginPopup = ({setShowLogin}) => {
  const {login, register, loading} = useContext(StoreContext);
  const [currState, setCurrState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (currState === "Sign Up" && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let result;

      if (currState === "Sign Up") {
        result = await register(formData);
      } else {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      }

      if (result.success) {
        setShowLogin(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
        });
        setAgreedToTerms(false);
        setErrors({});
      } else {
        setErrors({general: result.error});
      }
    } catch (error) {
      setErrors({general: "An unexpected error occurred"});
    }
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>

        {errors.general && <div className="error-message general-error">{errors.general}</div>}

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "error" : ""}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {currState === "Sign Up" && (
            <div className="input-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : currState === "Sign Up" ? "Create Account" : "Sign In"}
        </button>

        <div className="login-popup-condition">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            required
          />
          <p style={{marginTop: "4px"}}>I agree to the terms and conditions.</p>
          {errors.terms && <span className="error-text">{errors.terms}</span>}
        </div>

        {currState === "Login" ? (
          <p>
            Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
