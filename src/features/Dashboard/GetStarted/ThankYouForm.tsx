import { Box, Button, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";
import { useGetStartedDialogStore } from "@store/useGetStartedDialog";

interface Props {
	onActionSelect?: () => void;
}

const ThankYouForm = ({ onActionSelect }: Props) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { handleClose } = useGetStartedDialogStore();

	const handleAction = (path?: string) => {
		onActionSelect?.();
		handleClose();
		if (path) {
			navigate(path);
		}
	};

	return (
		<Box
			sx={{
				textAlign: "center",
				py: 2,
				minHeight: "350px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Box
				sx={{
					width: 72,
					height: 72,
					borderRadius: "50%",
					bgcolor: "success.light",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					mx: "auto",
					mb: 2,
					boxShadow: "0 4px 16px rgba(46, 125, 50, 0.2)",
				}}
			>
				<CheckCircleIcon sx={{ fontSize: 44, color: "success.main" }} />
			</Box>
			<Typography variant="h4" fontWeight={700} mb={1}>
				{t("getStarted.thankYou.title", {
					defaultValue: "Setup Complete!",
				})}
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				sx={{ maxWidth: "460px", mx: "auto", mb: 3 }}
			>
				{t("getStarted.thankYou.message", {
					defaultValue:
						"Your business profile is ready. What would you like to do first?",
				})}
			</Typography>

			{/* Action Cards */}
			<Grid container spacing={2} sx={{ maxWidth: "520px", mx: "auto", mb: 2 }}>
				{/* 1. Create Invoice (Primary) */}
				<Grid item xs={12} sm={6}>
					<Card
						variant="outlined"
						sx={{
							borderColor: "primary.main",
							bgcolor: "primary.50",
							height: "100%",
							transition: "all 0.2s ease",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: "0 6px 16px rgba(25, 118, 210, 0.2)",
							},
						}}
					>
						<CardActionArea
							onClick={() => handleAction("/invoice/createinvoice")}
							sx={{ p: 2, height: "100%", textAlign: "left" }}
						>
							<CardContent sx={{ p: 0 }}>
								<Box display="flex" alignItems="center" gap={1} mb={1}>
									<DescriptionIcon color="primary" />
									<Typography variant="subtitle1" fontWeight={700} color="primary.main">
										{t("getStarted.actions.createInvoice", { defaultValue: "Create First Invoice" })}
									</Typography>
								</Box>
								<Typography variant="body2" color="text.secondary">
									{t("getStarted.actions.createInvoiceDesc", { defaultValue: "Jump right into the invoice creator" })}
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				</Grid>

				{/* 2. Add Customer */}
				<Grid item xs={12} sm={6}>
					<Card
						variant="outlined"
						sx={{
							borderColor: "divider",
							height: "100%",
							transition: "all 0.2s ease",
							"&:hover": {
								borderColor: "primary.main",
								transform: "translateY(-2px)",
								boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
							},
						}}
					>
						<CardActionArea
							onClick={() => handleAction("/customer/createcustomer")}
							sx={{ p: 2, height: "100%", textAlign: "left" }}
						>
							<CardContent sx={{ p: 0 }}>
								<Box display="flex" alignItems="center" gap={1} mb={1}>
									<PersonAddIcon color="secondary" />
									<Typography variant="subtitle1" fontWeight={700}>
										{t("getStarted.actions.addCustomer", { defaultValue: "Add Client / Customer" })}
									</Typography>
								</Box>
								<Typography variant="body2" color="text.secondary">
									{t("getStarted.actions.addCustomerDesc", { defaultValue: "Save client contact & tax details" })}
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				</Grid>
			</Grid>

			{/* 3. Dashboard Link */}
			<Button
				variant="text"
				startIcon={<DashboardIcon />}
				onClick={() => handleAction()}
				sx={{ mt: 1, color: "text.secondary", fontWeight: 600 }}
			>
				{t("getStarted.actions.goToDashboard", { defaultValue: "Go to Dashboard" })}
			</Button>
		</Box>
	);
};

export default ThankYouForm;
