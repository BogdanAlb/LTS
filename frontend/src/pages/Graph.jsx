import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWeight, tareScale } from "../api/sensor";
import ControlPanel from "../components/ControlPanel";
import GaugeDisplay from "../components/GaugeDisplay";
import { useLanguage } from "../i18n/useLanguage";
import { buildRepairFormPdf, createRepairFormPdfFileName } from "../repairForms/pdf";
import { listRepairForms, REPAIR_FORMS_UPDATED_EVENT } from "../repairForms/store";

const POLL_INTERVAL_MS = 500;
const MAX_SAMPLES = 120;
const CHART_WIDTH = 980;
const CHART_HEIGHT = 430;
const GRAMS_TO_NEWTONS = 9.80665e-4;
const CHART_PADDING = {
  top: 24,
  right: 24,
  bottom: 42,
  left: 62,
};

function formatChartValue(value, unit) {
  const normalizedValue = Number(value) || 0;
  const displayValue = unit === "n" ? normalizedValue * GRAMS_TO_NEWTONS : normalizedValue;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: unit === "n" ? 3 : 1,
    useGrouping: true,
  })
    .format(displayValue)
    .replaceAll(",", ".");
}

function base64ToBytes(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function normalizeSvgMarkup(svgElement) {
  const serializer = new XMLSerializer();
  let svgText = serializer.serializeToString(svgElement);

  if (!svgText.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgText = svgText.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"',
    );
  }
  if (!svgText.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
    svgText = svgText.replace(
      "<svg",
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
    );
  }

  return svgText;
}

function createPrintableChart(svgElement) {
  const exportSvg = svgElement.cloneNode(true);
  const [backgroundRect] = exportSvg.querySelectorAll("rect");

  if (backgroundRect) {
    backgroundRect.setAttribute("fill", "#ffffff");
    backgroundRect.setAttribute("stroke", "#111111");
    backgroundRect.setAttribute("stroke-width", "1");
  }

  exportSvg.querySelectorAll("line").forEach((line) => {
    const isAxis = Number(line.getAttribute("stroke-width") || 0) > 1;
    line.setAttribute("stroke", isAxis ? "#111111" : "#bdbdbd");
  });

  exportSvg.querySelectorAll("text").forEach((label) => {
    label.setAttribute("fill", "#111111");
  });

  exportSvg.querySelectorAll("path").forEach((path) => {
    path.setAttribute("stroke", "#111111");
  });

  exportSvg.querySelectorAll("circle").forEach((point) => {
    point.setAttribute("fill", "#111111");
  });

  return exportSvg;
}

