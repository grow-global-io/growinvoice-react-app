import { Box, Typography, IconButton, Avatar, Popover } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import PaletteIcon from "@mui/icons-material/Palette";
import AddIcon from "@mui/icons-material/Add";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useUploadControllerUploadFile } from "@api/services/upload";
import { useState, useRef } from "react";
import type React from "react";
import { SketchPicker, type ColorResult } from "react-color";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	storeLogo?: string;
	storeName?: string;
	tagline?: string;
	primaryBrandColor?: string;
}

const defaultColors = [
	"#9333ea", // purple
	"#3b82f6", // blue
	"#10b981", // green
	"#f59e0b", // orange
	"#ec4899", // pink
	"#ef4444", // red
	"#14b8a6", // teal
	"#6366f1", // indigo
];

const StoreBrandingForm = () => {
	const { t } = useTranslation();
	const { setFieldValue, values } = useFormikContext<ExtendedFormValues>();
	const [customColors, setCustomColors] = useState<string[]>([]);
	const [colorPickerOpen, setColorPickerOpen] = useState(false);
	const colorPickerAnchor = useRef<HTMLButtonElement>(null);
	const { mutateAsync: uploadFile, isPending: isUploading } = useUploadControllerUploadFile();

	const allColors = [...defaultColors, ...customColors];

	const handleColorSelect = (color: string) => {
		setFieldValue("primaryBrandColor", color);
	};

	const handleAddCustomColor = () => {
		setColorPickerOpen(true);
	};

	const handleColorPickerClose = () => {
		setColorPickerOpen(false);
	};

	const handleColorChange = (color: ColorResult) => {
		const hexColor = color.hex;
		setFieldValue("primaryBrandColor", hexColor);
		// Add to custom colors if not already in the list
		if (!allColors.includes(hexColor)) {
			setCustomColors([...customColors, hexColor]);
		}
	};

	const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files || !event.target.files[0]) return;
		const file = event.target.files[0];
		const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
		if (file.size > maxSizeInBytes) {
			alert(
				t("getStarted.branding.logoMaxSizeError", {
					defaultValue: "File size must be less than 2MB",
				}),
			);
			return;
		}
		try {
			const uploadRes = await uploadFile({
				data: {
					file,
				},
			});
			setFieldValue("storeLogo", uploadRes.link);
		} catch (error) {
			console.error("Error uploading logo:", error);
		}
	};

	return (
		<Box>
			<Typography variant="h3" textAlign="center">
				{t("getStarted.branding.title", {
					defaultValue: "Brand your store",
				})}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="center">
				{t("getStarted.branding.subtitle", {
					defaultValue: "Make your store uniquely yours",
				})}
			</Typography>

			{/* Store Logo */}
			<Box mt={3}>
				<Typography variant="h6" fontWeight={600} mb={2}>
					{t("getStarted.branding.storeLogo", {
						defaultValue: "Store Logo",
					})}
				</Typography>
				<Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
					<Box
						component="label"
						sx={{
							width: 120,
							height: 120,
							border: 2,
							borderColor: "grey.300",
							borderStyle: "dashed",
							borderRadius: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							position: "relative",
							overflow: "hidden",
							"&:hover": {
								borderColor: "primary.main",
							},
						}}
					>
						{values.storeLogo ? (
							<Box
								component="img"
								src={values.storeLogo}
								alt="Store Logo"
								sx={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
								}}
							/>
						) : (
							<UploadFileIcon sx={{ fontSize: 40, color: "grey.400" }} />
						)}
						<input
							type="file"
							accept="image/png,image/svg+xml,image/jpeg"
							onChange={handleLogoUpload}
							style={{ display: "none" }}
							disabled={isUploading}
						/>
					</Box>
					<Box>
						<Typography variant="body1" fontWeight={500} mb={1}>
							{t("getStarted.branding.uploadLogo", {
								defaultValue: "Upload your logo",
							})}
						</Typography>
						<Typography variant="body2" color="text.secondary" mb={0.5}>
							{t("getStarted.branding.logoRecommendation", {
								defaultValue: "Recommended: 512x512px, PNG or SVG",
							})}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{t("getStarted.branding.logoMaxSize", {
								defaultValue: "Max file size: 2MB",
							})}
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Store Name */}
			<Box mt={4}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<TextFieldsIcon sx={{ fontSize: 24, color: "primary.main" }} />
					<Typography variant="h6" fontWeight={600}>
						{t("getStarted.branding.storeName", {
							defaultValue: "Store Name",
						})}
					</Typography>
				</Box>
				<Field
					name="storeName"
					label={t("getStarted.branding.storeNameLabel", {
						defaultValue: "Store Name",
					})}
					component={TextFormField}
					placeholder={t("getStarted.branding.storeNamePlaceholder", {
						defaultValue: "My Awesome Store",
					})}
				/>
			</Box>

			{/* Tagline */}
			<Box mt={3}>
				<Typography variant="h6" fontWeight={600} mb={2}>
					{t("getStarted.branding.tagline", {
						defaultValue: "Tagline",
					})}
				</Typography>
				<Field
					name="tagline"
					label={t("getStarted.branding.taglineLabel", {
						defaultValue: "Tagline",
					})}
					component={TextFormField}
					placeholder={t("getStarted.branding.taglinePlaceholder", {
						defaultValue: "Quality products, delivered fast",
					})}
				/>
				<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
					{t("getStarted.branding.taglineHelper", {
						defaultValue: "A short description that appears below your store name",
					})}
				</Typography>
			</Box>

			{/* Primary Brand Color */}
			<Box mt={4}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<PaletteIcon sx={{ fontSize: 24, color: "primary.main" }} />
					<Typography variant="h6" fontWeight={600}>
						{t("getStarted.branding.primaryBrandColor", {
							defaultValue: "Primary Brand Color",
						})}
					</Typography>
				</Box>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
					{allColors.map((color, index) => {
						const isSelected = values.primaryBrandColor === color;
						return (
							<IconButton
								key={index}
								onClick={() => handleColorSelect(color)}
								sx={{
									width: 48,
									height: 48,
									border: isSelected ? 3 : 1,
									borderColor: isSelected ? "success.main" : "grey.300",
									borderRadius: "50%",
									backgroundColor: color,
									"&:hover": {
										borderColor: "primary.main",
										transform: "scale(1.1)",
									},
									transition: "all 0.2s",
								}}
							/>
						);
					})}
					<IconButton
						ref={colorPickerAnchor}
						onClick={handleAddCustomColor}
						sx={{
							width: 48,
							height: 48,
							border: 2,
							borderColor: "grey.300",
							borderStyle: "dashed",
							borderRadius: "50%",
							"&:hover": {
								borderColor: "primary.main",
								backgroundColor: "grey.50",
							},
						}}
					>
						<AddIcon />
					</IconButton>
				</Box>
				<Popover
					open={colorPickerOpen}
					anchorEl={colorPickerAnchor.current}
					onClose={handleColorPickerClose}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "left",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "left",
					}}
				>
					<Box
						sx={{
							p: 1,
							"& .sketch-picker": {
								boxShadow: "none !important",
							},
						}}
					>
						<SketchPicker
							color={values.primaryBrandColor || defaultColors[0]}
							onChange={handleColorChange}
							disableAlpha={false}
						/>
					</Box>
				</Popover>
			</Box>

			{/* Preview */}
			<Box mt={4}>
				<Typography variant="h6" fontWeight={600} mb={2} textTransform="uppercase">
					{t("getStarted.branding.preview", {
						defaultValue: "Preview",
					})}
				</Typography>
				<Box
					sx={{
						p: 3,
						border: 1,
						borderColor: "grey.300",
						borderRadius: 2,
						display: "flex",
						alignItems: "center",
						gap: 2,
					}}
				>
					<Avatar
						sx={{
							width: 64,
							height: 64,
							bgcolor: values.primaryBrandColor || defaultColors[0],
							fontSize: 32,
							fontWeight: "bold",
						}}
					>
						{values.storeName?.[0]?.toUpperCase() || "S"}
					</Avatar>
					<Box>
						<Typography variant="h6" fontWeight={600}>
							{values.storeName ||
								t("getStarted.branding.previewStoreName", {
									defaultValue: "Your Store Name",
								})}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{values.tagline ||
								t("getStarted.branding.previewTagline", {
									defaultValue: "Your tagline goes here",
								})}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default StoreBrandingForm;
