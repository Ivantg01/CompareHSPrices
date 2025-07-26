import UserManagement from "../../islands/admin/UserManagement.tsx";

function Page() {
  return (
    <div>
      <main className="container mt-5">
        <div className="text-center">
          <h1 className="display-4">
            Gestión de Usuarios
          </h1>
          <div className="row justify-content-center mt-5">
            <UserManagement />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;
