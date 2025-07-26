import { FunctionComponent } from "preact";

interface HomeProps {
  username?: string;
}

const Home: FunctionComponent<HomeProps> = ({ username }) => {
  return (
    <>
      <main className="container mt-5">
        <div className="text-center">
          <h1 className="display-4">
            Bienvenido al Comparador
          </h1>
          <h1 className="display-4">
            de Precios de Hiperescaladores
          </h1>
          <p className="lead">
            Compara precios y características de los principales proveedores de
            servicios en la nube.
          </p>
          {!username && (
            <a href="/login/login" className="btn btn-primary btn-lg">
              Inicio de sesión
            </a>
          )}
        </div>
        {username && (
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Inicio</h5>
                  <p className="card-text">
                    Vuelve al inicio o cierra sesión en tu avatar en la parte
                    superior derecha.
                  </p>
                  <a href="/" className="btn btn-outline-primary">
                    Ir a Inicio
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Proyecto</h5>
                  <p className="card-text">
                    Descubre el proyecto donde está enmarcado este comparador de
                    precios.
                  </p>
                  <a href="/about" className="btn btn-outline-primary">
                    Ver Proyecto
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Contacto</h5>
                  <p className="card-text">
                    Contacto con el autor de la aplicación para más información
                    o para soporte.
                  </p>
                  <a href="/contact" className="btn btn-outline-primary">
                    Ir a Contacto
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Funcionamiento del menú Sidebar */}
        {username && (
          <div className="row mt-6 pt-5">
            <div className="col-12 text-center">
              <h4 className="fw-bold text-primary">
                <i className="bi bi-menu-button-wide me-2"></i>
                Cómo funciona el menú principal
              </h4>
              <p className="lead">
                Accede a todas las funcionalidades del comparador desde el menú
                lateral
              </p>
            </div>

            {/* Explicación visual */}
            <div className="row g-1">
              <div className="col-12 col-md-6 col-lg-3 text-center">
                <div className="p-3 border rounded h-100 d-flex flex-column align-items-center justify-content-center hover-shadow">
                  <i className="bi bi-folder-fill fs-1 text-info mb-2">
                  </i>
                  <h6>Precios Cloud</h6>
                  <p className="small mb-0">
                    Gestiona todos tus proyectos guardados
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3 text-center">
                <div className="p-3 border rounded h-100 d-flex flex-column align-items-center justify-content-center hover-shadow">
                  <i className="bi bi-cloud-fill fs-1 text-primary mb-2"></i>
                  <h6>Precios Cloud</h6>
                  <p className="small mb-0">
                    Compara costes de MVs, contenedores y bases de datos
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3 text-center">
                <div className="p-3 border rounded h-100 d-flex flex-column align-items-center justify-content-center hover-shadow">
                  <i className="bi bi-graph-up fs-1 text-warning mb-2"></i>
                  <h6>Indicadores</h6>
                  <p className="small mb-0">
                    Analiza evolución de precios y comparación entre regiones
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3 text-center">
                <div className="p-3 border rounded h-100 d-flex flex-column align-items-center justify-content-center hover-shadow">
                  <i className="bi bi-gear fs-1 text-success mb-2"></i>
                  <h6>Administración</h6>
                  <p className="small mb-0">
                    Gestiona usuarios, monedas y regiones (solo administradores)
                  </p>
                </div>
              </div>
            </div>
            {/* Nota sobre navegación */}
            <div className="alert alert-info mt-3 lh-smlh-sm">
              <div className="d-flex align-items-center mb-0">
                <i className="bi bi-info-circle fs-4 me-2"></i>
                <span className="fw-bold fs-5">Tips de navegación:</span>
              </div>
              <div className="p-2">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-chevron-down fs-5 me-2"></i>
                  <span>
                    Los menús desplegables (<i className="bi bi-chevron-down">
                    </i>) contienen opciones adicionales para cada categoría.
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-list fs-5 me-2"></i>
                  <span>
                    Puedes expandir o contraer el menú lateral pulsando este
                    icono situado en la parte superior del menú.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
