import { Grid, Typography } from "@mui/material";
import HsnCodeTableList from "./HsnCodeTableList";
import CreateHsnCode from "./CreateHsnCode";

const HsnCodeList = () => {
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
				<Typography variant="h3" fontWeight={"500"} textTransform={"capitalize"}>
					HSN Code
				</Typography>
				<CreateHsnCode />
			</Grid>
			<Grid item xs={12}>
				<HsnCodeTableList />
			</Grid>
		</Grid>
	);
};

export default HsnCodeList;
