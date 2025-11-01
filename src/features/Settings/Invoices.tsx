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
import {
	CreateInvoiceSettingsDto,
	InvoiceSettingsDtoInvoiceHeadingType,
} from "@api/services/models";
import { useInvoicetemplateControllerFindAll } from "@api/services/invoicetemplate";
import { useQueryClient } from "@tanstack/react-query";
import AddressExpressionsDialog from "@shared/components/AddressExpressionsDialog";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { useTranslation } from "react-i18next";

const CustomFormControlLabel = styled(FormControlLabel)(() => ({
	alignItems: "flex-start",
	margin: 0,
}));

const Invoices = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const { open, handleClickOpen, handleClose } = useDialog();
	const invoiceSettings = useInvoicesettingsControllerFindFirst();
	const invoiceTemplates = useInvoicetemplateControllerFindAll();
	const invoiceSettingCreate = useInvoicesettingsControllerCreate();
	const invoiceSettingUpdate = useInvoicesettingsControllerUpdate();
	const deleteInvoiceSetting = useInvoicesettingsControllerRemove();

	const initialValues: CreateInvoiceSettingsDto = {
		invoiceHeadingType: invoiceSettings?.data?.invoiceHeadingType ?? "COMPANY_NAME",
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
		invoicePrefix: yup.string().required(t("settings.invoice.validation.invoicePrefixRequired")),
		autoArchive: yup.boolean().required(t("settings.invoice.validation.autoArchiveRequired")),
		footer: yup.string().nullable(),
		dueNotice: yup.number().required(t("settings.invoice.validation.dueNoticeRequired")),
		overDueNotice: yup.number().required(t("settings.invoice.validation.overdueNoticeRequired")),
		companyAddressTemplate: yup.string().required(),
		customerBillingAddressTemplate: yup.string().required(),
		customerShippingAddressTemplate: yup.string().required(),
		user_id: yup.string().required(t("settings.invoice.validation.userIdRequired")),
		invoiceTemplateId: yup.string().required(t("settings.invoice.validation.templateIdRequired")),
		invoiceHeadingType: yup
			.string()
			.oneOf(
				Object.values(InvoiceSettingsDtoInvoiceHeadingType),
				t("settings.invoice.validation.invalidHeadingType"),
			)
			.required(t("settings.invoice.validation.invoiceHeadingTypeRequired")),
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
								<Grid item xs={12}>
									<Field
										name="invoiceHeadingType"
										label={t("settings.invoice.invoiceHeadingType")}
										component={AutocompleteField}
										options={Object.values(InvoiceSettingsDtoInvoiceHeadingType).map((type) => ({
											label: t(`settings.invoice.headingTypes.${type}`, {
												defaultValue: type.replace(/_/g, " "),
											}),
											value: type,
										}))}
									/>
								</Grid>
								<Grid item xs={12} sm={6} display={"flex"} alignItems={"center"}>
									<Field
										name="invoicePrefix"
										label={t("settings.invoice.invoicePrefix")}
										component={TextFormField}
										required={true}
										placeholder={t("settings.invoice.invoicePrefixPlaceholder", {
											defaultValue: "Ex \u201CINV\u201D",
										})}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Box>
										<Typography variant="h5">{t("settings.invoice.autoArchive")}</Typography>
										<Field
											name="autoArchive"
											label={t("common.yes", { defaultValue: "YES" })}
											component={CheckBoxFormField}
										/>
										<Typography variant="body1" lineHeight={1.2}>
											{t("settings.invoice.autoArchiveHelp", {
												defaultValue:
													"Enable this if you wish to auto archive approved or rejected estimates after 30 days.",
											})}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12}>
									<Field
										name="footer"
										label={t("settings.invoice.footer")}
										component={RichTextEditor}
										required={true}
									/>
								</Grid>
								<Grid item xs={12}>
									<Divider />
								</Grid>
								<SettingFormHeading
									heading={t("settings.invoice.dueNotices")}
									icon={Constants.customImages.OrangeNoticeIcon}
									text={t("settings.invoice.dueNoticesHelp")}
								/>
								<Grid item xs={6}>
									<Field
										name="dueNotice"
										label={t("settings.invoice.dueNoticeInDays")}
										component={TextFormField}
										required={true}
										placeholder={t("settings.invoice.daysBeforeDue", {
											defaultValue: "x days before due date",
										})}
										type="number"
									/>
								</Grid>

								<SettingFormHeading
									heading={t("settings.invoice.overdueNotices")}
									icon={Constants.customImages.redNoticeIcon}
									text={t("settings.invoice.overdueNoticesHelp")}
								/>
								<Grid item xs={6}>
									<Field
										name="overDueNotice"
										label={t("settings.invoice.overdueNoticeInDays")}
										component={TextFormField}
										required={true}
										placeholder={t("settings.invoice.daysBeforeDue", {
											defaultValue: "x days before due date",
										})}
										type="number"
									/>
								</Grid>

								<Grid item xs={12}>
									<Divider />
								</Grid>
								<SettingFormHeading
									heading={t("settings.invoice.addresses")}
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
											{t("settings.invoice.showTemplates")}
										</Typography>
									</Box>
									<Field
										name="companyAddressTemplate"
										label={t("settings.invoice.companyAddressFormat")}
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
											{t("settings.invoice.showTemplates")}
										</Typography>
									</Box>
									<Field
										name="customerBillingAddressTemplate"
										label={t("settings.invoice.customerBillingAddressFormat")}
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
											{t("settings.invoice.showTemplates")}
										</Typography>
									</Box>
									<Field
										name="customerShippingAddressTemplate"
										label={t("settings.invoice.customerShippingAddressFormat")}
										component={RichTextEditor}
										required={true}
									/>
								</Grid>
								<Grid item xs={12}>
									<Divider />
								</Grid>
								<SettingFormHeading
									heading={t("settings.invoice.invoiceTemplates")}
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
										{t("settings.invoice.saveSettings")}
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
											{t("settings.invoice.resetSettings")}
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
