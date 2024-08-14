import { Box, Typography } from "@mui/material";

export default function NotFoundPage() {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "80vh",
			}}
		>
			<Typography variant="h1" component="h1" gutterBottom>
				404 Not Found
			</Typography>
			<Typography variant="h2" component="h2" gutterBottom>
				Oops! The page you are looking for does not exist.
			</Typography>
		</Box>
	);
}
