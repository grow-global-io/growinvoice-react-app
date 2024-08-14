import { Card, Grid, Typography } from "@mui/material";

interface OverviewCardProps {
	name: string;
	icon: React.ReactNode;
	value: string | number;
}

const ProfitLossCard = ({ name, icon, value }: OverviewCardProps) => {
	return (
		<Card
			sx={{
				alignItems: "stretch",
				height: "100%",
			}}
		>
			<Grid
				container
				sx={{
					p: 2,
					alignItems: "center",
				}}
			>
				<Grid item xs={10}>
					<Typography variant="h3">{value}</Typography>{" "}
					<Typography variant="h6" sx={{ my: 1 }}>
						{name}{" "}
					</Typography>
				</Grid>
				<Grid item xs={2} alignItems={"center"}>
					{icon}
				</Grid>
			</Grid>
		</Card>
	);
};

export default ProfitLossCard;
