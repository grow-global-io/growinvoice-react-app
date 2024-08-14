import { Box, Typography } from "@mui/material";
import { FallbackProps } from "react-error-boundary";

export default function InternalServerErrorPage(props: FallbackProps) {
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
				500 Internal Server Error
			</Typography>
			<Typography variant="h2" component="h2" gutterBottom>
				Oops! Something went wrong. Please try again later.
			</Typography>
			<Typography variant="h3" component="h3" gutterBottom>
				{props.error?.message}
			</Typography>
		</Box>
	);
}
