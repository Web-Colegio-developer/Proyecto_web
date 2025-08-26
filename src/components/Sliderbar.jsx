import React from 'react';
import './Sliderbar.css';

import { SidebarData } from '../Data/Data';
import { UilSignOutAlt } from '@iconscout/react-unicons';

const Sliderbar = ({ onLogout, user }) => {

        const [selected, setSelected] = React.useState(0);

    return (
        <div className="sliderbar">
            {/*  Logo */}
            <div className="logo">
                {user && <img src={user.avatarUrl} alt=""/>}
                <span>  
                    {user ? user.name : 'Administrador'}
                </span>
            </div>

            {/*  Menu */}
            <div className="menu">
                    {SidebarData.map((item, index) => {
                        return (
                            <div className={selected===index? 'menu-item active': 'menu-item'} 
                            key={index}
                            onClick={()=>setSelected(index)}
                            >
                                <item.icon />
                                <span>
                                    {item.heading}
                                </span>
                            </div>
                        );
                    })}
                <div className="menu-item" onClick={onLogout}>
                    <UilSignOutAlt />
                </div>
            </div>
        </div>
    );
}

export default Sliderbar;