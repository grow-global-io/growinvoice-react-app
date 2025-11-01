import { type CreatePaymentDetailsDto, CreatePaymentDetailsDtoPaymentType } from "@api/services/models";
import { Box, Button, Grid } from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useAuthStore } from "@store/auth";
import * as yup from "yup";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import {
	getPaymentdetailsControllerFindAllQueryKey,
	usePaymentdetailsControllerCreate,
	usePaymentdetailsControllerFindOne,
	usePaymentdetailsControllerUpdate,
} from "@api/services/paymentdetails";
import { useQueryClient } from "@tanstack/react-query";
import {
	getInvoiceControllerFindAllQueryKey,
	getInvoiceControllerFindDueInvoicesQueryKey,
	getInvoiceControllerFindPaidInvoicesQueryKey,
} from "@api/services/invoice";
import Loader from "@shared/components/Loader";
import { convertToReadableText } from "@shared/formatter";
import { useTranslation } from "react-i18next";

const PaymentDetailsForm = ({
	handleClose,
	paymentId,
}: {
	handleClose: () => void;
	paymentId?: string;
}) => {
	const { t, i18n } = useTranslation();
	const updatePayment = usePaymentdetailsControllerUpdate();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const createPayment = usePaymentdetailsControllerCreate();
	const editPayment = usePaymentdetailsControllerFindOne(paymentId ?? "", {
		query: {
			enabled: !!paymentId,
		},
	});

	const validationSchema: yup.Schema<CreatePaymentDetailsDto> = yup.object().shape({
		paymentType: yup
			.string()
			.required(() =>
				i18n.t("paymentDetails.validation.paymentTypeRequired", {
					defaultValue: "Payment type is required",
				}),
			)
			.oneOf(Object.values(CreatePaymentDetailsDtoPaymentType), "Invalid Type"),
		account_no: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "IndianBank")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.accountNumberRequired", {
						defaultValue: "Account number is required",
					}),
				);
			}
			return schema;
		}),
		bicNumber: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "EuropeanBank")) {
				return schema; // BIC number is optional
			}
			return schema;
		}),
		ibanNumber: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "EuropeanBank")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.ibanRequired", {
						defaultValue: "IBAN number is required",
					}),
				);
			}
			return schema;
		}),
		ifscCode: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "IndianBank")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.ifscRequired", {
						defaultValue: "IFSC code is required",
					}),
				);
			}
			return schema;
		}),
		mollieId: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "Mollie")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.mollieRequired", {
						defaultValue: "Mollie ID is required",
					}),
				);
			}
			return schema;
		}),
		paypalId: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "Paypal")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.paypalRequired", {
						defaultValue: "Paypal ID is required",
					}),
				);
			}
			return schema;
		}),
		razorpayId: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "Razorpay")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.razorpayRequired", {
						defaultValue: "Razorpay ID is required",
					}),
				);
			}
			return schema;
		}),
		stripeId: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "Stripe")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.stripeRequired", {
						defaultValue: "Stripe ID is required",
					}),
				);
			}
			return schema;
		}),
		swiftCode: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "SwiftCode")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.swiftRequired", {
						defaultValue: "Swift code is required",
					}),
				);
			}
			return schema;
		}),
		upiId: yup.string().when("paymentType", (paymentType, schema) => {
			if (paymentType.find((item) => item === "UPI")) {
				return schema.required(() =>
					i18n.t("paymentDetails.validation.upiRequired", { defaultValue: "UPI ID is required" }),
				);
			}
			return schema;
		}),

		user_id: yup
			.string()
			.required(() =>
				i18n.t("paymentDetails.validation.userRequired", { defaultValue: "User is required" }),
			),
	});
	const initialValues: CreatePaymentDetailsDto = {
		account_no: editPayment.data?.account_no ?? "",
		bicNumber: editPayment?.data?.bicNumber ?? "",
		ibanNumber: editPayment?.data?.ibanNumber ?? "",
		ifscCode: editPayment?.data?.ifscCode ?? "",
		mollieId: editPayment?.data?.mollieId ?? "",
		paymentType: editPayment?.data?.paymentType ?? "UPI",
		paypalId: editPayment?.data?.paypalId ?? "",
		razorpayId: editPayment?.data?.razorpayId ?? "",
		stripeId: editPayment?.data?.stripeId ?? "",
		swiftCode: editPayment?.data?.swiftCode ?? "",
		upiId: editPayment?.data?.upiId ?? "",
		user_id: user?.id ?? "",
	};

	const handleSubmit = async (
		values: CreatePaymentDetailsDto,
		actions: FormikHelpers<CreatePaymentDetailsDto>,
	) => {
		actions.setSubmitting(true);
		if (!paymentId) {
			await createPayment.mutateAsync({
				data: values,
			});
		} else {
			await updatePayment.mutateAsync({
				id: paymentId,
				data: values,
			});
		}
		queryClient.invalidateQueries({
			queryKey: getPaymentdetailsControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindAllQueryKey(),
		});
		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindDueInvoicesQueryKey(),
		});

		queryClient.refetchQueries({
			queryKey: getInvoiceControllerFindPaidInvoicesQueryKey(),
		});

		handleClose();
		actions.setSubmitting(false);
	};

	if (paymentId && editPayment.isLoading) {
		return <Loader />;
	}

	return (
		<Box sx={{ width: { sm: "400px" } }} role="presentation" padding={2}>
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
			>
				{({ values }) => (
					<Form>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<Field
									name="paymentType"
									component={AutocompleteField}
									label={t("paymentDetails.form.paymentType", { defaultValue: "Payment Type" })}
									options={Object.keys(CreatePaymentDetailsDtoPaymentType).map((key) => ({
										label:
											key === "UPI"
												? t("paymentDetails.labels.upiId", { defaultValue: "UPI ID" })
												: convertToReadableText(key),
										value: key,
									}))}
								/>
							</Grid>
							{values.paymentType === "IndianBanks" && (
								<>
									<Grid item xs={12}>
										<Field
											name="account_no"
											label={t("paymentDetails.form.accountNumber", {
												defaultValue: "Account Number",
											})}
											placeholder={t("paymentDetails.placeholders.accountNumber", {
												defaultValue: "Enter account number",
											})}
											component={TextFormField}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="ifscCode"
											label={t("paymentDetails.labels.ifsc", { defaultValue: "IFSC Code" })}
											placeholder={t("paymentDetails.placeholders.ifsc", {
												defaultValue: "Enter IFSC code",
											})}
											component={TextFormField}
										/>
									</Grid>
								</>
							)}
							{values.paymentType === "EuropeanBank" && (
								<>
									<Grid item xs={12}>
										<Field
											name="bicNumber"
											label={t("paymentDetails.form.bicOptional", {
												defaultValue: "BIC Number (optional)",
											})}
											placeholder={t("paymentDetails.placeholders.bic", {
												defaultValue: "Enter BIC number (optional)",
											})}
											component={TextFormField}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											name="ibanNumber"
											label={t("paymentDetails.form.ibanNumber", { defaultValue: "IBAN Number" })}
											placeholder={t("paymentDetails.placeholders.iban", {
												defaultValue: "Enter IBAN number",
											})}
											component={TextFormField}
										/>
									</Grid>
								</>
							)}
							{values.paymentType === "Mollie" && (
								<Grid item xs={12}>
									<Field
										name="mollieId"
										label={t("paymentDetails.labels.mollie", { defaultValue: "Mollie ID" })}
										placeholder={t("paymentDetails.placeholders.mollie", {
											defaultValue: "Enter Mollie ID",
										})}
										component={TextFormField}
									/>
								</Grid>
							)}
							{values.paymentType === "Paypal" && (
								<Grid item xs={12}>
									<Field
										name="paypalId"
										label={t("paymentDetails.labels.paypal", { defaultValue: "Paypal ID" })}
										placeholder={t("paymentDetails.placeholders.paypal", {
											defaultValue: "Enter Paypal ID",
										})}
										component={TextFormField}
									/>
								</Grid>
							)}
							{values.paymentType === "Razorpay" && (
								<Grid item xs={12}>
									<Field
										name="razorpayId"
										label={t("paymentDetails.labels.razorpay", { defaultValue: "Razorpay ID" })}
										placeholder={t("paymentDetails.placeholders.razorpay", {
											defaultValue: "Enter Razorpay ID",
										})}
										component={TextFormField}
									/>
								</Grid>
							)}
							{values.paymentType === "Stripe" && (
								<Grid item xs={12}>
									<Field
										name="stripeId"
										label={t("paymentDetails.labels.stripe", { defaultValue: "Stripe ID" })}
										placeholder={t("paymentDetails.placeholders.stripe", {
											defaultValue: "Enter Stripe ID",
										})}
										component={TextFormField}
									/>
								</Grid>
							)}
							{values.paymentType === "SwiftCode" && (
								<Grid item xs={12}>
									<Field
										name="swiftCode"
										label={t("paymentDetails.labels.swift", { defaultValue: "Swift Code" })}
										placeholder={t("paymentDetails.placeholders.swift", {
											defaultValue: "Enter Swift code",
										})}
										component={TextFormField}
									/>
								</Grid>
							)}
							{values.paymentType === "UPI" && (
								<Grid item xs={12}>
									<Field
										name="upiId"
										label={t("paymentDetails.labels.upiId", { defaultValue: "UPI ID" })}
										placeholder={t("paymentDetails.placeholders.upi", {
											defaultValue: "Enter UPI ID",
										})}
										component={TextFormField}
									/>
								</Grid>
							)}
							<Grid item xs={12} textAlign={"center"}>
								<Button type="submit" variant="contained" color="primary">
									{t("app.save", { defaultValue: "Save" })}
								</Button>
							</Grid>
						</Grid>
					</Form>
				)}
			</Formik>
		</Box>
	);
};

export default PaymentDetailsForm;
