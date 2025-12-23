import { useState } from "react";
import { Box, Button, TextField, Typography, Paper, CircularProgress } from "@mui/material";
import { http } from "@shared/axios";
import { useTranslation } from "react-i18next";

interface ShiprocketTrackingProps {
	/** Optional initial AWB to prefill the field */
	initialAwb?: string;
	/** Optional initial shipment id to prefill the field */
	initialShipmentId?: string;
}

const ShiprocketTracking = ({
	initialAwb = "",
	initialShipmentId = "",
}: ShiprocketTrackingProps) => {
	const { t } = useTranslation();
	const [awb, setAwb] = useState(initialAwb);
	const [shipmentId, setShipmentId] = useState(initialShipmentId);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tracking, setTracking] = useState<any | null>(null);

	const handleTrackAwb = async () => {
		if (!awb) return;
		setLoading(true);
		setError(null);
		setTracking(null);
		try {
			const res = await http.get(`/api/shiprocket/track/awb/${encodeURIComponent(awb)}`);
			setTracking(res.data);
		} catch (e: any) {
			setError(
				e?.response?.data?.message ??
					t("shiprocket.track.error", { defaultValue: "Unable to fetch tracking details." }),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleTrackShipmentId = async () => {
		if (!shipmentId) return;
		setLoading(true);
		setError(null);
		setTracking(null);
		try {
			const res = await http.get(
				`/api/shiprocket/track/shipment/${encodeURIComponent(shipmentId)}`,
			);
			setTracking(res.data);
		} catch (e: any) {
			setError(
				e?.response?.data?.message ??
					t("shiprocket.track.error", { defaultValue: "Unable to fetch tracking details." }),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper
			variant="outlined"
			sx={{
				mt: 3,
				p: 2,
				borderRadius: 2,
			}}
		>
			<Typography variant="h6" gutterBottom>
				{t("shiprocket.track.title", { defaultValue: "Track Shipment (Shiprocket)" })}
			</Typography>
			<Typography variant="body2" color="text.secondary" mb={2}>
				{t("shiprocket.track.subtitle", {
					defaultValue: "Enter AWB or Shipment ID to view the latest tracking status.",
				})}
			</Typography>

			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					gap: 2,
					mb: 2,
				}}
			>
				<Box sx={{ flex: 1 }}>
					<TextField
						fullWidth
						size="small"
						label={t("shiprocket.track.awbLabel", { defaultValue: "AWB Number" })}
						placeholder="Enter AWB number"
						value={awb}
						onChange={(e) => setAwb(e.target.value)}
					/>
					<Button
						variant="contained"
						size="small"
						sx={{ mt: 1 }}
						onClick={handleTrackAwb}
						disabled={loading || !awb}
					>
						{t("shiprocket.track.trackAwb", { defaultValue: "Track by AWB" })}
					</Button>
				</Box>

				<Box sx={{ flex: 1 }}>
					<TextField
						fullWidth
						size="small"
						label={t("shiprocket.track.shipmentIdLabel", { defaultValue: "Shipment ID" })}
						placeholder="Enter shipment id"
						value={shipmentId}
						onChange={(e) => setShipmentId(e.target.value)}
					/>
					<Button
						variant="outlined"
						size="small"
						sx={{ mt: 1 }}
						onClick={handleTrackShipmentId}
						disabled={loading || !shipmentId}
					>
						{t("shiprocket.track.trackShipmentId", { defaultValue: "Track by Shipment ID" })}
					</Button>
				</Box>
			</Box>

			{loading && (
				<Box display="flex" alignItems="center" gap={1}>
					<CircularProgress size={20} />
					<Typography variant="body2">
						{t("shiprocket.track.loading", { defaultValue: "Fetching tracking details..." })}
					</Typography>
				</Box>
			)}

			{error && (
				<Typography variant="body2" color="error" mt={1}>
					{error}
				</Typography>
			)}

			{tracking && !loading && (
				<Box mt={2}>
					{/* Try to show some common fields if present, then fallback to raw JSON */}
					{tracking?.tracking_data?.shipment_track && (
						<>
							<Typography variant="subtitle1" fontWeight={600}>
								{t("shiprocket.track.currentStatus", { defaultValue: "Current Status" })}:
							</Typography>
							<Typography variant="body2" mb={1}>
								{tracking.tracking_data.shipment_track}
							</Typography>
						</>
					)}

					{tracking?.tracking_data?.etd && (
						<Typography variant="body2" mb={1}>
							{t("shiprocket.track.eta", { defaultValue: "Estimated Delivery:" })}{" "}
							{tracking.tracking_data.etd}
						</Typography>
					)}

					<Typography variant="subtitle2" mt={1} mb={0.5}>
						{t("shiprocket.track.rawData", { defaultValue: "Full Tracking Payload" })}
					</Typography>
					<Box
						component="pre"
						sx={{
							maxHeight: 240,
							overflow: "auto",
							bgcolor: "grey.100",
							p: 1,
							borderRadius: 1,
							fontSize: 12,
						}}
					>
						{JSON.stringify(tracking, null, 2)}
					</Box>
				</Box>
			)}
		</Paper>
	);
};

export default ShiprocketTracking;
