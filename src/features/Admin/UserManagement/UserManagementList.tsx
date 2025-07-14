import React from "react";
import {
	useUserControllerBlockUser,
	useUserControllerGetUsersList,
} from "../../../api/services/auth/users";
import Loader from "../../../shared/components/Loader";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AdminUsersListDto } from "../../../api/services/auth/models";
import { Box, Chip, Tooltip } from "@mui/material";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import BlockIcon from "@mui/icons-material/Block";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useConfirmDialogStore } from "@store/confirmDialog";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDialog } from "@shared/hooks/useDialog";
import UserData from "./UserData"; // Assuming UserData is a component that displays user details

const UserManagementList = () => {
	const user = useUserControllerGetUsersList();
	const block = useUserControllerBlockUser();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const [userData, setUserData] = React.useState<AdminUsersListDto | undefined>();
	const { handleClickOpen, handleClose, open } = useDialog();

	const columns: GridColDef<AdminUsersListDto>[] = [
		{
			field: "name",
			headerName: "Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <span>{params.value}</span>;
			},
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1,
			minWidth: 200,
		},
		{
			field: "company",
			headerName: "Company Name",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return <span>{params?.row?.company?.[0]?.name}</span>;
			},
		},
		{
			field: "plans",
			headerName: "Plan",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				return (
					<Chip
						label={params?.row?.UserPlans?.length > 0 ? params?.row?.UserPlans?.length : "No Plan"}
						color={params?.row?.UserPlans?.length > 0 ? "primary" : "default"}
						variant={params?.row?.UserPlans?.length > 0 ? "filled" : "outlined"}
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
					<Tooltip title="Block User" key={params.row?.id}>
						<Box>
							<CustomIconButton
								onClick={async () => {
									handleOpen({
										title: "Block User",
										message: "Are you sure you want to block this user?",
										onConfirm: async () => {
											await block.mutateAsync({ id: params.row.id });
											user.refetch();
											cleanUp();
										},
										onCancel: () => {
											cleanUp();
										},
										confirmButtonText: "Block",
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
					<Tooltip title="Unblock User" key={params.row?.id}>
						<Box>
							<CustomIconButton
								onClick={() => {
									handleOpen({
										title: "Unblock User",
										message: "Are you sure you want to unblock this user?",
										onConfirm: async () => {
											await block.mutateAsync({ id: params.row.id });
											user.refetch();
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
					...(params.row?.isActive ? blockactions : unblockActions),
					<Tooltip title="View Plans" key={params.row?.id + "edit"}>
						<Box>
							<CustomIconButton
								onClick={() => {
									setUserData(params.row);
									handleClickOpen();
								}}
								src={VisibilityIcon}
							/>
						</Box>
					</Tooltip>,
				];
			},
		},
	];

	if (user.isLoading) {
		return <Loader />;
	}
	return (
		<Box>
			<DataGrid autoHeight rows={user.data ?? []} columns={columns} />
			{userData && (
				// Assuming UserData is a component that displays user details
				<UserData open={open} handleClose={handleClose} userData={userData} />
			)}
		</Box>
	);
};

export default UserManagementList;
