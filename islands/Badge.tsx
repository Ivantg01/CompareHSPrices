// islands/Badge.tsx

import { JSX } from "preact";

interface BadgeProps {
  username: string;
}

export default function Badge({ username }: BadgeProps) {
  const handleLogout = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(`Logout activado ${username}!`);
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = "/login";
  };

  const badgeName = username.charAt(0).toUpperCase();

  //coureui dropdown
  return (
    <div className="dropstart position-relative">
      {/* Contenedor principal */}
      <button
        className="btn btn-outline-primary border-3 rounded-circle p-1" // Borde grueso
        type="button"
        id="userBadge"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{
          width: "40px",
          height: "40px",
          zIndex: 1000, // Asegura que el botón esté por encima
        }}
      >
        <span className="fw-bold">{badgeName}</span>
      </button>

      <ul
        className="dropdown-menu dropdown-menu-start" // Alineación izquierda
        aria-labelledby="userBadge"
        style={{
          position: "absolute",
          inset: "auto auto 0px 0px", // Posicionamiento preciso
          margin: 0,
          transform: "translate(-110%, 100px)", // Ajuste de posición
          zIndex: 1001, // Mayor que el botón
          minWidth: "120px",
        }}
      >
        <li>
          <div className="dropdown-item text-uppercase fw-bold">
            {username}
          </div>
        </li>
        <li>
          <li>
            <hr className="dropdown-divider" />
          </li>
        </li>
        <li>
          <button
            type="button"
            className="dropdown-item"
            onClick={() => alert("Perfil del usuario")}
          >
            <i className="bi bi-person me-2"></i>Perfil
          </button>
        </li>
        <li>
          <button
            type="button"
            className="dropdown-item"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>Salir
          </button>
        </li>
      </ul>
    </div>
  );
}
