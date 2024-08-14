import { Box, Button, Typography } from "@mui/material";
import Lottie, { AnimationItem } from "lottie-web";
import { useRef, useEffect } from "react";
import loderJson from "@assets/payment_success.json";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
	const navigate = useNavigate();
	const container = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let animation: AnimationItem | undefined;
		if (container.current) {
			animation = Lottie.loadAnimation({
				container: container.current,
				renderer: "svg",
				loop: true,
				autoplay: true,
				animationData: loderJson,
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
				height: "80vh",
				gap: 2,
				width: "100%",
			}}
		>
			<div style={{ width: 300, height: 300 }} className="container" ref={container}></div>
			<Typography variant="h4">Payment Successful!</Typography>
			<Typography variant="h6">Your payment has been completed.</Typography>

			<Button
				variant="contained"
				color="primary"
				onClick={() => {
					navigate("/");
				}}
			>
				Finish
			</Button>
		</Box>
	);
};

export default PaymentSuccess;
