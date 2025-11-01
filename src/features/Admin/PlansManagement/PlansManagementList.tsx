import { PlanWithFeaturesDto } from "@api/services/models";
import { usePlansControllerFindAll, usePlansControllerUpdate } from "@api/services/plans";
import { Box, Button, Chip, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import Loader from "@shared/components/Loader";
import { currencyFormatter } from "@shared/formatter";
import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useDialog } from "@shared/hooks/useDialog";
import PlansCreate from "./PlansCreate"; // Assuming PlansCreate is a component for creating plans
import { useConfirmDialogStore } from "@store/confirmDialog";
import PlansFeatureUpdate from "./PlansFeatureUpdate"; // Assuming PlansFeatureUpdate is a component for updating plan features
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

const PlansManagementList = () => {
	const { t } = useTranslation();
	const findAllPlans = usePlansControllerFindAll();
	const { handleClickOpen, handleClose, open } = useDialog();
	const plansUpdate = usePlansControllerUpdate();
	const [planData, setPlanData] = React.useState<PlanWithFeaturesDto | undefined>();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const {
		handleClickOpen: handleFeatureOpen,
		handleClose: handleFeatureClose,
		open: openFeatureDialog,
	} = useDialog();
	const columns: GridColDef<PlanWithFeaturesDto>[] = [
		{
			field: "name",
			headerName: "Plan Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <span>{params.row.name}</span>;
			},
		},
		{
			field: "price",
			headerName: "Price",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <span>{currencyFormatter(params.row.price)}</span>;
			},
		},
		{
			field: "billingCycle",
			headerName: "Billing Cycle",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <span>{params.row.days} days</span>;
			},
		},
		{
			field: "status",
			headerName: "Status",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={params.row.is_active ? "Active" : "Inactive"}
						variant="filled"
						color={params.row.is_active ? "success" : "error"}
					/>
				);
			},
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			minWidth: 150,
			type: "actions",
			getActions: (params) => {
				const blockactions = [
					<Tooltip title="Inactivate Plan" key={params.row?.id}>
						<Box>
							<CustomIconButton
								onClick={async () => {
									handleOpen({
										title: "Inactivate Plan",
										message: "Are you sure you want to inactivate this plan?",
										onConfirm: async () => {
											await plansUpdate.mutateAsync({
												id: params.row.id,
												data: {
													name: params.row.name,
													description: params.row.description,
													price: params.row.price,
													days: params.row.days,
													isOneTime: params.row.isOneTime,
													is_active: false,
													features: params.row.PlanFeatures || [],
												},
											});
											findAllPlans.refetch();
											cleanUp();
										},
										onCancel: () => {
											cleanUp();
										},
										confirmButtonText: "Inactivate",
									});
								}}
								src={BlockIcon}
								buttonType="delete"
								iconColor="error"
							/>
						</Box>
					</Tooltip>,
				];
				const unblockActions = [
					<Tooltip title="Activate Plan" key={params.row?.id}>
						<Box>
							<CustomIconButton
								onClick={() => {
									handleOpen({
										title: "Activate Plan",
										message: "Are you sure you want to activate this plan?",
										onConfirm: async () => {
											await plansUpdate.mutateAsync({
												id: params.row.id,
												data: {
													name: params.row.name,
													description: params.row.description,
													price: params.row.price,
													days: params.row.days,
													isOneTime: params.row.isOneTime,
													is_active: true,
													features: params.row.PlanFeatures || [],
												},
											});
											findAllPlans.refetch();
											cleanUp();
										},
										onCancel: () => {
											cleanUp();
										},
										confirmButtonText: "Unblock",
									});
								}}
								src={RemoveCircleOutlineIcon}
							/>
						</Box>
					</Tooltip>,
				];
				return [
					...(params.row.is_active ? blockactions : unblockActions),
					<Tooltip title="View Plan" key={params.row?.id}>
						<Box>
							<CustomIconButton
								onClick={() => {
									// handleView(params.row.id);
									setPlanData(params.row);
									handleClickOpen();
								}}
								src={VisibilityIcon}
							/>
						</Box>
					</Tooltip>,
					<Tooltip
						title={t("plans.updateFeatures", { defaultValue: "Update Features" })}
						key={params.row?.id + "features"}
					>
						<Box>
							<CustomIconButton
								onClick={() => {
									setPlanData(params.row);
									handleFeatureOpen();
								}}
								src={EditIcon}
							/>
						</Box>
					</Tooltip>,
				];
			},
		},
	];
	if (findAllPlans?.isLoading || findAllPlans?.isFetching) {
		return <Loader />;
	}
	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
				<Button variant="contained" color="primary" onClick={handleClickOpen}>
					Create New Plan
				</Button>
			</Box>
			<DataGrid autoHeight rows={findAllPlans?.data || []} columns={columns} />
			<PlansCreate
				open={open}
				handleClose={() => {
					setPlanData(undefined);
					handleClose();
				}}
				planData={planData}
			/>
			<PlansFeatureUpdate
				open={openFeatureDialog}
				handleClose={handleFeatureClose}
				planData={planData}
			/>
		</Box>
	);
};

export default PlansManagementList;
