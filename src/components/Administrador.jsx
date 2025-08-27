import "./Administrador.css";
import Sliderbar from "./Sliderbar";
import Users from "./Users";

const ADMINISTRADOR = ({ onLogout, user, view, setView, users, setUsers, selectedUser, setSelectedUser }) => {

  const renderView = () => {
    switch (view) {
      case "usuarios":
        return <Users users={users} setUsers={setUsers} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />;
      // case 'products':
      //   return <Products />;
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
