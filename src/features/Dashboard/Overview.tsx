import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import ExpensesSummary from "./ExpensesSummary";
import LottieNoDataFound from "@shared/components/LottieNoDataFound";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import {
	getDashboardsControllerFindAllQueryKey,
	useDashboardsControllerFindAll,
	useDashboardsControllerRemove,
} from "@api/services/dashboards";
import Loader from "@shared/components/Loader";
import { CustomIconButton } from "@shared/components/CustomIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import ReportViewCard from "./ReportViewCard";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getOpenaiControllerDashboardDataGetQueryKey } from "@api/services/openai";

const Overview = () => {
	const navigate = useNavigate();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const queryClient = useQueryClient();
	const dashbaordAll = useDashboardsControllerFindAll();
	const removeDashbaordData = useDashboardsControllerRemove();
	const handleDelete = async (invoiceId: string) => {
		await removeDashbaordData.mutateAsync({ id: invoiceId });
		queryClient.refetchQueries({
			queryKey: getDashboardsControllerFindAllQueryKey(),
		});
	};

	if (dashbaordAll?.isLoading) {
		return <Loader />;
	}

	return (
		<>
			<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
				Overview
			</Typography>
			<ExpensesSummary />
			<Grid container spacing={2} mt={1}>
				<Grid item xs={12} textAlign={"right"}>
					<Button
						startIcon={<AddIcon />}
						variant="contained"
						color="primary"
						onClick={() => {
							navigate("/dashboard");
						}}
					>
						Add Widget
					</Button>
				</Grid>
				{dashbaordAll?.data?.length == 0 && (
					<Grid item xs={12}>
						<LottieNoDataFound message="No Dashboard Widgets Found" />
					</Grid>
				)}
			</Grid>

			<Grid container my={2} spacing={2}>
				{dashbaordAll?.data?.map((dashboard) => (
					<Grid item xs={12} md={6} key={dashboard.id}>
						<Card
							sx={{
								alignItems: "stretch",
								height: "100%",
							}}
						>
							<CardContent>
								<Box display={"flex"} justifyContent={"space-between"} mb={2}>
									<Typography
										variant="h4"
										sx={{
											width: "50%",
										}}
									>
										{dashboard?.title}
									</Typography>
									<Box>
										<CustomIconButton
											src={DeleteIcon}
											buttonType="delete"
											iconColor="error"
											onClick={async () => {
												handleOpen({
													title: "Delete Data",
													message: "Are you sure you want to delete this data?",
													onConfirm: async () => {
														await handleDelete(dashboard?.id);
													},
													onCancel: () => {
														cleanUp();
													},
													confirmButtonText: "Delete",
												});
											}}
										/>
										<CustomIconButton
											src={RefreshIcon}
											onClick={() => {
												queryClient.refetchQueries({
													queryKey: getOpenaiControllerDashboardDataGetQueryKey(dashboard?.id),
												});
											}}
										/>
									</Box>
								</Box>
								<ReportViewCard dashboardId={dashboard?.id} type={dashboard?.type} />
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</>
	);
};

export default Overview;
