import React from 'react';
import './Sliderbar.css';

import { SidebarData } from '../Data/Data';
import { UilSignOutAlt } from '@iconscout/react-unicons';

const Sliderbar = ({ onLogout, user, setView, activeSection }) => {

    const handleMenuItemClick = (section) => {
        setView(section);
    };

    return (
        <div className="sliderbar">
            <div className="logo">
                {user && <img src={user.avatarUrl} alt="Avatar del usuario"/>}
                <span>  
                    {user ? user.name : 'Administrador'}
                </span>
            </div>

            <div className="menu">
                {SidebarData.map((item, index) => {
                    // Normalizamos el nombre de la sección para usarlo como identificador
                    const sectionName = item.heading === 'Panel Inicio' 
                        ? 'dashboard' 
                        : item.heading.toLowerCase().replace(' ', '-');

                    return (
                        <div 
                            className={`menu-item ${activeSection === sectionName ? 'active' : ''}`}
                            key={index}
                            onClick={() => handleMenuItemClick(sectionName)}
                            role="button"
                            tabIndex="0"
                            aria-label={`Ir a ${item.heading}`}
                        >
                            <item.icon />
                            <span>
                                {item.heading}
                            </span>
                        </div>
                    );
                })}
                <div className="menu-item" onClick={onLogout} role="button" tabIndex="0" aria-label="Cerrar sesión">
                    <UilSignOutAlt />
                    <span>Salir</span> 
                </div>
            </div>
        </div>
    );
}

export default Sliderbar;