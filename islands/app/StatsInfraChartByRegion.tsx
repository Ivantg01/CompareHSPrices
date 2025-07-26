import { useEffect, useRef } from "preact/hooks";
import { Chart } from "chart.js";
import { Signal } from "@preact/signals";
import { ChartDataset } from "../../types.ts";
import { CHARTJS } from "../../utils/chartJs.ts";

interface InfraPriceChartProps {
  dataset: ChartDataset[];
  currency: string;
  title: string;
  regionalNameSignal: Signal<string>;
  allRegions: { name: string; displayName: string; regionalName: string }[];
}

const StatsInfraChartByRegion = (
  { dataset, currency, title, regionalNameSignal, allRegions }:
    InfraPriceChartProps,
) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("Rendering with regionalName:", regionalNameSignal.value);
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Filtra los datos según el regionalName seleccionado
    const filteredDataset =
      regionalNameSignal.value === "Todas" || title.includes(" OCI ")
        ? dataset
        : dataset.filter((d) =>
          allRegions.some((region) =>
            region.name === d.label.replace(" cpu", "").replace(" ram", "") &&
            region.regionalName === regionalNameSignal.value
          )
        );

    // traduce los nombres de regiones por su displayName, sin afectar al original
    const translatedDataset = filteredDataset.map((d) => {
      const suffix = d.label.endsWith(" cpu")
        ? " cpu"
        : d.label.endsWith(" ram")
        ? " ram"
        : "";
      const region = allRegions.find((region) =>
        region.name === d.label.replace(" cpu", "").replace(" ram", "")
      );
      return {
        ...d,
        label: region ? region.displayName + suffix : d.label,
      };
    });

    // Obtener todas las fechas únicas ordenadas
    const dates = Array.from(new Set(translatedDataset.map((d) => d.dateCode)))
      .sort();

    // Obtener todas las labels únicas (nombres de regiones)
    const labels = Array.from(new Set(translatedDataset.map((d) => d.label)));

    // Crear datasets para ChartJS, uno por VM
    const chartDatasets = labels.map((label, idx) => ({
      label,
      data: dates.map((date) =>
        translatedDataset.find((d) => d.label === label && d.dateCode === date)
          ?.value ??
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
  }, [dataset, currency, regionalNameSignal.value]);

  return (
    <div class="mt-3">
      <h4 class="mb-3">Gráfico histórico de precios</h4>
      <canvas ref={chartRef} style={{ backgroundColor: "#dddddd" }}></canvas>
    </div>
  );
};

export default StatsInfraChartByRegion;
