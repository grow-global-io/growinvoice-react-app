import { Grid, Typography } from "@mui/material";
import QuotationTableList from "./QuotationTableList";

function QuotationList() {
	return (
		<>
			<Grid container>
				<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
					<Typography variant="h3" textTransform={"capitalize"} mb={"10px"}>
						Quotation
					</Typography>
				</Grid>
				<Grid container sx={{ width: { xs: "90vw", sm: "100%" } }}>
					<Grid item xs={12}>
						<QuotationTableList />
					</Grid>
				</Grid>
			</Grid>
		</>
	);
}

export default QuotationList;
