import { Box, Typography, IconButton, Avatar, Popover, Button } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import type { UpdateCurrencyCompanyDto } from "@api/services/models";
import PaletteIcon from "@mui/icons-material/Palette";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useUploadControllerUploadFile } from "@api/services/upload";
import React, { useState, useRef } from "react";
import { SketchPicker, type ColorResult } from "react-color";

interface ExtendedFormValues extends UpdateCurrencyCompanyDto {
	storeLogo?: string;
	storeName?: string;
	storeLinkSlug?: string;
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
	const [fileSizeError, setFileSizeError] = useState<boolean>(false);
	const [docTypeError, setDocTypeError] = useState<boolean>(false);

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
		setDocTypeError(false);
		setFileSizeError(false);
		if (!event.target.files || !event.target.files[0]) return;
		const file = event.target.files[0];
		const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

		if (
			file.type !== "image/png" &&
			file.type !== "image/jpeg" &&
			file.type !== "image/jpg" &&
			file.type !== "image/svg+xml"
		) {
			setDocTypeError(true);
			return;
		}
		if (file.size > maxSizeInBytes) {
			setFileSizeError(true);
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

	// Get initial letter for avatar
	const getInitial = () => {
		if (values.storeLinkSlug) {
			return values.storeLinkSlug[0]?.toUpperCase() || "S";
		}
		if (values.companyName) {
			return values.companyName[0]?.toUpperCase() || "S";
		}
		return "S";
	};

	return (
		<Box>
			<Typography variant="h3" textAlign="left">
				{t("getStarted.branding.title", {
					defaultValue: "Brand your store",
				})}
			</Typography>
			<Typography variant="h6" my={2} color={"secondary.dark"} fontWeight={500} textAlign="left">
				{t("getStarted.branding.subtitle", {
					defaultValue: "Make your store uniquely yours",
				})}
			</Typography>

			{/* Store Logo */}
			<Box mt={3}>
				<Typography variant="h4" color="text.primary" sx={{ mb: 2, fontWeight: 500 }}>
					{t("getStarted.branding.storeLogo", {
						defaultValue: "Store Logo",
					}).toUpperCase()}
					<Typography variant="h5" color="error" component="span">
						{" *"}
					</Typography>
				</Typography>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 3,
						mt: 2.5,
					}}
				>
					<Avatar
						sx={{
							width: 100,
							height: 100,
							bgcolor: values.primaryBrandColor || defaultColors[1],
							fontSize: 40,
							fontWeight: "bold",
							border: 2,
							borderColor: "grey.200",
						}}
						src={values.storeLogo || undefined}
					>
						{!values.storeLogo && getInitial()}
					</Avatar>
					<Box sx={{ flex: 1 }}>
						<Button variant="outlined" component="label" disabled={isUploading} sx={{ mb: 1 }}>
							{t("app.uploadFile", { defaultValue: "Upload File" })}
							<input
								type="file"
								hidden
								accept="image/png,image/jpeg,image/jpg,image/svg+xml"
								onChange={handleLogoUpload}
							/>
						</Button>
						<Box sx={{ mt: 1.5 }}>
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
						{fileSizeError && (
							<Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
								{t("getStarted.branding.logoMaxSizeError", {
									defaultValue: "Maximum file size is 2MB",
								})}
							</Typography>
						)}
						{docTypeError && (
							<Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
								{t("upload.errors.invalidType", {
									defaultValue: "Only .png, .jpg, .jpeg, .svg files are allowed",
								})}
							</Typography>
						)}
					</Box>
				</Box>
			</Box>

			{/* Store Link */}
			<Box mt={4}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<LinkIcon sx={{ fontSize: 24, color: "primary.main" }} />
					<Typography variant="h6" fontWeight={600}>
						{t("getStarted.branding.storeLink", {
							defaultValue: "Store Link",
						})}
					</Typography>
				</Box>
				<Field
					name="storeLinkSlug"
					label={t("getStarted.branding.storeLinkLabel", {
						defaultValue: "Store Name",
					})}
					component={TextFormField}
					placeholder={t("getStarted.branding.storeLinkPlaceholder", {
						defaultValue: "Enter your store name",
					})}
				/>
				<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
					{t("getStarted.branding.storeLinkHelper", {
						defaultValue: "This will be your store URL: /store/your-store-name",
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
							bgcolor: values.primaryBrandColor || defaultColors[1],
							fontSize: 32,
							fontWeight: "bold",
						}}
						src={values.storeLogo || undefined}
					>
						{!values.storeLogo && getInitial()}
					</Avatar>
					<Box>
						<Typography variant="h6" fontWeight={600}>
							{values.storeLinkSlug ||
								values.companyName ||
								t("getStarted.branding.previewStoreName", {
									defaultValue: "Your Store Name",
								})}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default StoreBrandingForm;
