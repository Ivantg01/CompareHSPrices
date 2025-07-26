import { FunctionComponent } from "preact";

const CurrencyUpdateButton: FunctionComponent = () => {
  const handleUpdate = async () => {
    try {
      const response = await fetch("/api/currency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error updating currencies");
      }

      const data = await response.json();
      console.log("Currencies updated successfully:", data);
    } catch (error) {
      console.error("Failed to update currencies:", error);
    }
  };
  return (
    <button className="btn btn-outline-primary w-75" onClick={handleUpdate}>
      Actualizar ratios de cambio
    </button>
  );
};

export default CurrencyUpdateButton;
