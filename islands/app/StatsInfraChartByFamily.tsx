import { useEffect, useRef } from "preact/hooks";
import { Chart } from "chart.js";
import { ChartDataset } from "../../types.ts";
import { CHARTJS } from "../../utils/chartJs.ts";

interface InfraPriceChartProps {
  dataset: ChartDataset[];
  currency: string;
  title: string;
}

const StatsInfraChartByFamily = (
  { dataset, currency, title }: InfraPriceChartProps,
) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Obtener todas las fechas únicas ordenadas
    const dates = Array.from(new Set(dataset.map((d) => d.dateCode))).sort();

    // Obtener todas las labels únicas (nombres de regiones)
    const labels = Array.from(new Set(dataset.map((d) => d.label)));

    // Crear datasets para ChartJS, uno por VM
    const chartDatasets = labels.map((label, idx) => ({
      label,
      data: dates.map((date) =>
        dataset.find((d) => d.label === label && d.dateCode === date)?.value ??
          null
      ),
      borderColor: CHARTJS.color.solids,
      backgroundColor: CHARTJS.color.alphas,
      fill: false,
      spanGaps: true,
      tension: 0.2,
    }));

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: chartDatasets,
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
            text: `${title}`,
            font: { size: 24, weight: "bold" },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Fecha (yyyymmdd)",
              font: { size: 16 },
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
              font: { size: 18, weight: "bold" },
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: `Precio por hora (${currency})`,
              font: { size: 18 },
            },
            ticks: {
              font: { size: 18, weight: "bold" },
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [dataset, currency]);

  return (
    <div class="mt-3">
      <h4 class="mb-3">Gráfico histórico de precios</h4>
      <canvas ref={chartRef} style={{ backgroundColor: "#dddddd" }}></canvas>
    </div>
  );
};

export default StatsInfraChartByFamily;
