import { LoaderService } from "@shared/services/LoaderService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const usePdfExport = () => {

	const generatePdfFromRef = async ({
		iframeRef,
	}: {
		iframeRef: React.RefObject<HTMLIFrameElement>;
	}) => {
		LoaderService.instance?.showLoader();

		try {
			const iframe = iframeRef.current;
			if (!iframe) {
				throw new Error("Iframe not found.");
			}

			const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
			const elementToCapture = iframeDoc?.getElementById("tm_download_section");

			if (!elementToCapture) {
				throw new Error("Element with ID 'tm_download_section' not found in iframe.");
			}

			// --- 1. Set up PDF and Canvas properties ---
			const pdf = new jsPDF("portrait", "mm", "a4");
			const dpi = 300; // Use a high DPI for better quality
			const scale = dpi / 96; // Scale factor for html2canvas

			// A4 page dimensions in mm
			const pdfPageWidth = pdf.internal.pageSize.getWidth();
			const pdfPageHeight = pdf.internal.pageSize.getHeight();
			const margin = 10; // 10mm margin on all sides

			// Usable area on the PDF page
			const contentWidth = pdfPageWidth - margin * 2;
			const contentHeight = pdfPageHeight - margin * 2;

			// --- 2. Generate a single, high-quality canvas of the entire element ---
			const canvas = await html2canvas(elementToCapture, {
				allowTaint: true,
				useCORS: true,
				scale: scale,
			});

			const imgData = canvas.toDataURL("image/png");

			// --- 3. Calculate the image's dimensions in the PDF ---
			const canvasAspectRatio = canvas.width / canvas.height;

			// The image will be scaled to fit the content width of the PDF
			const imgWidthInPdf = contentWidth;
			const imgHeightInPdf = imgWidthInPdf / canvasAspectRatio;

			// --- 4. Calculate the number of pages needed ---
			const totalPages = Math.ceil(imgHeightInPdf / contentHeight);

			// --- 5. Loop through pages and add image "slices" ---
			let heightLeft = imgHeightInPdf;
			let yPosition = 0;

			for (let i = 0; i < totalPages; i++) {
				// Add a new page for all pages after the first
				if (i > 0) {
					pdf.addPage();
				}

				// `yPosition` is the negative offset that "scrolls" the source image
				pdf.addImage(
					imgData,
					"PNG",
					margin, // x position
					yPosition + margin, // y position
					imgWidthInPdf,
					imgHeightInPdf,
				);

				// Decrement the height left and update the yPosition for the next slice
				heightLeft -= contentHeight;
				yPosition -= pdfPageHeight;
			}
			console.log(heightLeft, yPosition, contentHeight, pdfPageHeight);

			pdf.save("Invoice.pdf");
			return pdf;
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			LoaderService.instance?.hideLoader();
		}
	};

	const generatePdfFromHtml = async ({ html }: { html: string }) => {
		LoaderService.instance?.showLoader();
		try {
			const createDiv = document.createElement("div");
			createDiv.innerHTML = html;
			document.body.appendChild(createDiv);
			const ref = document.getElementById("tm_download_section");
			const doc = new jsPDF("portrait", "mm", "a4");
			const cWidth = ref?.clientWidth || 0;
			const cHeight = ref?.clientHeight || 0;
			const topLeftMargin = 0;
			const pdfWidth = 210; // A4 width in mm
			const pdfHeight = 297; // A4 height in mm
			const aspectRatio = cWidth / cHeight;
			const dpi = 300; // high resolution
			const totalPDFPages = Math.ceil(cHeight / (pdfHeight * (dpi / 96)));
			if (ref) {
				const canvas = await html2canvas(ref, {
					allowTaint: true,
					scale: dpi / 96,
					width: cWidth,
					height: cHeight,
					useCORS: true,
				});
				canvas.getContext("2d");
				const imgData = canvas.toDataURL("image/png", 1.0);
				doc.addImage(
					imgData,
					"PNG",
					topLeftMargin,
					topLeftMargin,
					pdfWidth,
					pdfWidth / aspectRatio,
				);

				for (let i = 1; i < totalPDFPages; i++) {
					doc.addPage();
					doc.addImage(
						imgData,
						"PNG",
						topLeftMargin,
						-(pdfHeight * i) + topLeftMargin * 0,
						pdfWidth,
						pdfWidth / aspectRatio,
					);
				}
				doc.save("Invoice.pdf");
				document.body.removeChild(createDiv);
				LoaderService.instance?.hideLoader();
				return doc;
			}
			LoaderService.instance?.hideLoader();
		} catch (e) {
			console.log(e);
			LoaderService.instance?.hideLoader();
		}
	};

	return {
		generatePdfFromRef,
		generatePdfFromHtml,
	};
};
