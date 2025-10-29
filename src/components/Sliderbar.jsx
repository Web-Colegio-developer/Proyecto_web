import "./Sliderbar.css"

import { SidebarData } from "../Data/Data"
import { UilSignOutAlt } from "@iconscout/react-unicons"

const Sliderbar = ({ onLogout, user, setView, activeSection }) => {
  const handleMenuItemClick = (section) => {
    setView(section)
  }

  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      callback()
    }
  }

  return (
    <div className="sliderbar">
      <div className="logo">
        {user && (
          <div className="avatar-wrapper">
            <img src={user.avatarUrl || "/placeholder.svg"} alt="Avatar del usuario" />
          </div>
        )}
        <span className="user-name">{user ? user.name : "Administrador"}</span>
      </div>

      <div className="menu">
        {SidebarData.map((item, index) => {
          const sectionName =
            item.heading === "Panel Inicio" ? "dashboard" : item.heading.toLowerCase().replace(" ", "-")

          return (
            <div
              className={`menu-item ${activeSection === sectionName ? "active" : ""}`}
              key={index}
              onClick={() => handleMenuItemClick(sectionName)}
              onKeyPress={(e) => handleKeyPress(e, () => handleMenuItemClick(sectionName))}
              role="button"
              tabIndex="0"
              aria-label={`Ir a ${item.heading}`}
              aria-current={activeSection === sectionName ? "page" : undefined}
            >
              <span className="menu-icon">
                <item.icon />
              </span>
              <span className="menu-text">{item.heading}</span>
            </div>
          )
        })}
        <div
          className="menu-item menu-item-logout"
          onClick={onLogout}
          onKeyPress={(e) => handleKeyPress(e, onLogout)}
          role="button"
          tabIndex="0"
          aria-label="Cerrar sesión"
        >
          <span className="menu-icon">
            <UilSignOutAlt />
          </span>
          <span className="menu-text">Salir</span>
        </div>
      </div>
    </div>
  )
}

export default Sliderbar
