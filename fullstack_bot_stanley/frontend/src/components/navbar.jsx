import React, { useState } from 'react';
import { GrTasks } from 'react-icons/gr';
import { BsArrowLeftShort, BsSearch, BsPerson } from 'react-icons/bs';
import { GiPolarBear } from 'react-icons/gi';
import { RiDashboardFill } from 'react-icons/ri';
import { AiOutlineLogout } from 'react-icons/ai';
import { Link } from 'react-router-dom';    



const NavBar = () => {
    const [open, setOpen] = useState(true);
    const Menus = [
        { title: "Dashboard", icon: <RiDashboardFill/>, path: "/dashboard" },
        { title: "Tasks", icon: <GrTasks/>, path: "/tasks" },
        { title: "Profile", icon: <BsPerson/>, path: "/profile" },
        { title: "Logout", icon: <AiOutlineLogout/>, path: "/logout"},
      ];

    

    return (
        <div className={`bg-white border-r border-black h-screen p-5 pt-8 ${open ? "w-72" : "w-20"} duration-300 relative`}>
        <BsArrowLeftShort className={`bg-white text-dark-purple text-3xl rounded-full absolute -right-3 top-9 border border-dark-purple cursor-pointer ${!open && "rotate-180"}`} onClick={() => setOpen(!open)} />
          

       

        {/*Logo*/}
        <div className="inline-flex">
          <GiPolarBear className={`bg-amber-300 text-4xl rounded cursor-pointer block float-left mr-2 duration-500 ${open && "rotate-[360deg]"}`}/>
          <h1 className={`text-black origin-left font-medium text-2xl duration-300 ${!open && "scale-0"}`}>Stanley
          </h1>
        </div>

        {/*Arrow icon and search bar*/}
        <div className={`flex items-center border border-black rounded-md bg-white mt-6 ${!open ? "px-2.5" : "px-4"} py-2`}>
          <BsSearch className={`text-black text-lg block float-left cursor-pointer ${open && "mr-2"}`}/>
          <input type={"search"} placeholder="Search" className={`text-base bg-transparent w-full text-black placeholder-black focus:outline-none ${!open && "hidden"}`}/>
        </div>

        {/*Dynamically generating tabs in nav bar from Menus variable*/}
        <div>
          <ul className="pt-2">
            {Menus.map((menu, index) => (
              
              <li
              key={index}
              className={`text-black text-sm flex items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-md ${menu.spacing ? "mt-9" : "mt-2"}`}
          >
              <Link to={menu.path} className="flex items-center w-full">
                  <span className="text-2xl block float-left">
                      {menu.icon}
                  </span>
                  <span className={`text-base font-medium flex-1 duration-200 ${!open && "hidden"}`}>
                      {menu.title}
                  </span>
              </Link>
          </li>
              
            ))}
          </ul>
        </div>
      </div>
    );
};

export default NavBar;