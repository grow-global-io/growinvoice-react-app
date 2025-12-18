import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, getIn } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "@store/auth";
import {
	useMailControllerPromotional,
	type SendPromotionalMailDto,
} from "@api/services/promotionalMail";
import {
	Box,
	Button,
	Typography,
	Paper,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Tooltip,
	CircularProgress,
	Autocomplete,
	TextField,
} from "@mui/material";
import { useUserControllerGetUsersList, useUserControllerUserCount } from "@api/services/users";
import { PromotionalEmailRichTextEditor } from "./PromotionalEmailRichTextEditor";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AlertService } from "@shared/services/AlertService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionIcon from "@mui/icons-material/Description";

// Promotional Email Template Generator
const generatePromotionalEmailTemplate = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f4ff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 20px; background: #667eea;">
              <!-- Replace YOUR_LOGO_CID with the actual CID from uploaded image -->
              <!-- <img src="cid:YOUR_LOGO_CID" alt="Logo" style="max-width: 120px; height: auto;" /> -->
              <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 28px; text-align: center;">Special Offer Just for You!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;" align="center">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">🎉 Big Sale - 50% Off Everything!</h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
                We're excited to offer you an exclusive discount on all our products.<br />
                This is a limited-time offer, so don't miss out!
              </p>
              
              <div style="background: rgba(255,255,255,0.5); padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 400px; text-align: center;">
                <p style="color: #666666; font-size: 16px; line-height: 1.8; margin: 0; text-align: center;">
                  ✨ What's included:<br />
                  Free shipping on all orders<br />
                  30-day money-back guarantee<br />
                  Priority customer support
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                        <tr>
                          <td align="center" bgcolor="#764ba2" style="border-radius: 50px;">
                            <a href="https://go.growinvoice.com" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 50px;">
                              Shop Now
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: rgba(0,0,0,0.05); text-align: center;">
              <p style="color: #999999; font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                Thanks for being a valued customer!
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0; text-align: center;">
                &copy; 2025 Your Company. All rights reserved.<br />
                <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const PromotionalEmailPage = () => {
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const { mutate: sendMail, isPending } = useMailControllerPromotional();
	const [isUploading, setIsUploading] = useState(false);

	const { data: users, isLoading: isLoadingUsers } = useUserControllerGetUsersList();
	const { data: totalUserCount } = useUserControllerUserCount();

	useEffect(() => {
		// Critical security check as per requirements
		if (user?.email !== "admin@growinvoice.com") {
			AlertService.instance.errorMessage(
				"Access Denied: You are not authorized to view this page.",
			);
			navigate("/");
		}
	}, [user?.email, navigate]);

	const initialValues: SendPromotionalMailDto = {
		subject: "",
		html: "",
		sendToAllCustomers: false,
		customerIds: [],
		attachments: [],
	};

	const validationSchema = Yup.object({
		subject: Yup.string().required("Subject is required"),
		html: Yup.string().required("Email body is required"),
		sendToAllCustomers: Yup.boolean(),
		customerIds: Yup.array().when("sendToAllCustomers", {
			is: false,
			then: (schema) => schema.min(1, "Please select at least one customer"),
			otherwise: (schema) => schema.notRequired(),
		}),
	});

	const convertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.readAsDataURL(file);
			fileReader.onload = () => {
				const result = fileReader.result as string;
				// Strip the prefix (e.g., "data:image/png;base64,")
				const base64Content = result.split(",")[1];
				resolve(base64Content);
			};
			fileReader.onerror = (error) => {
				reject(error);
			};
		});
	};

	const generateCID = (filename: string): string => {
		return `${filename.replace(/\./g, "_")}_${Date.now()}@growinvoice`;
	};

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
		setFieldValue: (field: string, value: any) => void,
		currentAttachments: any[],
	) => {
		if (event.target.files) {
			setIsUploading(true);
			const files = Array.from(event.target.files);
			const newAttachments = [...(currentAttachments || [])];

			for (const file of files) {
				try {
					const base64Content = await convertToBase64(file);
					const cid = generateCID(file.name);
					newAttachments.push({
						filename: file.name,
						content: base64Content,
						contentType: file.type,
						cid: cid,
					});
					toast.success(`Added ${file.name}`);
				} catch (error) {
					console.error("Error converting file to base64:", error);
					toast.error(`Failed to attach ${file.name}`);
				}
			}
			setFieldValue("attachments", newAttachments);
			// Reset the input value to allow re-uploading the same file
			event.target.value = "";
			setIsUploading(false);
		}
	};

	const removeAttachment = (
		index: number,
		setFieldValue: (field: string, value: any) => void,
		currentAttachments: any[],
	) => {
		const newAttachments = [...currentAttachments];
		newAttachments.splice(index, 1);
		setFieldValue("attachments", newAttachments);
	};

	const handleSubmit = (values: SendPromotionalMailDto, { setSubmitting }: any) => {
		const confirmed = window.confirm(
			"⚠️ WARNING: You are about to send a promotional email to the selected recipients!\n\nAre you sure you want to proceed?",
		);
		if (!confirmed) {
			setSubmitting(false);
			return;
		}

		sendMail(
			{ data: values },
			{
				onSuccess: () => {
					toast.success("Promotional email blast sent successfully!");
					setSubmitting(false);
				},
				onError: (error: any) => {
					console.error("Failed to send mail", error);
					setSubmitting(false);
				},
			},
		);
	};

	if (user?.email !== "admin@growinvoice.com") {
		return null;
	}

	return (
		<Paper sx={{ p: 4, m: 2 }}>
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				enableReinitialize
				onSubmit={handleSubmit}
			>
				{({ values, setFieldValue, isSubmitting, touched, errors }) => (
					<>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 3,
							}}
						>
							<Typography variant="h4">📢 Send Promotional Email</Typography>
							<Button
								variant="outlined"
								startIcon={<DescriptionIcon />}
								onClick={() => {
									setFieldValue("html", generatePromotionalEmailTemplate());
									setFieldValue("subject", "Special Offer Just for You!");
									toast.success("Template loaded! Customize it as needed.");
								}}
								sx={{ textTransform: "none" }}
							>
								Load Template
							</Button>
						</Box>
						<Form>
							<Grid container spacing={4}>
								<Grid item xs={12}>
									<Field
										component={TextFormField}
										name="subject"
										label="Email Subject"
										placeholder="Enter the subject line"
										fullWidth
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										component={PromotionalEmailRichTextEditor}
										name="html"
										label="Email Body (HTML)"
										editorOptions={{
											height: 400,
											buttonList: [
												["undo", "redo"],
												["font", "fontSize", "formatBlock"],
												["bold", "underline", "italic", "strike", "subscript", "superscript"],
												["fontColor", "hiliteColor", "textStyle"],
												["removeFormat"],
												["outdent", "indent"],
												["align", "horizontalRule", "list", "lineHeight"],
												["table", "link", "image", "video"],
												["fullScreen", "showBlocks", "codeView"],
												["preview", "print"],
											],
										}}
									/>
								</Grid>

								<Grid item xs={12}>
									<Box
										sx={{ border: "1px dashed #ccc", p: 3, borderRadius: 2, textAlign: "center" }}
									>
										<Typography variant="h6" gutterBottom>
											Attachments
										</Typography>
										<input
											accept="*/*"
											style={{ display: "none" }}
											id="raised-button-file"
											multiple
											type="file"
											onChange={(e) => handleFileChange(e, setFieldValue, values.attachments || [])}
										/>
										<label htmlFor="raised-button-file">
											<Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
												Upload Files
											</Button>
										</label>
										{isUploading && (
											<Box sx={{ display: "inline-flex", ml: 2, alignItems: "center" }}>
												<CircularProgress size={24} />
												<Typography variant="body2" sx={{ ml: 1 }}>
													Uploading...
												</Typography>
											</Box>
										)}

										{values.attachments && values.attachments.length > 0 && (
											<>
												<Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
													💡 <strong>Tip:</strong> Copy the CID below and use it in your HTML as{" "}
													<code
														style={{
															background: "#f5f5f5",
															padding: "2px 4px",
															borderRadius: "3px",
														}}
													>
														&lt;img src="cid:YOUR_CID" /&gt;
													</code>
												</Typography>
												<List sx={{ mt: 2, maxWidth: 800, mx: "auto" }}>
													{values.attachments.map((file, index) => (
														<ListItem
															key={index}
															sx={{
																bgcolor: "background.paper",
																mb: 2,
																borderRadius: 1,
																border: "1px solid #eee",
																flexDirection: "column",
																alignItems: "flex-start",
																p: 2,
															}}
														>
															<Box
																sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1 }}
															>
																<AttachFileIcon sx={{ mr: 2, color: "text.secondary" }} />
																<ListItemText
																	primary={file.filename}
																	secondary={file.contentType}
																	primaryTypographyProps={{ noWrap: true }}
																	sx={{ flex: 1 }}
																/>
																<IconButton
																	edge="end"
																	aria-label="delete"
																	onClick={() =>
																		removeAttachment(index, setFieldValue, values.attachments || [])
																	}
																>
																	<DeleteIcon color="error" />
																</IconButton>
															</Box>
															<Box
																sx={{
																	width: "100%",
																	bgcolor: "#f8f9fa",
																	p: 1.5,
																	borderRadius: 1,
																	display: "flex",
																	alignItems: "center",
																	justifyContent: "space-between",
																}}
															>
																<Box sx={{ flex: 1, mr: 2 }}>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																		display="block"
																	>
																		Content ID (CID):
																	</Typography>
																	<Typography
																		variant="body2"
																		sx={{
																			fontFamily: "monospace",
																			wordBreak: "break-all",
																			color: "primary.main",
																		}}
																	>
																		{file.cid}
																	</Typography>
																</Box>
																<Tooltip title="Copy CID">
																	<IconButton
																		size="small"
																		color="primary"
																		onClick={() => {
																			navigator.clipboard.writeText(file.cid || "");
																			toast.success("CID copied to clipboard!");
																		}}
																	>
																		<ContentCopyIcon fontSize="small" />
																	</IconButton>
																</Tooltip>
															</Box>
														</ListItem>
													))}
												</List>
											</>
										)}
									</Box>
								</Grid>

								<Grid item xs={12}>
									<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
										Recipient Selection
									</Typography>
									<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
										<Grid container spacing={3}>
											<Grid item xs={12}>
												<Box display="flex" alignItems="center">
													<Field
														component={CheckBoxFormField}
														name="sendToAllCustomers"
														label={`📢 Send to ALL ${totalUserCount !== undefined ? `${totalUserCount} ` : ""}customers globally`}
													/>
												</Box>
												<Typography
													variant="caption"
													color="textSecondary"
													sx={{ ml: 4, display: "block" }}
												>
													{values.sendToAllCustomers
														? "This will blast the email to every customer in your database."
														: "Select specific customers below."}
												</Typography>
											</Grid>

											{!values.sendToAllCustomers && (
												<Grid item xs={12}>
													<Autocomplete
														multiple
														id="user-selection"
														options={users || []}
														loading={isLoadingUsers}
														noOptionsText={
															isLoadingUsers
																? "Loading users..."
																: users && users.length === 0
																	? "No users found in database"
																	: "No users match your search"
														}
														getOptionLabel={(option: any) => {
															if (!option) return "";
															const name = option.name || option.storeName || "Unknown User";
															const email = option.email ? ` (${option.email})` : "";
															return `${name}${email}`;
														}}
														isOptionEqualToValue={(option: any, value: any) =>
															option.id === value.id
														}
														value={
															users?.filter((u: any) => values.customerIds?.includes(u.id)) || []
														}
														onChange={(_, newValue) => {
															setFieldValue(
																"customerIds",
																newValue.map((u: any) => u.id),
															);
														}}
														renderInput={(params) => (
															<TextField
																{...params}
																label="Select Specific Recipients"
																placeholder="Search by name or email"
																error={
																	!!(getIn(touched, "customerIds") && getIn(errors, "customerIds"))
																}
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{isLoadingUsers ? (
																				<CircularProgress color="inherit" size={20} />
																			) : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
													/>
													<ErrorMessage name="customerIds">
														{(msg) => (
															<Typography variant="caption" color="error">
																{msg}
															</Typography>
														)}
													</ErrorMessage>
												</Grid>
											)}
										</Grid>
									</Paper>
								</Grid>

								<Grid item xs={12}>
									<Button
										variant="contained"
										color="error"
										size="large"
										type="submit"
										disabled={isSubmitting || isPending}
										sx={{ minWidth: 200 }}
									>
										{isPending
											? "Sending..."
											: values.sendToAllCustomers
												? `🚀 SEND BLAST TO ${totalUserCount ?? "EVERYONE"} RECIPIENTS`
												: `📤 SEND TO ${values.customerIds?.length || 0} RECIPIENTS`}
									</Button>
								</Grid>
							</Grid>
						</Form>
					</>
				)}
			</Formik>
		</Paper>
	);
};

export default PromotionalEmailPage;
