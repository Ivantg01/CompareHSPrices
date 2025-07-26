import CurrencyManagement from "../../islands/admin/CurrencyManagement.tsx";
import CurrencyUpdateButton from "../../islands/admin/CurrencyUpdateButton.tsx";

function Page() {
  return (
    <div>
      <main className="container mt-5">
        <div className="text-center">
          <h1 className="display-4">
            Gestión de Ratios de cambio
          </h1>
          <p className="lead">
            Puede actualizar las tasas de cambio respecto al{" "}
            <strong>USD</strong> pulsando el botón actualizar.
          </p>
          <div className="row justify-content-center mt-2">
            <CurrencyUpdateButton />
          </div>
          <div className="row justify-content-center mt-2">
            <CurrencyManagement />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;
