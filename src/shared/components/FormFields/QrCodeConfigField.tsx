import React, { useEffect, useRef, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	FormControl,
	FormControlLabel,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	Typography,
	useTheme,
} from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { useUploadControllerUploadFile } from "@api/services/upload";
import { TextFormField } from "./TextFormField";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface QrCodeConfigFieldProps {
	title?: string;
	subtitle?: string;
	isInvoiceOverride?: boolean;
}

export const QrCodeConfigField: React.FC<QrCodeConfigFieldProps> = ({
	title,
	subtitle,
	isInvoiceOverride = false,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { values, setFieldValue } = useFormikContext<any>();
	const { mutateAsync: uploadFile, isPending: isUploading } = useUploadControllerUploadFile();

	const [generatedQrPreview, setGeneratedQrPreview] = useState<string>("");
	const [uploadError, setUploadError] = useState<string | null>(null);

	const showQrCode = values.showQrCode !== undefined ? values.showQrCode : true;
	const qrCodeType = values.qrCodeType || "DYNAMIC_UPI";
	const qrCodeValue = values.qrCodeValue || "";
	const qrCodeCustomImage = values.qrCodeCustomImage || "";
	const qrCodePosition = values.qrCodePosition || "BOTTOM_RIGHT";

	// Generate live preview for dynamic UPI / Custom URL
	useEffect(() => {
		let isMounted = true;
		const generateLiveQr = async () => {
			if (!showQrCode) return;

			if (qrCodeType === "STATIC_IMAGE") {
				setGeneratedQrPreview(qrCodeCustomImage);
				return;
			}

			if (qrCodeType === "CUSTOM_URL" && qrCodeValue) {
				try {
					const url = await QRCode.toDataURL(qrCodeValue.trim(), {
						margin: 1,
						width: 200,
						errorCorrectionLevel: "M",
					});
					if (isMounted) setGeneratedQrPreview(url);
				} catch (e) {
					console.error("QR generation error:", e);
				}
				return;
			}

			if (qrCodeType === "DYNAMIC_UPI") {
				const upiId = qrCodeValue.trim() || values?.payment?.upiId || "example@upi";
				const amount = Number(values?.total || values?.due_amount || 100);
				const payeeName = values?.companyName || "GrowInvoice Merchant";
				const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
					payeeName,
				)}&am=${amount > 0 ? amount.toFixed(2) : "100.00"}&cu=INR&tn=Invoice-Preview`;

				try {
					const url = await QRCode.toDataURL(upiUri, {
						margin: 1,
						width: 200,
						errorCorrectionLevel: "M",
					});
					if (isMounted) setGeneratedQrPreview(url);
				} catch (e) {
					console.error("QR generation error:", e);
				}
			}
		};

		generateLiveQr();
		return () => {
			isMounted = false;
		};
	}, [showQrCode, qrCodeType, qrCodeValue, qrCodeCustomImage, values?.total, values?.due_amount]);

	const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setUploadError(null);
		const file = event.target.files?.[0];
		if (!file) return;

		const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
		if (!allowedTypes.includes(file.type)) {
			setUploadError(
				t("qrCode.invalidFileType", {
					defaultValue: "Only PNG, JPG, JPEG, and SVG images are supported.",
				}),
			);
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setUploadError(
				t("qrCode.maxFileSize", {
					defaultValue: "Image size exceeds 5MB limit.",
				}),
			);
			return;
		}

		try {
			const res = await uploadFile({
				data: {
					file,
				},
			});
			if (res?.link) {
				setFieldValue("qrCodeCustomImage", res.link);
				setFieldValue("showQrCode", true);
			}
		} catch (err) {
			// Fallback: local FileReader data URL
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				if (result) {
					setFieldValue("qrCodeCustomImage", result);
					setFieldValue("showQrCode", true);
				}
			};
			reader.onerror = () => {
				setUploadError(
					t("qrCode.uploadFailed", {
						defaultValue: "Failed to load image. Please try again with another file.",
					}),
				);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setFieldValue("qrCodeCustomImage", "");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const typeOptions = [
		{
			value: "DYNAMIC_UPI",
			label: t("qrCode.typeDynamicUpi", { defaultValue: "Dynamic UPI QR (GPay / PhonePe / Paytm)" }),
		},
		{
			value: "STATIC_IMAGE",
			label: t("qrCode.typeStaticImage", { defaultValue: "Upload Custom QR Code Image" }),
		},
		{
			value: "CUSTOM_URL",
			label: t("qrCode.typeCustomUrl", { defaultValue: "Payment Link / Website URL" }),
		},
	];

	const positionOptions = [
		{ value: "BOTTOM_RIGHT", label: t("qrCode.positionBottomRight", { defaultValue: "Bottom Right (Standard)" }) },
		{ value: "BOTTOM_LEFT", label: t("qrCode.positionBottomLeft", { defaultValue: "Bottom Left" }) },
		{ value: "BOTTOM_CENTER", label: t("qrCode.positionBottomCenter", { defaultValue: "Bottom Center" }) },
	];

	return (
		<Card
			variant="outlined"
			sx={{
				borderRadius: 2,
				borderColor: "divider",
				bgcolor: "background.paper",
				overflow: "hidden",
				mb: 2,
			}}
		>
			<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
				{/* Section Header */}
				<Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
					<Box display="flex" alignItems="center" gap={1.5}>
						<Box
							sx={{
								bgcolor: "primary.50",
								color: "primary.main",
								borderRadius: 2,
								p: 1,
								display: "flex",
								alignItems: "center",
							}}
						>
							<QrCode2Icon />
						</Box>
						<Box>
							<Typography variant="h5" fontWeight={700}>
								{title || t("qrCode.title", { defaultValue: "Payment QR Code" })}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{subtitle ||
									t("qrCode.subtitle", {
										defaultValue:
											"Display a payment QR code directly on invoices for instant customer checkout.",
									})}
							</Typography>
						</Box>
					</Box>

					{/* Enable Toggle */}
					<FormControlLabel
						control={
							<Switch
								checked={showQrCode}
								onChange={(e) => setFieldValue("showQrCode", e.target.checked)}
								color="primary"
							/>
						}
						label={
							<Typography variant="subtitle2" fontWeight={600}>
								{t("qrCode.enableOnInvoice", { defaultValue: "Show QR Code" })}
							</Typography>
						}
					/>
				</Box>

				{showQrCode && (
					<Grid container spacing={3} mt={0.5}>
						{/* QR Code Live Preview Card */}
						<Grid item xs={12} md={4}>
							<Typography variant="subtitle2" fontWeight={600} mb={1}>
								{t("qrCode.previewTitle", { defaultValue: "QR Code Preview" })}
							</Typography>

							<Box
								sx={{
									border: "1px solid",
									borderColor: "divider",
									borderRadius: 2,
									p: 2,
									textAlign: "center",
									bgcolor: "grey.50",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									minHeight: "200px",
								}}
							>
								{generatedQrPreview ? (
									<Box>
										<Box
											sx={{
												bgcolor: "#fff",
												p: 1.5,
												borderRadius: 1.5,
												border: "1px solid",
												borderColor: "divider",
												display: "inline-block",
												boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
												mb: 1,
											}}
										>
											<Typography
												variant="caption"
												fontWeight={700}
												display="block"
												mb={0.5}
												color="text.primary"
												textTransform="uppercase"
											>
												{qrCodeType === "DYNAMIC_UPI"
													? t("qrCode.scanWithUpi", { defaultValue: "Scan & Pay" })
													: t("qrCode.scanToPay", { defaultValue: "Scan to Pay" })}
											</Typography>
											<img
												src={generatedQrPreview}
												alt="QR Code Preview"
												style={{
													width: "120px",
													height: "120px",
													display: "block",
													margin: "0 auto",
													objectFit: "contain",
												}}
											/>
											{qrCodeType === "DYNAMIC_UPI" && (qrCodeValue || values?.payment?.upiId) && (
												<Typography
													variant="caption"
													sx={{
														fontFamily: "monospace",
														color: "text.secondary",
														display: "block",
														mt: 0.5,
														fontSize: "10px",
													}}
												>
													{qrCodeValue || values?.payment?.upiId}
												</Typography>
											)}
										</Box>
										<Chip
											size="small"
											color="success"
											variant="outlined"
											label={t("qrCode.activeStatus", { defaultValue: "Ready for Invoices" })}
										/>
									</Box>
								) : (
									<Box>
										<QrCode2Icon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
										<Typography variant="body2" color="text.secondary">
											{t("qrCode.noPreviewAvailable", {
												defaultValue: "Enter a UPI ID or upload an image to preview",
											})}
										</Typography>
									</Box>
								)}
							</Box>
						</Grid>

						{/* Configuration Inputs */}
						<Grid item xs={12} md={8}>
							<Grid container spacing={2}>
								{/* QR Code Type Selector */}
								<Grid item xs={12} sm={7}>
									<FormControl fullWidth size="medium">
										<InputLabel id="qr-code-type-label">
											{t("qrCode.type", { defaultValue: "QR Code Mode" })}
										</InputLabel>
										<Select
											labelId="qr-code-type-label"
											value={qrCodeType}
											label={t("qrCode.type", { defaultValue: "QR Code Mode" })}
											onChange={(e) => setFieldValue("qrCodeType", e.target.value)}
										>
											{typeOptions.map((opt) => (
												<MenuItem key={opt.value} value={opt.value}>
													{opt.label}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Position Selector */}
								<Grid item xs={12} sm={5}>
									<FormControl fullWidth size="medium">
										<InputLabel id="qr-position-label">
											{t("qrCode.position", { defaultValue: "Position" })}
										</InputLabel>
										<Select
											labelId="qr-position-label"
											value={qrCodePosition}
											label={t("qrCode.position", { defaultValue: "Position" })}
											onChange={(e) => setFieldValue("qrCodePosition", e.target.value)}
										>
											{positionOptions.map((opt) => (
												<MenuItem key={opt.value} value={opt.value}>
													{opt.label}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Dynamic UPI ID input */}
								{qrCodeType === "DYNAMIC_UPI" && (
									<Grid item xs={12}>
										<Field
											name="qrCodeValue"
											label={t("qrCode.upiIdLabel", { defaultValue: "UPI ID / VPA Address" })}
											placeholder={t("qrCode.upiIdPlaceholder", {
												defaultValue: "e.g. company@okhdfcbank or merchant@upi",
											})}
											component={TextFormField}
										/>
										<Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
											{t("qrCode.dynamicUpiHint", {
												defaultValue:
													"When scanned, UPI apps will automatically pre-fill the exact invoice amount, payee name, and invoice reference.",
											})}
										</Typography>
									</Grid>
								)}

								{/* Custom URL input */}
								{qrCodeType === "CUSTOM_URL" && (
									<Grid item xs={12}>
										<Field
											name="qrCodeValue"
											label={t("qrCode.customUrlLabel", { defaultValue: "Payment Link or Website URL" })}
											placeholder={t("qrCode.customUrlPlaceholder", {
												defaultValue: "https://pay.stripe.com/... or https://yourdomain.com",
											})}
											component={TextFormField}
										/>
									</Grid>
								)}

								{/* Static Image Uploader */}
								{qrCodeType === "STATIC_IMAGE" && (
									<Grid item xs={12}>
										<Box
											sx={{
												border: "2px dashed",
												borderColor: qrCodeCustomImage ? "primary.main" : "grey.300",
												borderRadius: 2,
												p: 2,
												textAlign: "center",
												bgcolor: qrCodeCustomImage ? "rgba(25, 118, 210, 0.02)" : "grey.50",
											}}
										>
											{qrCodeCustomImage ? (
												<Box display="flex" alignItems="center" justifyContent="center" gap={2}>
													<Button
														variant="outlined"
														size="small"
														startIcon={<CloudUploadIcon />}
														onClick={() => fileInputRef.current?.click()}
														disabled={isUploading}
													>
														{t("qrCode.changeImage", { defaultValue: "Change QR Image" })}
													</Button>
													<Button
														variant="outlined"
														color="error"
														size="small"
														startIcon={<DeleteOutlineIcon />}
														onClick={handleRemoveImage}
													>
														{t("app.remove", { defaultValue: "Remove" })}
													</Button>
												</Box>
											) : (
												<Box>
													<CloudUploadIcon sx={{ fontSize: 32, color: "text.secondary", mb: 0.5 }} />
													<Typography variant="body2" fontWeight={600}>
														{t("qrCode.uploadPrompt", { defaultValue: "Upload your Payment QR code image" })}
													</Typography>
													<Typography variant="caption" color="text.secondary" display="block" mb={1}>
														{t("qrCode.uploadHint", { defaultValue: "PNG or JPG format (Max 5MB)" })}
													</Typography>
													<Button
														variant="contained"
														size="small"
														startIcon={<CloudUploadIcon />}
														onClick={() => fileInputRef.current?.click()}
														disabled={isUploading}
													>
														{isUploading
															? t("app.loading", { defaultValue: "Uploading..." })
															: t("qrCode.uploadButton", { defaultValue: "Upload QR Image" })}
													</Button>
												</Box>
											)}
											<input
												ref={fileInputRef}
												type="file"
												accept="image/png,image/jpeg,image/jpg,image/svg+xml"
												hidden
												onChange={handleImageChange}
											/>
										</Box>
										{uploadError && (
											<FormHelperText error sx={{ mt: 1 }}>
												{uploadError}
											</FormHelperText>
										)}
									</Grid>
								)}

							</Grid>
						</Grid>
					</Grid>
				)}
			</CardContent>
		</Card>
	);
};

export default QrCodeConfigField;
