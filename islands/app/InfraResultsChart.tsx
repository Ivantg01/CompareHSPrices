import { useEffect, useRef } from "preact/hooks";
import { Chart } from "https://esm.sh/stable/chart.js@4.4.0/auto?target=es2022";
import { InfraInstancePrice } from "../../types.ts";

interface InfraPriceChartProps {
  instances: {
    aws: InfraInstancePrice[];
    azr: InfraInstancePrice[];
    gcp: InfraInstancePrice[];
    oci: InfraInstancePrice[];
  };
  currency: string;
}

const InfraPriceChart = ({ instances, currency }: InfraPriceChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const providers = ["AWS", "AZR", "GCP", "OCI"];
    const colors: Record<string, string> = {
      AWS: "#FF9900",
      AZR: "#007BFF",
      GCP: "#34A853",
      OCI: "#E57373",
    };

    // Reunir todas las instancias con proveedor
    const allInstances = [
      ...instances.aws.map((i) => ({ ...i, provider: "AWS" })),
      ...instances.azr.map((i) => ({ ...i, provider: "AZR" })),
      ...instances.gcp.map((i) => ({ ...i, provider: "GCP" })),
      ...instances.oci.map((i) => ({ ...i, provider: "OCI" })),
    ];

    const minPrice = Math.min(...allInstances.map((i) => i.totalPrice));

    // Etiquetas únicas por instancia
    const labels = allInstances.map((i) => `${i.provider}-${i.instanceName}`);

    // Crear datasets por proveedor
    const datasets = providers.map((provider) => {
      return {
        label: provider,
        data: labels.map((label) => {
          const match = allInstances.find(
            (i) =>
              `${i.provider}-${i.instanceName}` === label &&
              i.provider === provider,
          );
          return match ? match.totalPrice : null;
        }),
        backgroundColor: labels.map((label) => {
          const match = allInstances.find(
            (i) =>
              `${i.provider}-${i.instanceName}` === label &&
              i.provider === provider,
          );
          if (!match) return "transparent";
          return match.totalPrice === minPrice
            ? `${colors[provider]}CC`
            : `${colors[provider]}88`;
        }),
        borderColor: colors[provider],
        borderWidth: 1,
      };
    });

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#000",
              font: { weight: "bold" },
            },
          },
          title: {
            display: true,
            text: "Comparación de precios de instancias por proveedor",
          },
        },
        scales: {
          x: {
            stacked: true,
            title: { display: true, text: "Instancias" },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: `Precio Total (${currency})` },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [instances, currency]);

  return (
    <div class="mt-5">
      <h4 class="mb-3">Gráfico comparativo de precios</h4>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default InfraPriceChart;
