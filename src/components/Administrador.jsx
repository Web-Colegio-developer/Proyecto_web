import "./Administrador.css";
import Sliderbar from "./Sliderbar";
import Users from "./Users";
import Dashboard from "./Dashboard";
import UserStores from "./UserStores";
import Store from "./Store";

const ADMINISTRADOR = ({ onLogout, user, view, setView, users, setUsers, selectedUser, setSelectedUser }) => {

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <Dashboard />;
      case "usuarios":
        return <Users users={users} setUsers={setUsers} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />;
      case "sus-tiendas":
        return <UserStores user={user} />;
      default:
        return <div><h1>Dashboard</h1></div>; // O un componente Dashboard
    }
  };

  return (
    <div className="Administrador">
      <div className="sidebar">
        <Sliderbar onLogout={onLogout} user={user} setView={setView} activeSection={view} />
      </div>
      <div className="main-content">
        {renderView()}
      </div>
    </div>
  );
};

export default ADMINISTRADOR;