function svgToJpegBytes(svgElement, width, height, { backgroundColor = "#081322" } = {}) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([normalizeSvgMarkup(svgElement)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("Canvas context unavailable"));
        return;
      }

      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      URL.revokeObjectURL(svgUrl);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const base64 = dataUrl.split(",")[1];

      if (!base64) {
        reject(new Error("Failed to render chart image"));
        return;
      }

      resolve({
        bytes: base64ToBytes(base64),
        width,
        height,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("Failed to load chart image"));
    };

    image.src = svgUrl;
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function Graph() {
  const { locale, t } = useLanguage();
  const chartRef = useRef(null);
  const [weight, setWeight] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [displayUnit, setDisplayUnit] = useState("g");
  const [statusMessage, setStatusMessage] = useState("");
  const [samples, setSamples] = useState([]);
  const [repairForms, setRepairForms] = useState([]);
  const [selectedRepairFormId, setSelectedRepairFormId] = useState("");
  const [formsError, setFormsError] = useState("");

  const appendSample = useCallback((value) => {
    setSamples((previous) => {
      const normalizedValue = Math.max(0, Number(value) || 0);
      const next = [...previous, { timestamp: Date.now(), value: normalizedValue }];
      if (next.length > MAX_SAMPLES) {
        next.splice(0, next.length - MAX_SAMPLES);
      }
      return next;
    });
  }, []);

  const fetchWeight = useCallback(async () => {
    const value = await getCurrentWeight();
    if (value === null || Number.isNaN(Number(value))) {
      return;
    }

    const normalizedValue = Number(value);
    setWeight(normalizedValue);
    appendSample(normalizedValue);
  }, [appendSample]);

  useEffect(() => {
    let poller;

    if (isRunning) {
      fetchWeight();
      poller = setInterval(fetchWeight, POLL_INTERVAL_MS);
    }

    return () => {
      if (poller) {
        clearInterval(poller);
      }
    };
  }, [fetchWeight, isRunning]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setStatusMessage(""), 2500);
    return () => clearTimeout(timeoutId);
  }, [statusMessage]);

  const loadSavedForms = useCallback(() => {
    try {
      const nextForms = listRepairForms();
      setRepairForms(nextForms);
      setSelectedRepairFormId((current) => {
        if (nextForms.some((item) => item.id === current)) {
          return current;
        }
        return nextForms[0]?.id ?? "";
      });
      setFormsError("");
    } catch (error) {
      setFormsError(error.message ?? t("graph.formMenu.loadError"));
    }
  }, [t]);

  useEffect(() => {
    loadSavedForms();

    window.addEventListener("storage", loadSavedForms);
    window.addEventListener(REPAIR_FORMS_UPDATED_EVENT, loadSavedForms);

    return () => {
      window.removeEventListener("storage", loadSavedForms);
      window.removeEventListener(REPAIR_FORMS_UPDATED_EVENT, loadSavedForms);
    };
  }, [loadSavedForms]);

  const handleStart = () => {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    setStatusMessage(t("dashboard.messages.started"));
  };

  const handleStop = () => {
    if (!isRunning) {
      return;
    }
    setIsRunning(false);
    setStatusMessage(t("dashboard.messages.stopped"));
  };

  const handleTare = async () => {
    const ok = await tareScale();
    if (!ok) {
      setStatusMessage(t("dashboard.messages.tareFailed"));
      return;
    }

    const resetValue = 0;
    setWeight(resetValue);
    setSamples([{ timestamp: Date.now(), value: resetValue }]);
    setStatusMessage(t("dashboard.messages.tareDone"));
  };

  const handleToggleUnit = () => {
    setDisplayUnit((current) => (current === "g" ? "n" : "g"));
  };

  const handleExport = async () => {
    const selectedRepairForm = repairForms.find((item) => item.id === selectedRepairFormId) ?? null;
    if (!selectedRepairForm) {
      setStatusMessage(t("graph.messages.formRequired"));
      return;
    }

    const chartElement = chartRef.current;
    if (!chartElement) {
      setStatusMessage(t("graph.messages.exportFailed"));
      return;
    }

    try {
      const printableChart = createPrintableChart(chartElement);
      const chartImage = await svgToJpegBytes(printableChart, CHART_WIDTH, CHART_HEIGHT, {
        backgroundColor: "#ffffff",
      });
      const pdf = buildRepairFormPdf({
        title: selectedRepairForm.title,
        savedAt: selectedRepairForm.updatedAt,
        fields: selectedRepairForm.fields,
        chartImage,
      });

      downloadBlob(pdf, createRepairFormPdfFileName(selectedRepairForm.title));
      setStatusMessage(t("graph.messages.exportDone"));
    } catch (error) {
      console.error("Export failed:", error);
      setStatusMessage(t("graph.messages.exportFailed"));
    }
  };

  const chartModel = useMemo(() => {
    const plotLeft = CHART_PADDING.left;
    const plotTop = CHART_PADDING.top;
    const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const horizontalLines = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      return plotTop + ratio * plotHeight;
    });

    if (samples.length === 0) {
      return {
        plotLeft,
        plotTop,
        plotWidth,
        plotHeight,
        horizontalLines,
        yTicks: horizontalLines.map((y) => ({ y, value: formatChartValue(0, displayUnit) })),
        path: "",
        points: [],
        firstTime: "--:--:--",
        lastTime: "--:--:--",
      };
    }

    const values = samples.map((sample) => sample.value);
    let minValue = Math.min(...values);
    let maxValue = Math.max(...values);

    if (minValue === maxValue) {
      minValue -= 5;
      maxValue += 5;
    } else {
      const padding = (maxValue - minValue) * 0.1;
      minValue -= padding;
      maxValue += padding;
    }

    minValue = Math.max(0, minValue);
    if (maxValue <= minValue) {
      maxValue = minValue + 5;
    }

    const range = maxValue - minValue || 1;
    const stepX = samples.length > 1 ? plotWidth / (samples.length - 1) : 0;

    const points = samples.map((sample, index) => {
      const x = samples.length > 1 ? plotLeft + stepX * index : plotLeft + plotWidth / 2;
      const ratio = (sample.value - minValue) / range;
      const y = plotTop + (1 - ratio) * plotHeight;
      return { x, y };
    });

    const path = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");

    const yTicks = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      return {
        y: plotTop + ratio * plotHeight,
        value: formatChartValue(maxValue - ratio * range, displayUnit),
      };
    });

    return {
      plotLeft,
      plotTop,
      plotWidth,
      plotHeight,
      horizontalLines,
      yTicks,
      path,
      points,
      firstTime: new Date(samples[0].timestamp).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      lastTime: new Date(samples[samples.length - 1].timestamp).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  }, [displayUnit, locale, samples]);

  const lastPointIndex = chartModel.points.length - 1;
  const selectedRepairForm = useMemo(
    () => repairForms.find((item) => item.id === selectedRepairFormId) ?? null,
    [repairForms, selectedRepairFormId],
  );

  return (
    <section className="page graph-page">
      <div className="graph-layout">
        <div className="graph-card">
          <div className="graph-card-header">
            <p className="graph-card-title">
              {t("graph.chartTitle")} ({t(`dashboard.units.${displayUnit}`)})
            </p>
            <div className="graph-form-menu">
              <label className="graph-form-label" htmlFor="graph-form-select">
                {t("graph.formMenu.label")}
              </label>
              <select
                id="graph-form-select"
                className="graph-form-select"
                value={selectedRepairFormId}
                onChange={(event) => setSelectedRepairFormId(event.target.value)}
                disabled={repairForms.length === 0}
              >
                {repairForms.length === 0 ? (
                  <option value="">{t("graph.formMenu.empty")}</option>
                ) : null}
                {repairForms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedRepairForm ? (
            <p className="graph-form-note">
              {selectedRepairForm.title} · {t("graph.formMenu.savedAt")} {new Date(selectedRepairForm.updatedAt).toLocaleString(locale)}
            </p>
          ) : null}
          {formsError ? <p className="user-message">{formsError}</p> : null}
          <svg
            ref={chartRef}
            className="graph-svg"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={t("graph.ariaLabel")}
          >
            <defs>
              <linearGradient id="weight-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            <rect
              x="0"
              y="0"
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              fill="rgba(2, 10, 22, 0.7)"
              rx="14"
              ry="14"
            />

            {chartModel.horizontalLines.map((lineY) => (
              <line
                key={lineY}
                x1={chartModel.plotLeft}
                y1={lineY}
                x2={chartModel.plotLeft + chartModel.plotWidth}
                y2={lineY}
                stroke="rgba(148, 163, 184, 0.22)"
                strokeWidth="1"
              />
            ))}

            <line
              x1={chartModel.plotLeft}
              y1={chartModel.plotTop}
              x2={chartModel.plotLeft}
              y2={chartModel.plotTop + chartModel.plotHeight}
              stroke="rgba(148, 163, 184, 0.45)"
              strokeWidth="1.3"
            />
            <line
              x1={chartModel.plotLeft}
              y1={chartModel.plotTop + chartModel.plotHeight}
              x2={chartModel.plotLeft + chartModel.plotWidth}
              y2={chartModel.plotTop + chartModel.plotHeight}
              stroke="rgba(148, 163, 184, 0.45)"
              strokeWidth="1.3"
            />

            {chartModel.yTicks.map((tick) => (
              <text
                key={`${tick.y}-${tick.value}`}
                x={chartModel.plotLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="13"
              >
                {tick.value}
              </text>
            ))}

            <text
              x={chartModel.plotLeft}
              y={CHART_HEIGHT - 12}
              textAnchor="start"
              fill="#94a3b8"
              fontSize="13"
            >
              {chartModel.firstTime}
            </text>
            <text
              x={chartModel.plotLeft + chartModel.plotWidth}
              y={CHART_HEIGHT - 12}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="13"
            >
              {chartModel.lastTime}
            </text>

            {chartModel.path ? (
              <>
                <path
                  d={chartModel.path}
                  fill="none"
                  stroke="url(#weight-line-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {chartModel.points.map((point, index) => (
                  <circle
                    key={`${point.x}-${point.y}`}
                    cx={point.x}
                    cy={point.y}
                    r={index === lastPointIndex ? 4 : 2.3}
                    fill={index === lastPointIndex ? "#e2e8f0" : "#38bdf8"}
                  />
                ))}
              </>
            ) : (
              <text
                x={chartModel.plotLeft + chartModel.plotWidth / 2}
                y={chartModel.plotTop + chartModel.plotHeight / 2}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="17"
              >
                {t("graph.empty")}
              </text>
            )}
          </svg>
        </div>

        <aside className="graph-live-panel">
          <GaugeDisplay value={weight} unit={displayUnit} />
          <ControlPanel
            onTare={handleTare}
            onStart={handleStart}
            onStop={handleStop}
            isRunning={isRunning}
            onToggleUnit={handleToggleUnit}
            unitToggleLabel={t(`dashboard.units.${displayUnit === "g" ? "n" : "g"}`)}
            unitToggleAriaLabel={t("dashboard.actions.changeUnit")}
            onExport={handleExport}
          />
          {statusMessage ? <div className="status-message">{statusMessage}</div> : null}
        </aside>
      </div>
    </section>
  );
}
