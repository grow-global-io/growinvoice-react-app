// import React from "react";
import Dialog from "@mui/material/Dialog";
import AppDialogHeader from "../../shared/components/Dialog/AppDialogHeader";
import { DialogContent } from "@mui/material";

const QRCodeDialog = ({
	open,
	onClose,
	upidata,
}: {
	open: boolean;
	onClose: () => void;
	upidata: string;
}) => {
	// const data = `upi://pay?pa=${getInvoiceData?.data?.payment?.upiId}&pn=${getInvoiceData?.data?.user?.name}&cu=INR&url=${window.location.origin}/invoice/invoicetemplate/${invoiceId}&am=${getInvoiceData?.data?.total?.toFixed(2)}`;
	const encodedData = encodeURIComponent(upidata);
	const size = `225x225`;

	const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedData}&size=${size}`;
	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<AppDialogHeader title="Scan QR Code" handleClose={onClose} />
			<DialogContent>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100%",
					}}
				>
					<img src={qrCodeUrl} alt="QR Code" style={{ width: "100%", maxWidth: "300px" }} />
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default QRCodeDialog;
