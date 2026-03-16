import { buildRepairFormSummary } from "./store";

const TEXT_PAGE_WIDTH = 595;
const TEXT_PAGE_HEIGHT = 842;
const CHART_PAGE_WIDTH = 842;
const CHART_PAGE_HEIGHT = 595;
const LEFT_MARGIN = 40;
const RIGHT_MARGIN = 40;
const TOP_MARGIN = 44;
const BOTTOM_MARGIN = 38;

function escapePdfText(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function wrapText(text, maxChars) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    let remaining = word;
    while (remaining.length > maxChars) {
      lines.push(remaining.slice(0, maxChars));
      remaining = remaining.slice(maxChars);
    }
    current = remaining;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function formatDisplayDate(value) {
  const timestamp = Date.parse(value ?? "");
  if (Number.isNaN(timestamp)) {
    return "-";
  }

  return new Date(timestamp).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildTextLines(title, savedAt, fields) {
  const sections = buildRepairFormSummary(fields);
  const lines = [
    { text: `Reparaturformular: ${title}`, font: "bold", size: 18, height: 28 },
    { text: `Gespeichert: ${formatDisplayDate(savedAt)}`, font: "regular", size: 10, height: 16 },
    { blank: true, height: 8 },
  ];

  for (const section of sections) {
    lines.push({ text: section.heading, font: "bold", size: 12, height: 18 });

    for (const line of section.lines) {
      const maxChars = Math.max(
        24,
        Math.floor((TEXT_PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN) / (10 * 0.54)),
      );

      for (const wrappedLine of wrapText(line, maxChars)) {
        lines.push({ text: wrappedLine, font: "regular", size: 10, height: 14 });
      }
    }

    lines.push({ blank: true, height: 7 });
  }

  while (lines.length > 0 && lines[lines.length - 1].blank) {
    lines.pop();
  }

  return lines;
}

function paginateTextLines(lines) {
  const availableHeight = TEXT_PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;
  const pages = [];
  let currentPage = [];
  let usedHeight = 0;

  for (const line of lines) {
    if (usedHeight + line.height > availableHeight && currentPage.length > 0) {
      while (currentPage.length > 0 && currentPage[currentPage.length - 1].blank) {
        currentPage.pop();
      }

      pages.push(currentPage);
      currentPage = [];
      usedHeight = 0;

      if (line.blank) {
        continue;
      }
    }

    if (currentPage.length === 0 && line.blank) {
      continue;
    }

    currentPage.push(line);
    usedHeight += line.height;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[{ text: "Leeres Reparaturformular", font: "bold", size: 16, height: 22 }]];
}

function buildTextPageStream(lines) {
  let y = TEXT_PAGE_HEIGHT - TOP_MARGIN;
  let content = "";

  for (const line of lines) {
    if (line.blank) {
      y -= line.height;
      continue;
    }

    const fontRef = line.font === "bold" ? "F2" : "F1";
    content += [
      "BT",
      `/${fontRef} ${line.size} Tf`,
      `1 0 0 1 ${LEFT_MARGIN} ${y.toFixed(2)} Tm`,
      `(${escapePdfText(line.text)}) Tj`,
      "ET",
      "",
    ].join("\n");

    y -= line.height;
  }

  return new TextEncoder().encode(content);
}

function buildChartPageStream(title, savedAt, chartImage) {
  const titleY = CHART_PAGE_HEIGHT - 44;
  const subtitleY = CHART_PAGE_HEIGHT - 64;
  const topReserved = 96;
  const bottomReserved = 34;
  const usableWidth = CHART_PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
  const usableHeight = CHART_PAGE_HEIGHT - topReserved - bottomReserved;
  const scale = Math.min(
    usableWidth / chartImage.width,
    usableHeight / chartImage.height,
  );
  const drawWidth = chartImage.width * scale;
  const drawHeight = chartImage.height * scale;
  const drawX = (CHART_PAGE_WIDTH - drawWidth) / 2;
  const drawY = bottomReserved + (usableHeight - drawHeight) / 2;

  const content = [
    "BT",
    "/F2 18 Tf",
    `1 0 0 1 ${LEFT_MARGIN} ${titleY.toFixed(2)} Tm`,
    `(${escapePdfText(`Gewichtsverlauf: ${title}`)}) Tj`,
    "ET",
    "BT",
    "/F1 10 Tf",
    `1 0 0 1 ${LEFT_MARGIN} ${subtitleY.toFixed(2)} Tm`,
    `(${escapePdfText(`Stand: ${formatDisplayDate(savedAt)}`)}) Tj`,
    "ET",
    "q",
    `${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${drawX.toFixed(2)} ${drawY.toFixed(2)} cm`,
    "/Im0 Do",
    "Q",
    "",
  ].join("\n");

  return new TextEncoder().encode(content);
}

function createPdfDocument({ title, savedAt, fields, chartImage }) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let offset = 0;

  const textPageLines = paginateTextLines(buildTextLines(title, savedAt, fields));
  const textPageRefs = [];
  let nextId = 1;
  const catalogId = nextId++;
  const pagesId = nextId++;
  const fontRegularId = nextId++;
  const fontBoldId = nextId++;

  for (let index = 0; index < textPageLines.length; index += 1) {
    textPageRefs.push({
      pageId: nextId++,
      contentId: nextId++,
    });
  }

  const chartPageId = nextId++;
  const chartContentId = nextId++;
  const imageId = nextId++;

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

  writeObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  writeObject(
    pagesId,
    `<< /Type /Pages /Kids [${[
      ...textPageRefs.map((page) => `${page.pageId} 0 R`),
      `${chartPageId} 0 R`,
    ].join(" ")}] /Count ${textPageRefs.length + 1} >>`,
  );
  writeObject(fontRegularId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  writeObject(fontBoldId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  for (let index = 0; index < textPageRefs.length; index += 1) {
    const page = textPageRefs[index];
    const contentBytes = buildTextPageStream(textPageLines[index]);

    writeObject(
      page.pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${TEXT_PAGE_WIDTH} ${TEXT_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${page.contentId} 0 R >>`,
    );
    writeStreamObject(page.contentId, `<< /Length ${contentBytes.length} >>`, contentBytes);
  }

  const chartContentBytes = buildChartPageStream(title, savedAt, chartImage);
  writeObject(
    chartPageId,
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${CHART_PAGE_WIDTH} ${CHART_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${chartContentId} 0 R >>`,
  );
  writeStreamObject(
    chartContentId,
    `<< /Length ${chartContentBytes.length} >>`,
    chartContentBytes,
  );
  writeStreamObject(
    imageId,
    `<< /Type /XObject /Subtype /Image /Width ${chartImage.width} /Height ${chartImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${chartImage.bytes.length} >>`,
    chartImage.bytes,
  );

  const xrefStart = offset;
  pushText(`xref\n0 ${nextId}\n`);
  pushText("0000000000 65535 f \n");
  for (let id = 1; id < nextId; id += 1) {
    pushText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks, { type: "application/pdf" });
}

function sanitizeFilePart(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createRepairFormPdfFileName(title) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  const safeTitle = sanitizeFilePart(title) || "reparaturformular";

  return `${safeTitle}-${year}${month}${day}-${hour}${minute}${second}.pdf`;
}

export function buildRepairFormPdf({ title, savedAt, fields, chartImage }) {
  return createPdfDocument({
    title,
    savedAt,
    fields,
    chartImage,
  });
}
