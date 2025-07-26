import { useState } from "preact/hooks";
import { FunctionComponent } from "preact";
import { isMenuExpanded } from "../utils/signals.ts";

interface SidebarProps {
  username: string;
  isAdmin: boolean;
}

const Sidebar: FunctionComponent<SidebarProps> = (
  { username, isAdmin },
) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const sidebarClass = isMenuExpanded.value
    ? "sidebar bg-dark vh-100 d-flex flex-column align-items-start p-3"
    : "sidebar bg-dark vh-100 d-flex flex-column align-items-center p-3 sidebar-collapsed";

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  //crea una función para manejar el clic en el botón de expansión
  const handleOnClickExpanded = () => {
    isMenuExpanded.value = !isMenuExpanded.value;
  };

  return (
    <div
      className={`${sidebarClass} sidebar-dark`}
      style={{
        width: isMenuExpanded.value ? "250px" : "60px",
        transition: "width 0.3s",
        gridColumn: "1 / 2",
      }}
    >
      <div
        className="sidebar-brand d-flex align-items-center justify-content-center"
        style={{ height: "50px" }}
      >
        <button
          type="button"
          className="sidebar-brand-icon btn btn-link text-white mb-4 p-0"
          onClick={() => handleOnClickExpanded()}
        >
          <i className="bi bi-list fs-3"></i>
        </button>
        {isMenuExpanded.value && (
          <div className="text-white mb-4">
            <a className="navbar-brand fs-4 me-2" href="/menu">&nbsp; CPHS</a>
          </div>
        )}
      </div>

      {/* Menú principal */}
      <nav className="sidebar-nav">
        <ul className="nav flex-column nav-no-padding-x">
          {/* Bloque 0 - Home */}
          <li className="nav-item">
            <a className="nav-link text-white" href="/menu">
              <i className="bi bi-house-fill fs-3 me-3"></i>
              {isMenuExpanded.value && "Inicio"}
            </a>
          </li>

          {/* Bloque 1 - Proyectos */}
          <li className="nav-item">
            <a className="nav-link text-white" href="/app/project">
              <i className="bi bi-folder-fill fs-3 me-3"></i>
              {isMenuExpanded.value && "Proyectos"}
            </a>
          </li>

          {/* Bloque 2 - Comparador (dropdown) */}
          <li className="nav-item">
            <button
              className="nav-link text-white d-flex justify-content-between align-items-center"
              onClick={() => toggleDropdown("price")}
            >
              <span>
                <i className="bi bi-cloud-fill fs-3 me-3"></i>
                {isMenuExpanded.value && "Precios Cloud"}
              </span>
              <i
                className={`bi bi-chevron-${
                  openDropdown === "price" ? "up" : "down"
                }`}
              >
              </i>
            </button>
            {openDropdown === "price" && (
              <div>
                <div className="row">
                  <div className="col">
                    <a className="nav-link text-white" href="/app/infra">
                      <i className="bi bi-hdd-network-fill fs-3 ms-3 me-3"></i>
                      {isMenuExpanded.value && "Máquinas virtuales"}
                    </a>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <a className="nav-link text-white" href="/app/container">
                      <i className="bi bi-grid-3x3-gap-fill fs fs-3 ms-3 me-3">
                      </i>
                      {isMenuExpanded.value && "Contenedores"}
                    </a>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <a className="nav-link text-white" href="/app/database">
                      <i className="bi bi-server fs-3 ms-3 me-3"></i>
                      {isMenuExpanded.value && "Base de datos"}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Bloque 3 - Historico (dropdown) */}
          <li className="nav-item">
            <button
              className="nav-link text-white d-flex justify-content-between align-items-center"
              onClick={() => toggleDropdown("stats")}
            >
              <span>
                <i className="bi bi-graph-up fs-3 me-3"></i>
                {isMenuExpanded.value && "Indicadores"}
              </span>
              <i
                className={`bi bi-chevron-${
                  openDropdown === "stats" ? "up" : "down"
                }`}
              >
              </i>
            </button>
            {openDropdown === "stats" && (
              <div>
                <div className="row">
                  <div className="col">
                    <a className="nav-link text-white" href="/app/statsInfra">
                      <i className="bi bi-bar-chart-line-fill fs-3 ms-3 me-3">
                      </i>
                      {isMenuExpanded.value && "Evolución"}
                    </a>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <a className="nav-link text-white" href="/app/statsInfra">
                      <i className="bi bi-stack fs fs-3 ms-3 me-3">
                      </i>
                      {isMenuExpanded.value && "Instancias"}
                    </a>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <a className="nav-link text-white" href="/app/statsRegion">
                      <i className="bi bi-geo-alt-fill fs-3 ms-3 me-3">
                      </i>
                      {isMenuExpanded.value && "Regiones"}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Bloque 4 - Administración (dropdown) */}
          {isAdmin && (
            <li className="nav-item">
              <button
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => toggleDropdown("admin")}
              >
                <span>
                  <i className="bi bi-gear fs-3 me-3"></i>
                  {isMenuExpanded.value && "Administración"}
                </span>
                <i
                  className={`bi bi-chevron-${
                    openDropdown === "admin" ? "up" : "down"
                  }`}
                >
                </i>
              </button>
              {openDropdown === "admin" && (
                <div>
                  <div className="row">
                    <div className="col">
                      <a
                        className="nav-link text-white"
                        href="/admin/userManagement"
                      >
                        <i className="bi bi-people fs-3 ms-3 me-3"></i>
                        {isMenuExpanded.value && "Usuarios"}
                      </a>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <a
                        className="nav-link text-white"
                        href="/admin/currencyManagement"
                      >
                        <i className="bi bi-cash-coin fs-3 ms-3 me-3">
                        </i>
                        {isMenuExpanded.value && "Monedas"}
                      </a>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <a
                        className="nav-link text-white"
                        href="/admin/regionManagement"
                      >
                        <i className="bi bi-globe fs-3 ms-3 me-3"></i>
                        {isMenuExpanded.value && "Regiones"}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
