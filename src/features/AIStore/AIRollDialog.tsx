import React, { useEffect, useRef } from "react";
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import storeLoader from "@assets/store.json";
import lottie, { AnimationItem } from "lottie-web";
import { useNavigate } from "react-router-dom";

const AIRollDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
	const navigate = useNavigate();
	const container = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let animation: AnimationItem | undefined;
		if (container.current) {
			animation = lottie.loadAnimation({
				container: container.current,
				renderer: "svg",
				loop: true,
				autoplay: true,
				animationData: storeLoader,
			});
		}
		setTimeout(() => {
			navigate("/store/verify");
			handleClose();
		}, 10000); // Close dialog after 10 seconds
		return () => {
			animation?.destroy();
		};
	}, []);

	return (
		<Dialog open={open} fullWidth maxWidth="md">
			<DialogContent>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						height: "70vh",
						justifyContent: "center",
					}}
				>
					<div style={{ width: 300, height: 300 }} className="container" ref={container}></div>
					<Typography sx={{ fontSize: 18 }}>Loading your AI Store... Please wait.</Typography>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default AIRollDialog;
