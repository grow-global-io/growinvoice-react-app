import React, { useState } from "react";
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

const StoreLinkDialog = () => {
	const { open, handleClose } = useStoreLinkStore();
	const user = useAuthControllerStatus();
	const initialValues = {
		storeName: user?.data?.storeName || "",
	};
	const validationSchema = Yup.object().shape({
		storeName: Yup.string()
			.required("Store name is required")
			.test("uniqueStoreName", "Store name must be unique", async (value) => {
				if (!value) return true;
				return /^[a-zA-Z][a-zA-Z0-9_]{2,30}$/.test(value);
			}),
	});
	const create = useStoreControllerCreateUpdateStore();

	const handleSubmit = async (values: typeof initialValues) => {
		await create.mutateAsync({
			data: {
				storeName: values.storeName,
			},
		});
		user?.refetch();
	};

	const url = `${window.location.origin}/store/${user?.data?.storeName}`;
	const [copied, setCopied] = useState(false);

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
				title="Store Link"
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
										label="Store Name"
										placeholder="Enter your store name"
										component={TextFormField}
									/>
									<Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
										Save
									</Button>
								</Form>
							);
						}}
					</Formik>
				) : (
					<Box>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									label="Link"
									value={url}
									variant="outlined"
									fullWidth
									InputProps={{
										readOnly: true,
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<Button
									variant="outlined"
									onClick={handleCopyClick}
									startIcon={<LinkIcon />}
									disabled={copied}
								>
									{copied ? "Copied!" : "Copy Link"}
								</Button>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="body2" color="textSecondary">
									Share on social media:
								</Typography>
							</Grid>
							<Grid item xs={12} container spacing={1}>
								<Grid item>
									<FacebookShareButton url={url}>
										<IconButton aria-label="Facebook">
											<FacebookIcon />
										</IconButton>
									</FacebookShareButton>
								</Grid>
								<Grid item>
									<TwitterShareButton url={url}>
										<IconButton aria-label="Twitter">
											<TwitterIcon />
										</IconButton>
									</TwitterShareButton>
								</Grid>
								<Grid item>
									<EmailShareButton url={url}>
										<IconButton aria-label="Email">
											<EmailIcon />
										</IconButton>
									</EmailShareButton>
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
