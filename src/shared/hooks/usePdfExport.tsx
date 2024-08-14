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
			const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
			const ref = iframeDoc?.getElementById("tm_download_section");
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
				LoaderService.instance?.hideLoader();
				return doc;
			}
			LoaderService.instance?.hideLoader();
		} catch (e) {
			console.log(e);
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
