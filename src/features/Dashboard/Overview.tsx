import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import ExpensesSummary from "./ExpensesSummary";
import LottieNoDataFound from "@shared/components/LottieNoDataFound";
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
import { useTranslation } from "react-i18next";
// import GetStartedErrorComp from "@shared/components/GetStartedErrorComp";

const Overview = () => {
	const { t } = useTranslation();
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
				{t("nav.dashboard")}
			</Typography>
			<ExpensesSummary />
			<Grid container spacing={2} mt={1}>
				<Grid item xs={12} textAlign={"right"}>
					<Box display={"flex"} justifyContent={"flex-end"} gap={2} mb={2} flexWrap="wrap">
						<Button variant="contained" color="secondary" onClick={() => navigate("/ai-store")}>
							{t("dashboard.rollUpAiStore", { defaultValue: "Roll UP AI Store" })}
						</Button>
						<Button variant="contained" color="primary" onClick={() => navigate("/your-ai")}>
							{t("dashboard.aiAssistant", { defaultValue: "AI Assistant" })}
						</Button>
						<Button
							variant="contained"
							color="primary"
							onClick={() => navigate("/invoice/bulk-upload")}
						>
							{t("dashboard.bulkUploadInvoice", { defaultValue: "Upload Excel for Invoice" })}
						</Button>
						<Button variant="contained" color="primary" onClick={() => navigate("/ledger")}>
							{t("dashboard.ledgerInfo", { defaultValue: "Ledger Info" })}
						</Button>
					</Box>
				</Grid>
				{dashbaordAll?.data?.length == 0 && (
					<Grid item xs={12}>
						<LottieNoDataFound
							message={t("dashboard.noWidgetsFound", {
								defaultValue: "No Dashboard Widgets Found",
							})}
						/>
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
													title: t("dashboard.deleteData", { defaultValue: "Delete Data" }),
													message: t("dashboard.deleteConfirm", {
														defaultValue: "Are you sure you want to delete this data?",
													}),
													onConfirm: async () => {
														await handleDelete(dashboard?.id);
													},
													onCancel: () => {
														cleanUp();
													},
													confirmButtonText: t("app.delete"),
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
