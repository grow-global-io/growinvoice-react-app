import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import nodataJson from "@assets/NodataFound.json";

const LottieNoDataFound = ({ message }: { message?: string }) => {
	const container = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let animation: AnimationItem | undefined;
		if (container.current) {
			animation = lottie.loadAnimation({
				container: container.current,
				renderer: "svg",
				loop: true,
				autoplay: true,
				animationData: nodataJson,
			});
		}
		return () => {
			animation?.destroy();
		};
	}, []);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				height: "50vh",
			}}
		>
			<div style={{ width: 300, height: 300 }} className="container" ref={container}></div>
			<Typography sx={{ fontSize: 18 }}>{message ?? "No Data Available"}</Typography>
		</Box>
	);
};

export default LottieNoDataFound;
