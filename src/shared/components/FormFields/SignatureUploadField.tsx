import React, { useRef, useState } from "react";
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
import { useUploadControllerUploadFile } from "@api/services/upload";
import { TextFormField } from "./TextFormField";
import DrawIcon from "@mui/icons-material/Draw";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface SignatureUploadFieldProps {
	name?: string;
	title?: string;
	subtitle?: string;
	defaultSignatureUrl?: string | null;
	isInvoiceOverride?: boolean;
}

export const SignatureUploadField: React.FC<SignatureUploadFieldProps> = ({
	name = "signature",
	title,
	subtitle,
	defaultSignatureUrl,
	isInvoiceOverride = false,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { values, setFieldValue } = useFormikContext<any>();
	const { mutateAsync: uploadFile, isPending: isUploading } = useUploadControllerUploadFile();

	const [uploadError, setUploadError] = useState<string | null>(null);

	const currentSignature = values[name] || (isInvoiceOverride ? defaultSignatureUrl : "");
	const showSignature = values.showSignature !== undefined ? values.showSignature : true;
	const signaturePosition = values.signaturePosition || "BOTTOM_RIGHT";

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setUploadError(null);
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate type
		const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
		if (!allowedTypes.includes(file.type)) {
			setUploadError(
				t("signature.invalidFileType", {
					defaultValue: "Only PNG, JPG, JPEG, and SVG images are supported.",
				}),
			);
			return;
		}

		// Validate size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setUploadError(
				t("signature.maxFileSize", {
					defaultValue: "File size must be under 5MB.",
				}),
			);
			return;
		}

		try {
			const res = await uploadFile({ data: { file } });
			if (res?.link) {
				setFieldValue(name, res.link);
				setFieldValue("showSignature", true);
				return;
			}
		} catch (err: any) {
			console.warn("Server upload failed, falling back to local base64 data URL:", err);
			// Fallback to FileReader data URL so the user is never blocked
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				if (result) {
					setFieldValue(name, result);
					setFieldValue("showSignature", true);
				}
			};
			reader.onerror = () => {
				setUploadError(
					t("signature.uploadFailed", {
						defaultValue: "Failed to load image. Please try again with another file.",
					}),
				);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveSignature = () => {
		setFieldValue(name, "");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const positionOptions = [
		{ value: "BOTTOM_RIGHT", label: t("signature.positionBottomRight", { defaultValue: "Bottom Right (Standard)" }) },
		{ value: "BOTTOM_LEFT", label: t("signature.positionBottomLeft", { defaultValue: "Bottom Left" }) },
		{ value: "BOTTOM_CENTER", label: t("signature.positionBottomCenter", { defaultValue: "Bottom Center" }) },
	];

	return (
		<Card
			variant="outlined"
			sx={{
				borderRadius: 2,
				borderColor: "divider",
				bgcolor: "background.paper",
				overflow: "hidden",
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
							<DrawIcon />
						</Box>
						<Box>
							<Typography variant="h5" fontWeight={700}>
								{title || t("signature.title", { defaultValue: "Digital Signature" })}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{subtitle ||
									t("signature.subtitle", {
										defaultValue: "Upload your digital signature to appear on generated PDF invoices.",
									})}
							</Typography>
						</Box>
					</Box>

					{/* Enable / Show Signature Toggle */}
					<FormControlLabel
						control={
							<Switch
								checked={showSignature}
								onChange={(e) => setFieldValue("showSignature", e.target.checked)}
								color="primary"
							/>
						}
						label={
							<Typography variant="subtitle2" fontWeight={600}>
								{t("signature.enableOnInvoice", { defaultValue: "Show on Invoices" })}
							</Typography>
						}
					/>
				</Box>

				{showSignature && (
					<Grid container spacing={3} mt={0.5}>
						{/* Signature Preview & Upload Box */}
						<Grid item xs={12} md={5}>
							<Typography variant="subtitle2" fontWeight={600} mb={1}>
								{t("signature.signatureImage", { defaultValue: "Signature Image" })}
							</Typography>

							<Box
								sx={{
									border: "2px dashed",
									borderColor: currentSignature ? "primary.main" : "grey.300",
									borderRadius: 2,
									p: 2,
									textAlign: "center",
									bgcolor: currentSignature ? "rgba(25, 118, 210, 0.02)" : "grey.50",
									minHeight: "160px",
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									alignItems: "center",
									position: "relative",
									transition: "all 0.2s ease",
								}}
							>
								{currentSignature ? (
									<Box sx={{ width: "100%", textAlign: "center" }}>
										<Box
											sx={{
												bgcolor: "#fff",
												p: 1.5,
												borderRadius: 1,
												border: "1px solid",
												borderColor: "divider",
												display: "inline-block",
												maxWidth: "100%",
												mb: 1.5,
											}}
										>
											<img
												src={currentSignature}
												alt="Digital Signature"
												style={{
													maxHeight: "80px",
													maxWidth: "100%",
													objectFit: "contain",
													display: "block",
													margin: "0 auto",
												}}
											/>
										</Box>
										<Box display="flex" justifyContent="center" gap={1}>
											<Button
												variant="outlined"
												size="small"
												startIcon={<CloudUploadIcon />}
												onClick={() => fileInputRef.current?.click()}
												disabled={isUploading}
											>
												{t("signature.change", { defaultValue: "Change" })}
											</Button>
											<Button
												variant="outlined"
												color="error"
												size="small"
												startIcon={<DeleteOutlineIcon />}
												onClick={handleRemoveSignature}
											>
												{t("app.remove", { defaultValue: "Remove" })}
											</Button>
										</Box>
									</Box>
								) : (
									<Box>
										<CloudUploadIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
										<Typography variant="body2" fontWeight={600} gutterBottom>
											{t("signature.uploadPrompt", {
												defaultValue: "Click to upload your digital signature",
											})}
										</Typography>
										<Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
											{t("signature.uploadHint", {
												defaultValue: "PNG with transparent background recommended (Max 5MB)",
											})}
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
												: t("signature.uploadButton", { defaultValue: "Upload Signature" })}
										</Button>
									</Box>
								)}

								<input
									ref={fileInputRef}
									type="file"
									accept="image/png,image/jpeg,image/jpg,image/svg+xml"
									hidden
									onChange={handleFileChange}
								/>
							</Box>

							{uploadError && (
								<FormHelperText error sx={{ mt: 1 }}>
									{uploadError}
								</FormHelperText>
							)}
						</Grid>

						{/* Signatory Details & Alignment */}
						<Grid item xs={12} md={7}>
							<Grid container spacing={2}>
								{/* Signatory Name */}
								<Grid item xs={12} sm={6}>
									<Field
										name="signatoryName"
										label={t("signature.signatoryName", { defaultValue: "Signatory Name / Person" })}
										placeholder={t("signature.signatoryNamePlaceholder", { defaultValue: "e.g. John Doe" })}
										component={TextFormField}
									/>
								</Grid>

								{/* Signatory Designation */}
								<Grid item xs={12} sm={6}>
									<Field
										name="signatoryTitle"
										label={t("signature.signatoryTitle", { defaultValue: "Designation / Title" })}
										placeholder={t("signature.signatoryTitlePlaceholder", { defaultValue: "e.g. Authorized Signatory / Director" })}
										component={TextFormField}
									/>
								</Grid>

								{/* Position Selector */}
								<Grid item xs={12}>
									<FormControl fullWidth size="medium">
										<InputLabel id="signature-position-label">
											{t("signature.position", { defaultValue: "Signature Position on Invoice" })}
										</InputLabel>
										<Select
											labelId="signature-position-label"
											value={signaturePosition}
											label={t("signature.position", { defaultValue: "Signature Position on Invoice" })}
											onChange={(e) => setFieldValue("signaturePosition", e.target.value)}
										>
											{positionOptions.map((opt) => (
												<MenuItem key={opt.value} value={opt.value}>
													{opt.label}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>


							</Grid>
						</Grid>
					</Grid>
				)}
			</CardContent>
		</Card>
	);
};

export default SignatureUploadField;
