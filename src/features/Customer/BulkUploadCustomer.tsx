import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import { RegexExp } from "@shared/regex";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { formatPhoneNumber, isValidPhoneNumber } from "react-phone-number-input";
import {
	type CreateCustomerWithAddressDto,
	CreateCustomerWithAddressDtoOption,
} from "@api/services/models";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useExcelReader } from "@shared/hooks/useExcelReader";
import { useCurrencyControllerFindAll } from "@api/services/currency";
import { useAuthStore } from "@store/auth";
import { AlertService } from "@shared/services/AlertService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { useCustomerControllerCreateBulk } from "../../api/services/auth/customer";
import { LoaderService } from "@shared/services/LoaderService";

export type UploadStatus = "pending" | "uploaded" | "error";

type UploadFileResponse = {
	filename: string;
	fileurl: string;
	message: string;
	gcsPath: string;
};

const BulkUploadCustomer = () => {
	const { user, isGetStartedDialogOpen } = useAuthStore();
	const { t } = useTranslation();
	const currencyList = useCurrencyControllerFindAll();
	const schema = Yup.object()
		.shape({
			CustomerType: Yup.string()
				.required(t("customerForm.validation.optionRequired"))
				.oneOf(
					Object.values(CreateCustomerWithAddressDtoOption),
					t("customerForm.validation.invalidType"),
				),
			CustomerName: Yup.string().required(t("customerForm.validation.nameRequired")),
			// .matches(RegexExp.fullNameRegex, t("customerForm.validation.nameInvalid")),
			PhoneNumber: Yup.string().optional().nullable(),
			Email: Yup.string().email(t("customerForm.validation.emailInvalid")),
			Currency: Yup.string()
				.optional()
				.nullable()
				.oneOf(
					currencyList.data?.map((currency) => currency.short_code) || [],
					t("customerForm.validation.currencyInvalid"),
				),
			Address: Yup.string().nullable(),
			City: Yup.string().nullable(),
			State: Yup.string().nullable(),
			Country: Yup.string().nullable(),
			Zip: Yup.string().nullable(),
		})
		.test(
			"address-fields",
			function (value: {
				Address?: string | null;
				City?: string | null;
				State?: string | null;
				Country?: string | null;
				Zip?: string | null;
			}) {
				const { path, createError } = this;
				const addressFields = ["Address", "City", "State", "Country", "Zip"] as const;

				const hasAny = addressFields.some((field) => value?.[field]?.trim());
				if (!hasAny) return true;

				const missingFields = addressFields.filter((field) => !value?.[field]?.trim());
				if (missingFields.length === 0) return true;

				return createError({
					path,
					message: `The following address fields are required: ${missingFields.join(", ")}`,
				});
			},
		);

	const columns: GridColDef[] = [
		{
			field: "CustomerType",
			headerName: "Customer Type",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "CustomerName",
			headerName: "Customer Name",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "PhoneNumber",
			headerName: "Phone Number",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>
						{params.value && isValidPhoneNumber(params.value as string)
							? formatPhoneNumber(params.value as string)
							: params.value}
					</span>
				</Tooltip>
			),
		},
		{
			field: "Email",
			headerName: "Email",
			flex: 1,
			minWidth: 80,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "Currency",
			headerName: "Currency",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "Address",
			headerName: "Address",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		// {
		// 	field: "Line2",
		// 	headerName: "Address Line 2",
		// 	flex: 1,
		// 	renderCell: (params) => (
		// 		<Tooltip title={params.value ?? ""}>
		// 			<span>{params.value}</span>
		// 		</Tooltip>
		// 	),
		// },
		{
			field: "City",
			headerName: "City",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "State",
			headerName: "State",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "Country",
			headerName: "Country",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "Zip",
			headerName: "Zip Code",
			flex: 1,
			minWidth: 80,
			renderCell: (params) => (
				<Tooltip title={params.value ?? ""}>
					<span>{params.value}</span>
				</Tooltip>
			),
		},
		{
			field: "status",
			headerName: "Status",
			flex: 2,
			minWidth: 160,
			renderCell(params) {
				const status = params.value as UploadStatus;

				switch (status) {
					case "pending":
						return <Typography variant="body2">Pending</Typography>;
					case "uploaded":
						return <Typography variant="body2">Uploaded</Typography>;
					case "error":
						return (
							<Typography
								variant="body2"
								color="error"
								sx={{ whiteSpace: "pre-line", lineHeight: 1.2 }}
							>
								{params.row.reason ?? "Error"}
							</Typography>
						);
					default:
						return null;
				}
			},
		},
	];

	const { rows, handleFileChange, errors, reset, totalRows, setRows } = useExcelReader({
		validationSchema: schema,
	});

	const customerBulkCreate = useCustomerControllerCreateBulk();

	const downloadErrors = () => {
		let csvContent = "data:text/csv;charset=utf-8," + "Row, Error\n";
		errors.forEach((e) => {
			if (Array.isArray(e.error.errors)) {
				e.error.errors.forEach((err) => {
					csvContent += `${e.id},${err}\n`;
				});
			}
		});

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "errors.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleUpload = async () => {
		if (isGetStartedDialogOpen()) {
			AlertService.instance.errorMessage(
				"Please complete the Get Started process before creating a product.",
			);
			return;
		}
		LoaderService.instance.showLoader();
		const customersPromises: Promise<CreateCustomerWithAddressDto>[] = rows.map(
			async (row): Promise<CreateCustomerWithAddressDto> => {
				const currencyId = currencyList.data?.find(
					(currency) => currency.short_code === row.Currency,
				)?.id;
				const data: CreateCustomerWithAddressDto = {
					option: row.CustomerType,
					name: row.CustomerName,
					phone: row.PhoneNumber || "",
					email: row.Email || "",
					display_name: row.CustomerName,
					user_id: user?.id ?? "",
					billingDetails: {
						address: row.Address || "",
						city: row.City || "",
						country_name: row.Country || "",
						state_name: row.State || "",
						zip: row.Zip || "",
					},
					currencies_id: currencyId || undefined,
					shippingDetails: {
						address: row.Address || "",
						city: row.City || "",
						country_name: row.Country || "",
						state_name: row.State || "",
						zip: row.Zip || "",
					},
					fromStore: false,
				};
				// Simulate API call
				return data;
			},
		);
		const customersData = await Promise.all(customersPromises);
		const blob = new Blob([JSON.stringify(customersData)], { type: "application/json" });
		const file = new File([blob], "customers.json", { type: "application/json" });
		const storageRef = ref(storage, `uploads/${file.name}`);
		const uploadTask = uploadBytesResumable(storageRef, file);
		const response = await new Promise<UploadFileResponse>((resolve, reject) => {
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					console.log("Upload is " + progress + "% done");
				},
				(error) => {
					console.error("[useFileUpload] uploadFile error:", error);
					AlertService.instance.errorMessage(
						t("common.fileUploadFailed", {
							defaultValue: "File upload failed. Please try again.",
						}),
					);
					reject(error);
				},
				async () => {
					const url = await getDownloadURL(uploadTask.snapshot.ref);
					resolve({
						filename: file.name,
						fileurl: url,
						gcsPath: uploadTask.snapshot.ref.fullPath,
						message: t("common.fileUploaded", { defaultValue: "File uploaded successfully" }),
					});

					// if (!props.hideSuccessAlert) {
					// 	ToastService.successMessage("File uploaded successfully");
					// }
				},
			);
		});
		const res = await customerBulkCreate.mutateAsync({
			data: {
				firebaseStoragePath: response.gcsPath,
			},
		});
		if (res.result) {
			const uploadedPatients = res.result.fulfilled;
			const rejectedPatients = res.result.rejected;

			setRows((prevRows) =>
				prevRows.map((row) => {
					const formattedEmail = row.Email?.toLowerCase().trim();
					const uploaded = uploadedPatients.find((r) => r.email === formattedEmail);
					const rejected = rejectedPatients.find((r) => r.email === formattedEmail);

					return {
						...row,
						id: uploaded?.uId ?? row.id,
						status: uploaded ? "uploaded" : rejected ? "error" : row.status,
						reason: rejected?.reason ?? row.reason,
					};
				}),
			);
		}
		if (res.result?.rejected.length === 0) {
			reset();
		}
		LoaderService.instance.hideLoader();
	};

	return (
		<>
			<Grid container spacing={2} sx={{ width: { xs: "90vw", sm: "100%" } }}>
				<Grid
					item
					xs={12}
					display={"flex"}
					justifyContent={"space-between"}
					alignItems={"center"}
					mb={2}
				>
					<Typography variant="h4" textTransform={"capitalize"}>
						{t("customer.bulkUploadTitle", {
							defaultValue: "Bulk Upload Customers",
						})}
					</Typography>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Button
							variant="outlined"
							onClick={() => {
								const link = document.createElement("a");
								link.href = "/Template.csv"; // URL to the bulk upload template file
								link.download = "Template.csv";
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
							}}
						>
							{t("customerForm.downloadTemplate", {
								defaultValue: "Download Template",
							})}
						</Button>
						{rows.length > 0 && (
							<Typography variant="h6">
								{t("customerForm.readyToOnboard", {
									defaultValue: "Ready to onboard",
								})}{" "}
								{rows.length}/{totalRows} {rows.length === 1 ? "customer" : "customers"}
							</Typography>
						)}
						<Box display="flex" justifyContent="flex-end" gap={1}>
							{rows.length > 0 && (
								<Button
									variant="contained"
									color="primary"
									onClick={handleUpload}
									disabled={customerBulkCreate.isPending}
								>
									{customerBulkCreate.isPending ? "Onboarding..." : "Onboard Customers"}
								</Button>
							)}

							{errors.length > 0 && (
								<Button variant="contained" color="error" onClick={downloadErrors}>
									{errors.length} row errors found
								</Button>
							)}

							{(rows.length > 0 || errors.length > 0) && (
								<Button variant="contained" color="error" onClick={reset}>
									Reset
								</Button>
							)}
							{rows.length === 0 && (
								<Button variant="contained" component="label">
									{t("customerForm.bulkUpload", {
										defaultValue: "Bulk Upload",
									})}
									<input
										type="file"
										hidden
										onChange={handleFileChange}
										onClick={(e) => {
											(e.target as HTMLInputElement).value = "";
										}}
									/>
								</Button>
							)}
						</Box>
					</Box>
				</Grid>
				<Box sx={{ height: "80vh", width: "100%" }}>
					<DataGrid rows={rows} columns={columns} />
				</Box>
			</Grid>
		</>
	);
};

export default BulkUploadCustomer;
