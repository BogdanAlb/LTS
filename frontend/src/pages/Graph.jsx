import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getKioskOrders } from "../api/kioskOrders";
import { getCurrentWeight, tareScale } from "../api/sensor";
import ControlPanel from "../components/ControlPanel";
import GaugeDisplay from "../components/GaugeDisplay";
import { useLanguage } from "../i18n/useLanguage";

const POLL_INTERVAL_MS = 500;
const MAX_SAMPLES = 120;
const CHART_WIDTH = 980;
const CHART_HEIGHT = 430;
const CHART_PADDING = {
  top: 24,
  right: 24,
  bottom: 42,
  left: 62,
};
const PDF_WIDTH = 842;
const PDF_HEIGHT = 595;
const PDF_MARGIN = 26;

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

function svgToJpegBytes(svgElement, width, height) {
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

      context.fillStyle = "#081322";
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

function buildPdf(imageBytes, imageWidth, imageHeight) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let offset = 0;

  const pushBytes = (bytes) => {
    chunks.push(bytes);
    offset += bytes.length;
  };

  const pushText = (text) => {
    pushBytes(encoder.encode(text));
  };

  const writeObject = (id, body) => {
    offsets[id] = offset;
    pushText(`${id} 0 obj\n${body}\nendobj\n`);
  };

  const writeStreamObject = (id, dictionary, streamBytes) => {
    offsets[id] = offset;
    pushText(`${id} 0 obj\n${dictionary}\nstream\n`);
    pushBytes(streamBytes);
    pushText("\nendstream\nendobj\n");
  };

  pushText("%PDF-1.4\n%LTS\n");

  const usableWidth = PDF_WIDTH - PDF_MARGIN * 2;
  const usableHeight = PDF_HEIGHT - PDF_MARGIN * 2;
  const scale = Math.min(usableWidth / imageWidth, usableHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = (PDF_WIDTH - drawWidth) / 2;
  const drawY = (PDF_HEIGHT - drawHeight) / 2;
  const contentStream = encoder.encode(
    `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${drawX.toFixed(2)} ${drawY.toFixed(2)} cm\n/Im0 Do\nQ`,
  );

  writeObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  writeObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  writeObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`,
  );
  writeStreamObject(4, `<< /Length ${contentStream.length} >>`, contentStream);
  writeStreamObject(
    5,
    `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>`,
    imageBytes,
  );

  const xrefStart = offset;
  pushText("xref\n0 6\n");
  pushText("0000000000 65535 f \n");
  for (let id = 1; id <= 5; id += 1) {
    pushText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks, { type: "application/pdf" });
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

function createTimestampedFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  return `grafic-greutate-${year}${month}${day}-${hour}${minute}${second}.pdf`;
}

function formatGraphFormLabel(item) {
  const kunde = String(item?.fields?.kunde ?? "").trim() || String(item?.title ?? "").trim() || "Formular";
  const befundNr = String(item?.fields?.befundNr ?? "").trim();
  const suffix = typeof item?.id === "number" ? ` - ${item.id}` : "";

  if (!befundNr) {
    return `${kunde}${suffix}`.trim();
  }

  return `${kunde} Befund ${befundNr}${suffix}`;
}

export default function Graph() {
  const { locale, t } = useLanguage();
  const chartRef = useRef(null);
  const [weight, setWeight] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [messageKey, setMessageKey] = useState("");
  const [samples, setSamples] = useState([]);
  const [repairForms, setRepairForms] = useState([]);
  const [selectedRepairFormId, setSelectedRepairFormId] = useState("");
  const [formsLoading, setFormsLoading] = useState(true);
  const [formsError, setFormsError] = useState("");

  const appendSample = useCallback((value) => {
    setSamples((previous) => {
      const next = [...previous, { timestamp: Date.now(), value }];
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
    if (!messageKey) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setMessageKey(""), 2500);
    return () => clearTimeout(timeoutId);
  }, [messageKey]);

  useEffect(() => {
    let active = true;

    const loadRepairForms = async () => {
      try {
        const orders = await getKioskOrders(50);
        if (!active) {
          return;
        }

        const nextForms = orders.filter((item) => {
          const fields = item?.fields ?? {};
          return fields.form_type === "reparatur" || fields.kunde || fields.befundNr;
        });

        setRepairForms(nextForms);
        setSelectedRepairFormId((current) => {
          if (nextForms.some((item) => String(item.id) === current)) {
            return current;
          }
          return nextForms[0] ? String(nextForms[0].id) : "";
        });
        setFormsError("");
      } catch (error) {
        if (active) {
          setFormsError(error.message ?? t("graph.formMenu.loadError"));
        }
      } finally {
        if (active) {
          setFormsLoading(false);
        }
      }
    };

    loadRepairForms();

    return () => {
      active = false;
    };
  }, [t]);

  const handleStart = () => {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    setMessageKey("dashboard.messages.started");
  };

  const handleStop = () => {
    if (!isRunning) {
      return;
    }
    setIsRunning(false);
    setMessageKey("dashboard.messages.stopped");
  };

  const handleTare = async () => {
    const ok = await tareScale();
    if (!ok) {
      setMessageKey("dashboard.messages.tareFailed");
      return;
    }

    setWeight(0);
    appendSample(0);
    setMessageKey("dashboard.messages.tareDone");
  };

  const handleExport = async () => {
    const chartElement = chartRef.current;
    if (!chartElement) {
      setMessageKey("graph.messages.exportFailed");
      return;
    }

    try {
      const image = await svgToJpegBytes(chartElement, CHART_WIDTH, CHART_HEIGHT);
      const pdf = buildPdf(image.bytes, image.width, image.height);
      downloadBlob(pdf, createTimestampedFileName());
      setMessageKey("graph.messages.exportDone");
    } catch (error) {
      console.error("Export failed:", error);
      setMessageKey("graph.messages.exportFailed");
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
        yTicks: horizontalLines.map((y) => ({ y, value: "0.0" })),
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
        value: (maxValue - ratio * range).toFixed(1),
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
  }, [locale, samples]);

  const lastPointIndex = chartModel.points.length - 1;
  const selectedRepairForm = useMemo(
    () => repairForms.find((item) => String(item.id) === selectedRepairFormId) ?? null,
    [repairForms, selectedRepairFormId],
  );

  return (
    <section className="page graph-page">
      <div className="graph-layout">
        <div className="graph-card">
          <div className="graph-card-header">
            <p className="graph-card-title">{t("graph.chartTitle")}</p>
            <div className="graph-form-menu">
              <label className="graph-form-label" htmlFor="graph-form-select">
                {t("graph.formMenu.label")}
              </label>
              <select
                id="graph-form-select"
                className="graph-form-select"
                value={selectedRepairFormId}
                onChange={(event) => setSelectedRepairFormId(event.target.value)}
                disabled={formsLoading || repairForms.length === 0}
              >
                {formsLoading ? <option value="">{t("graph.formMenu.loading")}</option> : null}
                {!formsLoading && repairForms.length === 0 ? (
                  <option value="">{t("graph.formMenu.empty")}</option>
                ) : null}
                {!formsLoading
                  ? repairForms.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {formatGraphFormLabel(item)}
                      </option>
                    ))
                  : null}
              </select>
            </div>
          </div>
          {selectedRepairForm ? (
            <p className="graph-form-note">{formatGraphFormLabel(selectedRepairForm)}</p>
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
          <GaugeDisplay value={weight} />
          <ControlPanel
            onTare={handleTare}
            onStart={handleStart}
            onStop={handleStop}
            onExport={handleExport}
          />
          {messageKey && <div className="status-message">{t(messageKey)}</div>}
        </aside>
      </div>
    </section>
  );
}
