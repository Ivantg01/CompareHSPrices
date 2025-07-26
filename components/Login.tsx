import { FunctionComponent } from "preact";

export interface LoginProps {
  username?: string;
}

const Login: FunctionComponent<LoginProps> = ({ username }) => {
  return (
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
      </div>
      <div className="container d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow-lg" style={{ width: "25rem" }}>
          <div className="card-body">
            <h3 className="card-title text-center mb-4">Inicio de sesión</h3>
            {username && (
              <div
                class="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                Iniciando sesión como {username}
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                >
                </button>
              </div>
            )}
            <form method="post">
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  placeholder="Ingrese su usuario"
                  value={username}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Ingrese su contraseña"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Entrar
              </button>
            </form>
            <div className="text-center mt-3">
              <a href="/login/register" className="text-decoration-none">
                ¿No tienes cuenta? Regístrate aquí
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
