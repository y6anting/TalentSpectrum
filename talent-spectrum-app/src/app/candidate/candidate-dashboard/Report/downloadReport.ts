// app/report/downloadReport.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Convert any color to RGB via canvas
const toRGB = (color: string): string => {
  if (!color || color === "transparent") return color;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "black";
  try {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    return ctx.fillStyle;
  } catch {
    return "black";
  }
};

export const handleDownloadReport = async (): Promise<void> => {
  const reportEl = document.getElementById("report-content");
  if (!reportEl) {
    alert("Report content not found");
    return;
  }

  // Clone the report
  const clone = reportEl.cloneNode(true) as HTMLElement;

  // Create offscreen container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = reportEl.offsetWidth + "px";
  container.appendChild(clone);
  document.body.appendChild(container);

  // Remove no-print
  clone.querySelectorAll(".no-print").forEach((el) => el.remove());

  // Nuke ALL lab() colors from clone
  const elements = clone.querySelectorAll("*");
  elements.forEach((el) => {
    const elem = el as HTMLElement;
    const style = elem.style;
    const comp = getComputedStyle(elem);

    // Force RGB on everything
    if (comp.color) style.color = toRGB(comp.color);
    if (comp.backgroundColor && comp.backgroundColor !== "transparent")
      style.backgroundColor = toRGB(comp.backgroundColor);
    if (comp.borderColor) style.borderColor = toRGB(comp.borderColor);

    // Kill gradients, shadows, filters
    style.backgroundImage = "none";
    style.boxShadow = "none";
    style.filter = "none";
    style.textShadow = "none";

    // Apply PDF fallback
    const pdfBg = elem.getAttribute("data-pdf-bg");
    if (pdfBg) {
      style.backgroundColor = pdfBg;
      style.backgroundImage = "none";
    }
  });

  // Wait for styles
  await new Promise((r) => setTimeout(r, 100));

  // Render
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  document.body.removeChild(container);

  // Generate PDF
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(img, "PNG", 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(img, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("TalentSpectrum_Report.pdf");
};