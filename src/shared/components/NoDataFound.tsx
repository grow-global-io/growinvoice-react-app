import { SxProps, Theme, Typography } from "@mui/material";

export default function NoDataFound({
	message,
	sxProps,
}: {
	message: string;
	sxProps?: SxProps<Theme>;
}) {
	return (
		<Typography
			variant="h6"
			sx={{
				textAlign: "center",
				justifyContent: "center",
				alignItems: "center",
				display: "flex",
				height: "100%",
				flexShrink: 1,
				...(sxProps ?? {}),
			}}
		>
			{message}
		</Typography>
	);
}
