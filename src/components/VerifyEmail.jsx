import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const getBackendURL = () => {
  const envURL = import.meta.env.VITE_BACKEND_URL;
  if (envURL) return envURL;
  if (window.location.hostname === "localhost") return "http://localhost:3001";
  return "https://proyecto-web-gufr.onrender.com";
};

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (!token) {
      toast.error("Token no encontrado");
      return;
    }

    fetch(`${getBackendURL()}/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success("Correo verificado correctamente. Ahora puedes iniciar sesión.");
          navigate("/login");
        } else {
          toast.error(data.message);
        }
      })
      .catch(err => toast.error("Error en la conexión: " + err.message));
  }, [location, navigate]);

  return <div>Verificando correo...</div>;
};

export default VerifyEmail;
