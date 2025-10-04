import React, { useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'

const LoginPopup = ({setShowLogin}) => {

  const [currState,setCurrState] = useState("Đăng ký")

  return (
    <div className='login-popup'>
      <form className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>
        <div className="login-popup-inputs">
          {currState==="Login"?<></>:<input type="text" placeholder='Tên' required />}
          <input type="text" placeholder='Email' required />
          <input type="password" placeholder='Mật khẩu' required />
        </div>
        <button>{currState==="Sign Up"?"Tạo tài khoản":"Đăng nhập"}</button>
        <div className="login-popup-condition">
          <input type="checkbox" required/>
          <p style={{marginTop: "4px"}}>Tôi đồng ý với mọi điều khoản.</p>
        </div>
        {currState==="Login"
          ?<p>Tạo tài khoản mới? <span onClick={()=> setCurrState("Sign Up")}>Nhấn vào đây</span></p>
          :<p>Đã có tài khoản? <span onClick={()=> setCurrState("Login")}>Đăng nhập tại đây</span></p>
        }
        
        
      </form>
    </div>
  )
}

export default LoginPopup
