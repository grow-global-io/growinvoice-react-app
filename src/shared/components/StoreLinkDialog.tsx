import { useState, useEffect } from "react";
import { useStoreLinkStore } from "../../store/storeLinkStore";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import AppDialogHeader from "../components/Dialog/AppDialogHeader";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import { TextFormField } from "./FormFields/TextFormField";
import { Box, Button, Grid, IconButton, TextField, Typography } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { EmailShareButton, FacebookShareButton, TwitterShareButton } from "react-share";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailIcon from "@mui/icons-material/Email";
import { useStoreControllerCreateUpdateStore } from "@api/services/store";
import { useAuthControllerStatus } from "@api/services/auth";
import { useAuthStore } from "@store/auth";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18s";

const StoreLinkDialog = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { refecthUser } = useAuthStore();
	const { open, handleClose } = useStoreLinkStore();
	const user = useAuthControllerStatus();
	const initialValues = {
		storeName: user?.data?.storeName || "",
	};
	const validationSchema = Yup.object().shape({
		storeName: Yup.string()
			.required(() => i18n.t("store.validation.nameRequired"))
			.test(
				"uniqueStoreName",
				() => i18n.t("store.validation.mustBeUnique"),
				async (value) => {
					if (!value) return true;
					return /^[a-zA-Z][a-zA-Z0-9_]{2,30}$/.test(value);
				},
			),
	});
	const create = useStoreControllerCreateUpdateStore();

	const handleSubmit = async (values: typeof initialValues) => {
		await create.mutateAsync({
			data: {
				storeName: values.storeName,
			},
		});
		user?.refetch();
		refecthUser();
	};

	const url = `${window.location.origin}/store/${user?.data?.storeName}`;
	const [copied, setCopied] = useState(false);

	// Refetch user data when dialog opens to ensure we have the latest storeName
	useEffect(() => {
		if (open) {
			user?.refetch();
			refecthUser();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const handleCopyClick = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 5000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
			<AppDialogHeader
				title={t("store.link", { defaultValue: "Store Link" })}
				handleClose={() => {
					handleClose ? handleClose() : useStoreLinkStore.setState({ open: false });
				}}
			/>

			<DialogContent>
				{!user?.data?.storeName ? (
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{() => {
							return (
								<Form>
									<Field
										name="storeName"
										label={t("store.name", { defaultValue: "Store Name" })}
										placeholder={t("store.namePlaceholder", {
											defaultValue: "Enter your store name",
										})}
										component={TextFormField}
									/>
									<Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
										{t("app.save", { defaultValue: "Save" })}
									</Button>
								</Form>
							);
						}}
					</Formik>
				) : (
					<Box>
						<Grid container spacing={2}>
							<Grid item xs={4} alignSelf="center">
								<img
									// qr generate for link
									src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + url}
									alt={t("store.qrCodeAlt", { defaultValue: "QR Code" })}
									style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
								/>
							</Grid>
							<Grid item xs={6} alignSelf="center">
								<Grid container spacing={1} justifyContent="center">
									<Grid item xs={12}>
										<TextField
											label={t("store.link", { defaultValue: "Link" })}
											value={url}
											variant="outlined"
											fullWidth
											InputProps={{
												readOnly: true,
												endAdornment: (
													<IconButton
														aria-label={t("store.copyLink", { defaultValue: "Copy link" })}
														onClick={() => {
															navigate(`/store/verify`);
															handleClose && handleClose();
														}}
													>
														<EditIcon />
													</IconButton>
												),
											}}
										/>
									</Grid>
									<Grid item xs={12}>
										<Box display="flex" gap={1} alignItems="center">
											<Button
												variant="outlined"
												onClick={handleCopyClick}
												startIcon={<LinkIcon />}
												disabled={copied}
											>
												{copied
													? t("store.copied", { defaultValue: "Copied!" })
													: t("store.copyLink", { defaultValue: "Copy Link" })}
											</Button>
											<Button
												variant="contained"
												color="primary"
												onClick={() => {
													navigate(`/product/productlist`);
													handleClose && handleClose();
												}}
											>
												{t("store.uploadProducts", { defaultValue: "Upload Products to Store" })}
											</Button>
										</Box>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="body2" color="textSecondary">
											{t("store.shareOnSocialMedia", { defaultValue: "Share on social media:" })}
										</Typography>
									</Grid>
									<Grid item xs={12} container spacing={1}>
										<Grid item>
											<FacebookShareButton url={url}>
												<IconButton aria-label={t("store.facebook", { defaultValue: "Facebook" })}>
													<FacebookIcon />
												</IconButton>
											</FacebookShareButton>
										</Grid>
										<Grid item>
											<TwitterShareButton url={url}>
												<IconButton aria-label={t("store.twitter", { defaultValue: "Twitter" })}>
													<TwitterIcon />
												</IconButton>
											</TwitterShareButton>
										</Grid>
										<Grid item>
											<EmailShareButton url={url}>
												<IconButton aria-label={t("store.email", { defaultValue: "Email" })}>
													<EmailIcon />
												</IconButton>
											</EmailShareButton>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default StoreLinkDialog;
