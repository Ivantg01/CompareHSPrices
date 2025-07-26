import RegionManagement from "../../islands/admin/RegionManagement.tsx";
import RegionSelectButtons from "../../islands/admin/RegionSelectButtons.tsx";
import { signal } from "@preact/signals";

function Page() {
  const cloudRegion = signal<string>("AWS");

  return (
    <div>
      <main className="container mt-5">
        <div className="text-center">
          <h1 className="display-4">
            Gestión de Regiones Cloud
          </h1>
          <p className="lead">
            Puede acceder a las regiones de cada hiperescalador pulsando en su
            icono.
          </p>
          <RegionSelectButtons cloudRegion={cloudRegion} />
          <div className="row justify-content-center mt-2">
            <RegionManagement cloudRegion={cloudRegion} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;
