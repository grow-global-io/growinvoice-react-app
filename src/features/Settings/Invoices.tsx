import {
	Box,
	Divider,
	Grid,
	Typography,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { Formik, Field, Form } from "formik";
import * as yup from "yup";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { AddressExpressions, Constants } from "@shared/constants";
import SettingFormHeading from "./SettingFormHeading";
import { RichTextEditor } from "@shared/components/FormFields/RichTextEditor";
import { CheckBoxFormField } from "@shared/components/FormFields/CheckBoxFormField";
import { useDialog } from "@shared/hooks/useDialog";
import { useState } from "react";
import { useAuthStore } from "@store/auth";
import {
	getInvoicesettingsControllerFindFirstQueryKey,
	useInvoicesettingsControllerCreate,
	useInvoicesettingsControllerFindFirst,
	useInvoicesettingsControllerRemove,
	useInvoicesettingsControllerUpdate,
} from "@api/services/invoicesettings";
import Loader from "@shared/components/Loader";
import { CreateInvoiceSettingsDto } from "@api/services/models";
import { useInvoicetemplateControllerFindAll } from "@api/services/invoicetemplate";
import { useQueryClient } from "@tanstack/react-query";
import AddressExpressionsDialog from "@shared/components/AddressExpressionsDialog";

const CustomFormControlLabel = styled(FormControlLabel)(() => ({
	alignItems: "flex-start",
	margin: 0,
}));

const Invoices = () => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const { open, handleClickOpen, handleClose } = useDialog();
	const invoiceSettings = useInvoicesettingsControllerFindFirst();
	const invoiceTemplates = useInvoicetemplateControllerFindAll();
	const invoiceSettingCreate = useInvoicesettingsControllerCreate();
	const invoiceSettingUpdate = useInvoicesettingsControllerUpdate();
	const deleteInvoiceSetting = useInvoicesettingsControllerRemove();

	const initialValues: CreateInvoiceSettingsDto = {
		invoicePrefix: invoiceSettings?.data?.invoicePrefix ?? "INV",
		autoArchive: invoiceSettings?.data?.autoArchive ?? false,
		footer: invoiceSettings?.data?.footer ?? "",
		dueNotice: invoiceSettings?.data?.dueNotice ?? 0,
		overDueNotice: invoiceSettings?.data?.overDueNotice ?? 0,
		companyAddressTemplate: invoiceSettings?.data?.companyAddressTemplate ?? "",
		customerBillingAddressTemplate: invoiceSettings?.data?.customerBillingAddressTemplate ?? "",
		customerShippingAddressTemplate: invoiceSettings?.data?.customerShippingAddressTemplate ?? "",
		user_id: user?.id ?? "",
		invoiceTemplateId: invoiceSettings?.data?.invoiceTemplateId ?? "",
	};

	const schema: yup.Schema<CreateInvoiceSettingsDto> = yup.object().shape({
		invoicePrefix: yup.string().required("Invoice Prefix is required"),
		autoArchive: yup.boolean().required("Auto Archive is required"),
		footer: yup.string().nullable(),
		dueNotice: yup.number().required("Due Notice is required"),
		overDueNotice: yup.number().required("Overdue Notice is required"),
		companyAddressTemplate: yup.string().required("Company Address Template is required"),
		customerBillingAddressTemplate: yup
			.string()
			.required("Customer Billing Address Template is required"),
		customerShippingAddressTemplate: yup
			.string()
			.required("Customer Shipping Address Template is required"),
		user_id: yup.string().required("User ID is required"),
		invoiceTemplateId: yup.string().required("Invoice Template ID is required"),
	});

	const handleSubmit = async (values: CreateInvoiceSettingsDto) => {
		if (invoiceSettings?.data) {
			await invoiceSettingUpdate.mutateAsync({
				id: invoiceSettings?.data?.id,
				data: values,
			});
		} else {
			await invoiceSettingCreate.mutateAsync({
				data: values,
			});
		}
		queryClient.invalidateQueries({
			queryKey: getInvoicesettingsControllerFindFirstQueryKey(),
		});
	};

	const [currentTemplate, setCurrentTemplate] =
		useState<keyof CreateInvoiceSettingsDto>("companyAddressTemplate");

	if (
		invoiceSettings?.isLoading ||
		invoiceSettings?.isRefetching ||
		invoiceSettings?.isFetching ||
		invoiceTemplates?.isLoading ||
		invoiceTemplates?.isRefetching ||
		invoiceTemplates?.isFetching
	) {
		return <Loader />;
	}

	return (
		<>
			<Box>
				<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
					{(formik) => (
						<Form>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6} display={"flex"} alignItems={"center"}>
									<Field
										name="invoicePrefix"
										label="Invoice Prefix"
										component={TextFormField}
										required={true}
										placeholder="Ex “INV”"
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Box>
										<Typography variant="h5">Auto Archive</Typography>
										<Field name="autoArchive" label="YES" component={CheckBoxFormField} />
										<Typography variant="body1" lineHeight={1.2}>
											Enable this, If you wish to auto archive approved or rejected estimates after
											30 days.
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12}>
									<Field name="footer" label="Footer" component={RichTextEditor} required={true} />
								</Grid>
								<Grid item xs={12}>
									<Divider />
								</Grid>
								<SettingFormHeading
									heading="Due Notices"
									icon={Constants.customImages.OrangeNoticeIcon}
									text="Due reminders are sent to unpaid and partially paid invoices as reminders to the customer to pay the invoice before is due."
								/>
								<Grid item xs={6}>
									<Field
										name="dueNotice"
										label="Due Notice in Days"
										component={TextFormField}
										required={true}
										placeholder="x days before due date"
										type="number"
									/>
								</Grid>

								<SettingFormHeading
									heading="Overdue Notices"
									icon={Constants.customImages.redNoticeIcon}
									text="Due reminders are sent to unpaid and partially paid invoices as reminders to the customer to pay the invoice before is due."
								/>
								<Grid item xs={6}>
									<Field
										name="overDueNotice"
										label="Overdue Notice in Days"
										component={TextFormField}
										required={true}
										placeholder="x days before due date"
										type="number"
									/>
								</Grid>

								<Grid item xs={12}>
									<Divider />
								</Grid>
								<SettingFormHeading
									heading="Addresses"
									icon={Constants.customImages.BlueLocationIcon}
								/>
								<Grid item xs={12}>
									<Box
										onClick={() => {
											handleClickOpen();
											setCurrentTemplate("companyAddressTemplate");
										}}
									>
										<Typography variant="h5" mb={1} sx={{ cursor: "pointer" }}>
											Show Templates
										</Typography>
									</Box>
									<Field
										name="companyAddressTemplate"
										label="Company Address Format"
										component={RichTextEditor}
										required={true}
									/>
								</Grid>
								<Grid item xs={12}>
									<Box
										onClick={() => {
											handleClickOpen();
											setCurrentTemplate("customerBillingAddressTemplate");
										}}
									>
										<Typography variant="h5" mb={1} sx={{ cursor: "pointer" }}>
											Show Templates
										</Typography>
									</Box>
									<Field
										name="customerBillingAddressTemplate"
										label="Customer Billing Address Format"
										component={RichTextEditor}
										required={true}
									/>
								</Grid>
								<Grid item xs={12}>
									<Box
										onClick={() => {
											handleClickOpen();
											setCurrentTemplate("customerShippingAddressTemplate");
										}}
									>
										<Typography variant="h5" mb={1} sx={{ cursor: "pointer" }}>
											Show Templates
										</Typography>
									</Box>
									<Field
										name="customerShippingAddressTemplate"
										label="Customer Shipping Address Format"
										component={RichTextEditor}
										required={true}
									/>
								</Grid>
								<Grid item xs={12}>
									<Divider />
								</Grid>
								<SettingFormHeading
									heading="Invoice Templates"
									icon={Constants.customImages.TemplateIcon}
								/>
								<Grid item xs={12}>
									<FormControl component="fieldset">
										<RadioGroup
											row
											aria-label="invoice-template"
											name="invoiceTemplateId"
											value={formik.values.invoiceTemplateId}
											onChange={(event) => {
												const { value } = event.target;
												formik.setFieldValue("invoiceTemplateId", value);
											}}
										>
											{invoiceTemplates?.data?.map((item, index) => (
												<Grid item xs={12} sm={3} key={index}>
													<CustomFormControlLabel
														value={item.id}
														control={<Radio />}
														label={<img src={item.path ?? ""} width="100%" alt={item.name} />}
													/>
												</Grid>
											))}
										</RadioGroup>
									</FormControl>
								</Grid>
								<Grid item xs={12}>
									<Divider />
								</Grid>
								<Grid item xs={12} textAlign={"center"}>
									<Button type="submit" variant="contained">
										Save Settings
									</Button>
									{invoiceSettings?.data && (
										<Button
											color="error"
											variant="contained"
											onClick={async () => {
												await deleteInvoiceSetting.mutateAsync({
													id: invoiceSettings?.data?.id ?? "",
												});
												queryClient.invalidateQueries({
													queryKey: getInvoicesettingsControllerFindFirstQueryKey(),
												});
											}}
										>
											Reset Settings
										</Button>
									)}
								</Grid>
							</Grid>
							<AddressExpressionsDialog
								open={open}
								handleClose={handleClose}
								currentTemplate={currentTemplate as keyof AddressExpressions}
								fieldValue={(formik.values[currentTemplate] as string) ?? ""}
								handleChecked={(checked, label) => {
									if (checked) {
										formik?.setFieldValue(
											currentTemplate,
											`${formik?.values?.[currentTemplate]} ${label}`,
										);
									} else {
										formik?.setFieldValue(
											currentTemplate,
											formik?.values?.[currentTemplate]?.toString()?.replace(label, ""),
										);
									}
								}}
							/>
						</Form>
					)}
				</Formik>
			</Box>
		</>
	);
};

export default Invoices;
