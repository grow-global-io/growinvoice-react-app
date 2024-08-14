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
import Loader from "@shared/components/Loader";
import { CreateQuotationSettingsDto } from "@api/services/models";
import { useQueryClient } from "@tanstack/react-query";
import AddressExpressionsDialog from "@shared/components/AddressExpressionsDialog";
import {
	getQuotationsettingsControllerFindFirstQueryKey,
	useQuotationsettingsControllerCreate,
	useQuotationsettingsControllerFindFirst,
	useQuotationsettingsControllerRemove,
	useQuotationsettingsControllerUpdate,
} from "@api/services/quotationsettings";
import { useQuotationtemplateControllerFindAll } from "@api/services/quotationtemplate";

const CustomFormControlLabel = styled(FormControlLabel)(() => ({
	alignItems: "flex-start",
	margin: 0,
}));

const QuotationSettings = () => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const { open, handleClickOpen, handleClose } = useDialog();
	const quotationSettings = useQuotationsettingsControllerFindFirst();
	console.log(quotationSettings, "quotation setting");
	const quotationTemplates = useQuotationtemplateControllerFindAll();
	const quotationSettingCreate = useQuotationsettingsControllerCreate();
	const quotationSettingUpdate = useQuotationsettingsControllerUpdate();
	const deleteQuotationSetting = useQuotationsettingsControllerRemove();

	const initialValues: CreateQuotationSettingsDto = {
		quotationPrefix: quotationSettings?.data?.quotationPrefix ?? Constants?.quotationDefaultPrefix,
		autoArchive: quotationSettings?.data?.autoArchive ?? false,
		footer: quotationSettings?.data?.footer ?? "",
		dueNotice: quotationSettings?.data?.dueNotice ?? 0,
		overDueNotice: quotationSettings?.data?.overDueNotice ?? 0,
		companyAddressTemplate: quotationSettings?.data?.companyAddressTemplate ?? "",
		customerBillingAddressTemplate: quotationSettings?.data?.customerBillingAddressTemplate ?? "",
		customerShippingAddressTemplate: quotationSettings?.data?.customerShippingAddressTemplate ?? "",
		user_id: user?.id ?? "",
		quotationTemplateId: quotationSettings?.data?.quotationTemplateId ?? "",
		autoConvert: quotationSettings?.data?.autoConvert ?? false,
	};

	const schema: yup.Schema<CreateQuotationSettingsDto> = yup.object().shape({
		quotationPrefix: yup.string().required("Invoice Prefix is required"),
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
		quotationTemplateId: yup.string().required("Invoice Template ID is required"),
	});

	const handleSubmit = async (values: CreateQuotationSettingsDto) => {
		if (quotationSettings?.data) {
			await quotationSettingUpdate.mutateAsync({
				id: quotationSettings?.data?.id,
				data: values,
			});
		} else {
			await quotationSettingCreate.mutateAsync({
				data: values,
			});
		}
		queryClient.invalidateQueries({
			queryKey: getQuotationsettingsControllerFindFirstQueryKey(),
		});
	};

	const [currentTemplate, setCurrentTemplate] =
		useState<keyof CreateQuotationSettingsDto>("companyAddressTemplate");

	if (
		quotationSettings?.isLoading ||
		quotationSettings?.isRefetching ||
		quotationSettings?.isFetching ||
		quotationTemplates?.isLoading ||
		quotationTemplates?.isRefetching ||
		quotationTemplates?.isFetching
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
										name="quotationPrefix"
										label="Invoice Prefix"
										component={TextFormField}
										required={true}
										placeholder="Ex “QUO”"
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
								<Grid item xs={12} sm={6}>
									<Box>
										<Typography variant="h5">Auto Convert</Typography>
										<Field name="autoConvert" label="YES" component={CheckBoxFormField} />
										<Typography variant="body1" lineHeight={1.2}>
											Automatically convert estimates to invoices when Estimate is approved by
											customer..
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
											name="quotationTemplateId"
											value={formik.values.quotationTemplateId}
											onChange={(event) => {
												const { value } = event.target;
												formik.setFieldValue("quotationTemplateId", value);
											}}
										>
											{quotationTemplates?.data?.map((item, index) => (
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
									{quotationSettings?.data && (
										<Button
											color="error"
											variant="contained"
											onClick={async () => {
												await deleteQuotationSetting.mutateAsync({
													id: quotationSettings?.data?.id ?? "",
												});
												queryClient.invalidateQueries({
													queryKey: getQuotationsettingsControllerFindFirstQueryKey(),
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

export default QuotationSettings;
