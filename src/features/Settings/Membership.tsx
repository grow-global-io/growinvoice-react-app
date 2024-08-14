import { usePlansControllerFindAll, usePlansControllerFindOne } from "@api/services/plans";
import { Box, Button, Card, Chip, Grid, Typography } from "@mui/material";
import Loader from "@shared/components/Loader";
import MembershipCard from "@shared/components/MembershipCard";
import { parseDateStringToFormat } from "@shared/formatter";
import { useAuthStore } from "@store/auth";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function findLeftDate(end_Date: string): number {
	const todaysDate = moment();
	const endDate = moment(end_Date);
	const diffInMs = endDate.diff(todaysDate);
	const msInDay = 24 * 60 * 60 * 1000;
	return Math.floor(diffInMs / msInDay);
}

const Membership = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const findAllPlans = usePlansControllerFindAll();
	const findOnePlan = usePlansControllerFindOne(user?.UserPlans?.[0]?.plan_id ?? "", {
		query: {
			enabled: user?.UserPlans?.[0]?.plan_id !== null,
		},
	});
	if (
		findAllPlans?.isLoading ||
		findAllPlans?.isFetching ||
		findOnePlan?.isLoading ||
		findAllPlans?.isFetching
	) {
		return <Loader />;
	}
	return (
		<>
			<Box>
				<Grid container spacing={2} display={"flex"} justifyContent={"center"}>
					<Grid item xs={12} sm={12} textAlign={"center"}>
						{/* <Typography variant="h4" fontWeight={600}>
							You are currently using our demo plan trail version
						</Typography> */}
						<Typography variant="h5" fontWeight={400} lineHeight={1.2} mt={1.5}>
							upgrade your plan to generate more invoices and access other features
						</Typography>
					</Grid>
					<Grid item xs={12} sm={11}>
						<Card
							sx={{
								border: "1px solid",
								borderColor: "custom.settingSidebarBorder",
								p: 2,
							}}
						>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<Typography variant="h3" textTransform={"capitalize"}>
										Current Membership
									</Typography>
									<Box display={"flex"} my={1}>
										<Typography variant="h6">Plan :</Typography>
										<Typography variant="h6" fontWeight={"500"}>
											{" "}
											{findOnePlan?.data?.name}
										</Typography>
									</Box>
									<Box display={"flex"} alignItems={"center"} my={1}>
										<Typography variant="h6">Status :</Typography>
										<Chip label={"on trial"} variant="filled" color={"info"} sx={{ ml: 1 }} />
									</Box>
									<Box display={"flex"} my={1}>
										<Typography variant="h6">Trial Ends :</Typography>
										<Typography variant="h6" fontWeight={"500"}>
											{" "}
											{parseDateStringToFormat(user?.UserPlans?.[0]?.end_date ?? "")} (
											{findLeftDate(user?.UserPlans?.[0]?.end_date ?? "")} days is left)
										</Typography>
									</Box>
									<Button
										variant="contained"
										onClick={() => {
											navigate("/plan/planspage");
										}}
									>
										{" "}
										See Plan
									</Button>
								</Grid>
								<Grid item xs={12} sm={6}></Grid>
							</Grid>
						</Card>
					</Grid>
					{findAllPlans?.data?.map((item, index) => (
						<Grid item xs={12} sm={5.5} key={index} my={2}>
							<MembershipCard item={item} />
						</Grid>
					))}
				</Grid>
			</Box>
		</>
	);
};

export default Membership;
