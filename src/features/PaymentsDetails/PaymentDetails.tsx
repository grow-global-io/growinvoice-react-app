import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import { useDialog } from "@shared/hooks/useDialog";
import AddIcon from "@mui/icons-material/Add";
import PaymentDetailsDrawer from "./PaymentDetailsDrawer";
import {
	usePaymentdetailsControllerFindAll,
	usePaymentdetailsControllerRemove,
} from "@api/services/paymentdetails";
import Loader from "@shared/components/Loader";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirmDialogStore } from "@store/confirmDialog";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";

const PaymentDetails = () => {
	const { open, handleClickOpen, handleClose } = useDialog();
	const paymentDetails = usePaymentdetailsControllerFindAll();
	const removeDetails = usePaymentdetailsControllerRemove();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const [paymentId, setPaymentId] = React.useState<string | null>(null);

	const columns: GridColDef[] = [
		{
			field: "paymentType",
			headerName: "Payment Type",
			minWidth: 200,
			renderCell: (params) => {
				return <Typography>{params.value}</Typography>;
			},
		},
		{
			field: "account_no",
			headerName: "Account Details",
			minWidth: 200,
			renderCell: (params) => {
				if (params?.row?.paymentType === "IndianBank") {
					return (
						<Typography>
							Account No: {params.row.account_no} <br />
							IFSC Code: {params.row.ifscCode}
						</Typography>
					);
				} else if (params?.row?.paymentType === "EuropeanBank") {
					return (
						<Typography>
							BIC No.: {params.row.bicNumber} <br />
							IBAN No.: {params.row.ibanNumber}
						</Typography>
					);
				} else if (params?.row?.paymentType === "UPI") {
					return <Typography>UPI ID: {params.row.upiId}</Typography>;
				} else if (params?.row?.paymentType === "SwiftCode") {
					return <Typography>Swift Code: {params.row.swiftCode}</Typography>;
				} else if (params?.row?.paymentType === "Paypal") {
					return <Typography>Paypal ID: {params.row.paypalId}</Typography>;
				} else if (params?.row?.paymentType === "Stripe") {
					return <Typography>Stripe ID: {params.row.stripeId}</Typography>;
				} else if (params?.row?.paymentType === "Razorpay") {
					return <Typography>Razorpay ID: {params.row.razorpayId}</Typography>;
				} else if (params?.row?.paymentType === "Mollie") {
					return <Typography>Mollie ID: {params.row.mollieId}</Typography>;
				}

				return (
					<Typography>
						{params.row?.mollieId ??
							params?.row?.paypalId ??
							params?.row?.razorpayId ??
							params?.row?.stripeId ??
							params?.row?.swiftCode ??
							params?.row?.upiId}
					</Typography>
				);
			},
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			type: "actions",
			getActions: (params) => [
				<Tooltip title="Edit" key={params.row?.id}>
					<Box>
						<CustomIconButton
							src={EditIcon}
							onClick={() => {
								setPaymentId(params.row.id);
								handleClickOpen();
							}}
						/>
					</Box>
				</Tooltip>,

				<Tooltip title="Delete" key={params.row?.id}>
					<Box>
						<CustomIconButton
							key={params.row?.id}
							src={DeleteIcon}
							buttonType="delete"
							iconColor="error"
							onClick={async () => {
								handleOpen({
									title: "Delete Details",
									message: "Are you sure you want to delete this payment?",
									onConfirm: async () => {
										await removeDetails.mutateAsync({
											id: params.row.id,
										});
										paymentDetails.refetch();
									},
									onCancel: () => {
										cleanUp();
									},
									confirmButtonText: "Delete",
								});
							}}
						/>
						,
					</Box>
				</Tooltip>,
			],
		},
	];
	if (paymentDetails.isLoading || paymentDetails.isFetching || paymentDetails.isRefetching) {
		return <Loader />;
	}

	return (
		<Box>
			<Grid container spacing={2}>
				<Grid item xs={6} display="flex" alignItems={"center"}>
					<Typography variant="h4" mb={3}>
						Payment Details
					</Typography>
				</Grid>
				<Grid item xs={6} display="flex" justifyContent="flex-end" alignItems={"center"}>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => {
							setPaymentId(null);
							handleClickOpen();
						}}
					>
						Add Payment Details
					</Button>
				</Grid>
				<Grid item xs={12}>
					<DataGrid autoHeight rows={paymentDetails.data} columns={columns} />{" "}
				</Grid>
			</Grid>
			<PaymentDetailsDrawer open={open} handleClose={handleClose} paymentId={paymentId ?? ""} />
		</Box>
	);
};

export default PaymentDetails;
