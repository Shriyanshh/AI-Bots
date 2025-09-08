import React from 'react';
import { FaUser } from "react-icons/fa";

const ProfilePage = () => (
    <div className="flex justify-center items-center bg-light-white">
        <div className="w-96 mt-60 p-6 shadow-lg bg-white rounded-md border border-black">
            
            <h1 className="text-3xl block text-center font-semibold"><FaUser className="inline-block align-middle"/>Login</h1>
            
            
            <hr className="mt-3"/>
            <div className="mt-3">
                <label for="username" className="block text-base mb-2">Username</label>
                <input type="text" id="username" className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600" placeholder="Enter Username..."></input>
            </div>
            <div className="mt-3">
                <label for="password" className="block text-base mb-2">Password</label>
                <input type="password" id="password" className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600" placeholder="Enter Password..."></input>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center">
                  <input type="checkbox" className="mr-1"/>
                  <label>Remember Me</label>
              </div>
              <div>
                <a href="#" className="text-indigo-800 font-semibold">Forgot Password?</a>
              </div>
            </div>
            <div className="mt-5">
              <button type="submit" className="border-2 border-indigo-700 bg-indigo-700 text-white py-1 w-full rounded-md hover:bg-transparent hover:text-indigo-700 font-semibold">Login</button>
            </div>
        </div>
    </div>
);

export default ProfilePage;