import { useEffect, useState } from "preact/hooks";
import { FunctionComponent } from "preact";
import { JSX } from "preact";

const Register: FunctionComponent = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    surname: "",
    password: "",
    passwordConfirm: "",
  });
  // Estado para manejar alertas
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null,
  );

  // Función para obtener todos los mensajes de error en un array
  const getErrorMessages = () => {
    return Object.entries(errors)
      .filter(([key]) => key !== "general")
      .map(([, value]) => value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) {
      newErrors.username = "Nombre de usuario es requerido";
    }
    if (!formData.name.trim()) newErrors.name = "Nombre es requerido";
    if (!formData.surname.trim()) newErrors.surname = "Apellido es requerido";
    if (!emailRegex.test(formData.email)) newErrors.email = "Email inválido";
    if (formData.password.length < 2) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const usernameExists = async (username: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return data.error !== 1; //1 = username no existe
    } catch (e) {
      console.log("Username check error:", e);
      return true;
    }
  };

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    if (!validateForm()) return;
    e.currentTarget.submit();
  };

  // Manejar alertas al cargar la página
  useEffect(() => {
    const urlParams = new URLSearchParams(document.location.search);
    const error = urlParams.get("error");

    switch (error) {
      case "user_exists":
        setAlert({ type: "danger", message: "El usuario ya existe" });
        break;
      case "missing_fields":
        setAlert({
          type: "danger",
          message: "Todos los campos son obligatorios",
        });
        break;
      case "internal_error":
        setAlert({ type: "danger", message: "Error interno del servidor" });
        break;
    }

    // Limpiar parámetros de la URL
    globalThis.history.replaceState(
      {},
      document.title,
      document.location.pathname,
    );
  }, []);

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
        <div className="card shadow-lg" style={{ width: "28rem" }}>
          <div className="card-body">
            <h3 className="card-title text-center mb-4">Registro de usuario</h3>
            {errors.general && (
              <div className="alert alert-danger">{errors.general}</div>
            )}
            {alert && (
              <div className={`alert alert-${alert.type} mb-3`}>
                {alert.message}
              </div>
            )}
            <form
              method="post"
              action="/login/register"
              onSubmit={handleSubmit}
            >
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`form-control ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  placeholder="Ingrese su nombre de usuario"
                  value={formData.username}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      username: e.currentTarget.value,
                    })}
                  onBlur={async (e) => {
                    if (await usernameExists(e.currentTarget.value)) {
                      setErrors((prev) => ({
                        ...prev,
                        username: "El nombre de usuario ya existe",
                      }));
                    } else {
                      //eliminamos el posible error de la lista
                      setErrors((prev) => {
                        const { username, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  required
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Ingrese su nombre"
                  value={formData.name}
                  onInput={(e) =>
                    setFormData({ ...formData, name: e.currentTarget.value })}
                  required
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="surname" className="form-label">Apellido</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  className={`form-control ${
                    errors.surname ? "is-invalid" : ""
                  }`}
                  placeholder="Ingrese su apellido"
                  value={formData.surname}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      surname: e.currentTarget.value,
                    })}
                  required
                />
                {errors.surname && (
                  <div className="invalid-feedback">{errors.surname}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Ingrese su email"
                  value={formData.email}
                  onInput={(e) =>
                    setFormData({ ...formData, email: e.currentTarget.value })}
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="Ingrese su contraseña"
                  value={formData.password}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      password: e.currentTarget.value,
                    })}
                  required
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="passwordConfirm" className="form-label">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  className={`form-control ${
                    errors.passwordConfirm ? "is-invalid" : ""
                  }`}
                  placeholder="Repita su contraseña"
                  value={formData.passwordConfirm}
                  onInput={(e) =>
                    setFormData({
                      ...formData,
                      passwordConfirm: e.currentTarget.value,
                    })}
                  required
                />
                {errors.passwordConfirm && (
                  <div className="invalid-feedback">
                    {errors.passwordConfirm}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={!Object.values(formData).every(Boolean)}
              >
                Registrarse
              </button>

              {getErrorMessages().length > 0 && (
                <div className="alert alert-danger mt-3">
                  <h6 className="alert-heading mb-2">Corrige estos errores:</h6>
                  <ul className="mb-0">
                    {getErrorMessages().map((error, index) => (
                      <li key={index} className="small">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
            <div className="text-center">
              <a href="/login/login" className="text-decoration-none">
                ¿Ya tienes cuenta? Inicia sesión aquí
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
