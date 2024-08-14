import { CreatePaymentDetailsDto, CreatePaymentDetailsDtoPaymentType } from "@api/services/models";
import { Box, Button, Grid } from "@mui/material";
import { AutocompleteField } from "@shared/components/FormFields/AutoComplete";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { stringToListDto } from "@shared/models/ListDto";
import { useAuthStore } from "@store/auth";
import * as yup from "yup";
import { Field, Form, Formik, FormikHelpers } from "formik";
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

const validationSchema: yup.Schema<CreatePaymentDetailsDto> = yup.object().shape({
	paymentType: yup
		.string()
		.required("Payment type is required")
		.oneOf(Object.values(CreatePaymentDetailsDtoPaymentType), "Invalid Type"),
	account_no: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "IndianBank")) {
			return schema.required("Account number is required");
		}
		return schema;
	}),
	bicNumber: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "EuropeanBank")) {
			return schema.required("BIC number is required");
		}
		return schema;
	}),
	ibanNumber: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "EuropeanBank")) {
			return schema.required("IBAN number is required");
		}
		return schema;
	}),
	ifscCode: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "IndianBank")) {
			return schema.required("IFSC code is required");
		}
		return schema;
	}),
	mollieId: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "Mollie")) {
			return schema.required("Mollie ID is required");
		}
		return schema;
	}),
	paypalId: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "Paypal")) {
			return schema.required("Paypal ID is required");
		}
		return schema;
	}),
	razorpayId: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "Razorpay")) {
			return schema.required("Razorpay ID is required");
		}
		return schema;
	}),
	stripeId: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "Stripe")) {
			return schema.required("Stripe ID is required");
		}
		return schema;
	}),
	swiftCode: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "SwiftCode")) {
			return schema.required("Swift code is required");
		}
		return schema;
	}),
	upiId: yup.string().when("paymentType", (paymentType, schema) => {
		if (paymentType.find((item) => item === "UPI")) {
			return schema.required("UPI ID is required");
		}
		return schema;
	}),

	user_id: yup.string().required("User is required"),
});

const PaymentDetailsForm = ({
	handleClose,
	paymentId,
}: {
	handleClose: () => void;
	paymentId?: string;
}) => {
	const updatePayment = usePaymentdetailsControllerUpdate();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const createPayment = usePaymentdetailsControllerCreate();
	const editPayment = usePaymentdetailsControllerFindOne(paymentId ?? "", {
		query: {
			enabled: !!paymentId,
		},
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
									label="Payment Type"
									options={Object.keys(CreatePaymentDetailsDtoPaymentType)
										.map(stringToListDto)
										.filter((item) => item.value !== "Cash")}
								/>
							</Grid>
							{values.paymentType === "IndianBank" && (
								<>
									<Grid item xs={12}>
										<Field name="account_no" label="Account Number" component={TextFormField} />
									</Grid>
									<Grid item xs={12}>
										<Field name="ifscCode" label="IFSC Code" component={TextFormField} />
									</Grid>
								</>
							)}
							{values.paymentType === "EuropeanBank" && (
								<>
									<Grid item xs={12}>
										<Field name="bicNumber" label="BIC Number" component={TextFormField} />
									</Grid>
									<Grid item xs={12}>
										<Field name="ibanNumber" label="IBAN Number" component={TextFormField} />
									</Grid>
								</>
							)}
							{values.paymentType === "Mollie" && (
								<Grid item xs={12}>
									<Field name="mollieId" label="Mollie ID" component={TextFormField} />
								</Grid>
							)}
							{values.paymentType === "Paypal" && (
								<Grid item xs={12}>
									<Field name="paypalId" label="Paypal ID" component={TextFormField} />
								</Grid>
							)}
							{values.paymentType === "Razorpay" && (
								<Grid item xs={12}>
									<Field name="razorpayId" label="Razorpay ID" component={TextFormField} />
								</Grid>
							)}
							{values.paymentType === "Stripe" && (
								<Grid item xs={12}>
									<Field name="stripeId" label="Stripe ID" component={TextFormField} />
								</Grid>
							)}
							{values.paymentType === "SwiftCode" && (
								<Grid item xs={12}>
									<Field name="swiftCode" label="Swift Code" component={TextFormField} />
								</Grid>
							)}
							{values.paymentType === "UPI" && (
								<Grid item xs={12}>
									<Field name="upiId" label="UPI ID" component={TextFormField} />
								</Grid>
							)}
							<Grid item xs={12} textAlign={"center"}>
								<Button type="submit" variant="contained" color="primary">
									Save
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
