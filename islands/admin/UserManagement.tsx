import { useEffect, useState } from "preact/hooks";
import { FunctionComponent } from "preact";
import { User } from "../../types.ts";

const UserManagement: FunctionComponent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<User> & { passwordConfirm?: string }
  >({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error reading users:", error);
      }
    };
    fetchUsers();
  }, []);

  const toggleActive = async (user: User) => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          username: user.username,
          active: !user.active,
        }),
      });
      if (response.ok) {
        setUsers((prev) =>
          prev.map((c) => c.id === user.id ? { ...c, active: !c.active } : c)
        );
      }
    } catch (err) {
      console.error("Error updating users:", err);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setEditForm({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
      active: user.active,
      password: "",
      passwordConfirm: "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userToDelete.id }),
      });
      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userToDelete.id));
      } else {
        alert("Error al eliminar el usuario");
      }
    } catch (error) {
      console.error(`Error deleting user ${userToDelete.id}:`, error);
    }
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (!userToEdit) return;
    try {
      const response = await fetch(`/api/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        // Actualiza el estado local con editForm, combinando los datos existentes
        setUsers(
          users.map((u) => u.id === userToEdit.id ? { ...u, ...editForm } : u),
        );
        setShowEditModal(false);
        setUserToEdit(null);
      } else {
        alert("Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (users.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center py-4">No hay usuarios registrados.</div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <div
        className="table-responsive"
        style={{ width: "95%", maxWidth: "1200px" }}
      >
        <table className="table table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th className="text-center">Usuario</th>
              <th className="text-center">Email</th>
              <th className="text-center">Nombre completo</th>
              <th className="text-center">Admin</th>
              <th className="text-center">Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="text-center align-middle">{user.username}</td>
                <td className="text-center align-middle">{user.email}</td>
                <td className="text-center align-middle">
                  {user.name} {user.surname}
                </td>
                <td className="text-center align-middle">
                  {user.role === "admin" && (
                    <i className="bi bi-check-circle-fill text-success"></i>
                  )}
                </td>
                <td className="text-center align-middle">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      user.active
                        ? "btn-outline-success"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => toggleActive(user)}
                  >
                    {user.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="text-center align-middle">
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="btn btn-sm btn-outline-primary rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Editar usuario"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(user)}
                      className="btn btn-sm btn-outline-danger rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Eliminar usuario"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Eliminación */}
      {showDeleteModal && userToDelete && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                >
                </button>
              </div>
              <div className="modal-body">
                ¿Estás seguro de eliminar al usuario {userToDelete.username}?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && userToEdit && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-start">
              <div className="modal-header">
                <h5 className="modal-title">Editar usuario</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                >
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body row gx-3">
                  <div className="mb-3 d-flex justify-content-between">
                    <div className="col">
                      <label className="form-label">Usuario</label>
                      <input
                        type="text"
                        className="form-control readonly-highlight"
                        value={userToEdit.username}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={editForm.active}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            active: e.currentTarget.checked,
                          })}
                      />
                      <label className="form-check-label">Activo</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          email: e.currentTarget.value,
                        })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          name: e.currentTarget.value,
                        })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.surname || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          surname: e.currentTarget.value,
                        })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      value={editForm.role || "user"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          role: e.currentTarget.value as "user" | "admin",
                        })}
                      required
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={editForm.password || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          password: e.currentTarget.value,
                        })}
                      minLength={6}
                    />
                    <div className="invalid-feedback">
                      La contraseña debe tener al menos 6 caracteres.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirmar contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={editForm.passwordConfirm || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          passwordConfirm: e.currentTarget.value,
                        })}
                      minLength={6}
                    />
                    {editForm.passwordConfirm &&
                      editForm.password !== editForm.passwordConfirm && (
                      <div className="text-danger small">
                        Las contraseñas no coinciden.
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={(editForm.password !== "" ||
                          editForm.passwordConfirm !== "") &&
                        (editForm.password !== undefined &&
                          editForm.password.length > 0 &&
                          editForm.password.length < 6) ||
                      (editForm.passwordConfirm !== undefined &&
                        editForm.passwordConfirm.length > 0 &&
                        editForm.passwordConfirm?.length < 6) ||
                      (editForm.password !== undefined &&
                        editForm.passwordConfirm !== undefined &&
                        editForm.password !== editForm.passwordConfirm)}
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
