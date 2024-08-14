import Button from "@mui/material/Button";
import { FileDownloadOutlined } from "@mui/icons-material";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useAuthStore } from "@store/auth";
import { useQuotationControllerQuotationPublicFindOne } from "@api/services/quotation";
import Loader from "@shared/components/Loader";
import { parseDateStringToFormat } from "@shared/formatter";

const QuotationTemplateCard = ({
	quotationId,
	downloadfunc,
}: {
	quotationId: string;
	downloadfunc: () => void;
}) => {
	const { user } = useAuthStore();
	const getQuotationData = useQuotationControllerQuotationPublicFindOne(quotationId ?? "", {
		query: {
			enabled: quotationId !== undefined,
		},
	});

	if (getQuotationData.isLoading) return <Loader />;
	return (
		<Card sx={{ display: { xs: "block", md: "none" } }}>
			<CardContent>
				<Typography variant="h4" textAlign={"center"} color={"secondary.dark"}>
					Hi, {user?.name}!
				</Typography>
				<Typography variant="h5" textAlign={"center"} color={"secondary.dark"}>
					Quotation from {user?.company?.[0]?.name}
				</Typography>

				<Typography variant="h6" textAlign={"center"} color={"custom.grayColor"} mt={2}>
					Total Amount
				</Typography>
				<Typography variant="h1" textAlign={"center"} color={"secondary.dark"}>
					{getQuotationData?.data?.total}
				</Typography>
				<Box my={2}>
					<Box display={"flex"} justifyContent={"space-between"} my={0.5}>
						<Typography variant="h6" fontWeight={500} color={"secondary.dark"}>
							Quotation #
						</Typography>
						<Typography variant="h6" color={"secondary.dark"}>
							INV-
							{getQuotationData?.data?.quatation_number}
						</Typography>
					</Box>
					<Box display={"flex"} justifyContent={"space-between"} my={0.5}>
						<Typography variant="h6" fontWeight={500} color={"secondary.dark"}>
							Quotation Date
						</Typography>
						<Typography variant="h6" color={"secondary.dark"}>
							{parseDateStringToFormat(getQuotationData?.data?.date ?? "")}
						</Typography>
					</Box>
				</Box>
				<Box textAlign={"center"} mt={1}>
					<Button
						variant="contained"
						onClick={() => {
							downloadfunc();
						}}
					>
						<FileDownloadOutlined />
						Download
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
};

export default QuotationTemplateCard;
