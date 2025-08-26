import "./Administrador.css";
import Sliderbar from "./Sliderbar";


const ADMINISTRADOR = ({ onLogout, user }) => {
  return (
    <div className = "Administrador">
        <div className="Administrador-glass">
            <Sliderbar onLogout={onLogout} user={user}/>
            <div></div>
            <div></div>
            <div></div>
            
        </div>
    </div>
  );
}


export default ADMINISTRADOR;
