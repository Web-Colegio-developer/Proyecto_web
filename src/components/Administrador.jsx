import "./Administrador.css";
import Sliderbar from "./Sliderbar";


const ADMINISTRADOR = ({ onLogout }) => {
  return (
    <div className = "Administrador">
        <div className="Administrador-glass">
            <Sliderbar onLogout={onLogout}/>
            <div></div>
            <div></div>
            <div></div>
            
        </div>
    </div>
  );
}


export default ADMINISTRADOR;