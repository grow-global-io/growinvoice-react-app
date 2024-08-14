import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
	MoreVertOutlined,
	FileDownloadOutlined,
	EmailOutlined,
	CreateOutlined,
	ShareOutlined,
	DeleteOutline,
	SendOutlined,
	SwipeRightOutlined,
	SwipeLeftOutlined,
} from "@mui/icons-material";

import { Box, Chip, Typography, useMediaQuery } from "@mui/material";
import Loader from "@shared/components/Loader";
import NoDataFound from "@shared/components/NoDataFound";
import { useNavigate } from "react-router-dom";
import { usePdfExport } from "@shared/hooks/usePdfExport";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import {
	useQuotationControllerQuotationPublicFindOne,
	useQuotationControllerTest,
} from "@api/services/quotation";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useQuotationHook } from "./QuotationHooks/useQuotationHook";
import { Constants } from "@shared/constants";
import QuotationTemplateCard from "./QuotationTemplateCard";

const styles = {
	width: { xs: "100%", sm: "auto" },
	py: 1,
	px: 3,
	color: "secondary.dark",
	fontWeight: 500,
	textTransform: "capitalize",
	my: { xs: 1 },
	borderColor: "custom.invDetailBtnBorder",
	borderStyle: "solid",
	borderWidth: { xs: "1px", lg: "0" },
	display: "flex",
	justifyContent: "flex-start",
	bgcolor: "custom.transparentWhite",
};

const QuotationDetail = ({
	quotationId,
	IsPublic,
}: {
	quotationId: string;
	IsPublic?: boolean;
}) => {
	const navigate = useNavigate();
	const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
	const [menuIconAnchorEl, setMenuIconAnchorEl] = useState<null | HTMLElement>(null);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const { generatePdfFromRef, generatePdfFromHtml } = usePdfExport();
	const isMobile = useMediaQuery("(max-width:800px)");
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const {
		handleConvertToInvoice,
		handleDelete,
		handleEdit,
		handleMarkedAccepted,
		handleMarkedRejected,
		handleMarkedSendMail,
		handleSendMail,
		handleShare,
	} = useQuotationHook();

	const handleCloseAll = async () => {
		handleMenuIconClose();
		handleMoreClose();
	};

	const getHtmlText = useQuotationControllerTest(quotationId ?? "", {
		query: {
			enabled: quotationId !== undefined,
			gcTime: 0,
			staleTime: 0,
		},
	});

	const getQuotationData = useQuotationControllerQuotationPublicFindOne(quotationId ?? "", {
		query: {
			enabled: quotationId !== undefined,
		},
	});

	useEffect(() => {
		if (iframeRef.current && !getHtmlText.isLoading && getHtmlText.isSuccess) {
			const iframe = iframeRef.current;
			iframe.srcdoc = getHtmlText?.data;
		}
	}, [getHtmlText?.isSuccess, getHtmlText?.isRefetching, isMobile, getHtmlText?.data]);

	const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
		setMoreAnchorEl(event.currentTarget);
	};

	const handleMoreClose = () => {
		setMoreAnchorEl(null);
	};

	const handleMenuIconClick = (event: React.MouseEvent<HTMLElement>) => {
		setMenuIconAnchorEl(event.currentTarget);
	};

	const handleMenuIconClose = () => {
		setMenuIconAnchorEl(null);
	};

	const handleQuotationDelete = async () => {
		handleOpen({
			title: "Delete Quotation",
			message: "Are you sure you want to delete this quotation?",
			onConfirm: async () => {
				await handleDelete(quotationId);
				navigate("/quotation/quotationlist");
			},
			onCancel: () => {
				cleanUp();
			},
			confirmButtonText: "Delete",
		});
	};

	const menuLists = [
		{
			name: "Share",
			func: () => {
				navigate(`/quotation/quotationtemplate/${quotationId}`);
				handleCloseAll();
			},
		},
		{
			name: "Mark Accepted",
			func: () => {
				handleMarkedAccepted(quotationId);
				handleCloseAll();
			},
		},
		{
			name: "Mark Rejected",
			func: () => {
				handleMarkedRejected(quotationId);
				handleCloseAll();
			},
		},
		{
			name: "Mark Sent",
			func: () => {
				handleMarkedSendMail(quotationId);
				handleCloseAll();
			},
		},
		{
			name: "Delete",
			func: async () => {
				await handleQuotationDelete();
				handleCloseAll();
			},
		},
	];
	const buttonList = [
		{
			name: "Download",
			icon: FileDownloadOutlined,
			func: () => {
				if (isMobile) {
					generatePdfFromHtml({
						html: getHtmlText?.data ?? "",
					});
					return;
				}
				generatePdfFromRef({
					iframeRef,
				});
				handleCloseAll();
			},
		},
		{
			name: "Send Mail",
			icon: EmailOutlined,
			func: async () => {
				await handleSendMail(quotationId, getQuotationData?.data?.customer?.email ?? "");
				handleCloseAll();
			},
		},
		{
			name: "Convert to invoice",
			icon: "WhatsApp",
			func: async () => {
				await handleConvertToInvoice(quotationId);
				handleCloseAll();
			},
		},
		{
			name: "Edit",
			icon: CreateOutlined,
			func: () => {
				handleEdit(quotationId);
				handleCloseAll();
			},
		},

		{
			name: "",
			icon: MoreVertOutlined,
			func: handleMoreClick,
		},
	];

	const buttonListForSmallSrn = [
		...buttonList,
		{
			name: "Share",
			icon: ShareOutlined,
			func: () => {
				handleShare(quotationId);
				handleCloseAll();
			},
		},

		{
			name: "Mark Accepted",
			icon: SwipeRightOutlined,
			func: async () => {
				await handleMarkedAccepted(quotationId);
				handleCloseAll();
			},
		},

		{
			name: "Mark Rejected",
			icon: SwipeLeftOutlined,
			func: async () => {
				await handleMarkedRejected(quotationId);
				handleCloseAll();
			},
		},
		{
			name: "Mark Sent",
			icon: SendOutlined,
			func: async () => {
				await handleMarkedSendMail(quotationId);
				handleCloseAll();
			},
		},

		{
			name: "Delete",
			icon: DeleteOutline,
			func: async () => {
				await handleQuotationDelete();
				handleCloseAll();
			},
		},
	];

	if (
		getHtmlText.isLoading ||
		getQuotationData?.isLoading ||
		getQuotationData?.isRefetching ||
		getQuotationData?.isFetching ||
		getHtmlText?.isRefetching ||
		getHtmlText?.isFetching
	) {
		return <Loader />;
	}
	if (!getHtmlText?.data) return <NoDataFound message="No Data Found" />;

	const openMore = Boolean(moreAnchorEl);
	const openMenuIcon = Boolean(menuIconAnchorEl);

	return (
		<Box
			sx={{
				p: IsPublic ? 2 : 0,
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Box>
					<Typography variant="h3" color={"secondary.dark"}>
						#{Constants?.quotationDefaultPrefix}-{getQuotationData?.data?.quatation_number}
					</Typography>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Typography variant="body1" color={"secondary.dark"}>
							Status:
						</Typography>
						<Chip
							label={getQuotationData?.data?.status}
							variant="filled"
							color={
								Constants?.invoiceStatusColorEnums[getQuotationData?.data?.status ?? ""] ??
								"default"
							}
						/>
					</Box>
				</Box>

				{!IsPublic && (
					<Box display={{ xs: "block", lg: "none" }}>
						<IconButton
							aria-label="more"
							id="menu-icon-button"
							aria-controls={openMenuIcon ? "menu-icon-menu" : undefined}
							aria-expanded={openMenuIcon ? "true" : undefined}
							aria-haspopup="true"
							onClick={handleMenuIconClick}
						>
							<MenuIcon />
						</IconButton>
					</Box>
				)}
				{IsPublic && (
					<Button
						variant="contained"
						startIcon={<DownloadIcon />}
						onClick={() => {
							if (isMobile) {
								generatePdfFromHtml({
									html: getHtmlText?.data ?? "",
								});
								return;
							}
							generatePdfFromRef({
								iframeRef,
							});
						}}
					>
						Download
					</Button>
				)}
			</Box>
			{!IsPublic && (
				<ButtonGroup
					sx={{
						width: "100%",
						bgcolor: { xs: "", md: "custom.transparentWhite" },
						display: { xs: "none", lg: "flex" },
						flexWrap: { xs: "wrap" },
						my: 2,
					}}
					variant="text"
					aria-label="Basic button group"
				>
					{buttonList.map((item, index) => (
						<Button sx={styles} onClick={item.func} key={index}>
							<item.icon sx={{ mr: 1 }} />
							{item.name}
						</Button>
					))}
				</ButtonGroup>
			)}
			<Menu anchorEl={moreAnchorEl} open={openMore} onClose={handleMoreClose}>
				{menuLists.map((item, index) => (
					<MenuItem
						onClick={() => {
							item.func();
							handleMoreClose();
						}}
						sx={{ pr: 6 }}
						key={index}
					>
						{item.name}
					</MenuItem>
				))}
			</Menu>

			<Menu
				id="menu-icon-menu"
				MenuListProps={{
					"aria-labelledby": "menu-icon-button",
				}}
				anchorEl={menuIconAnchorEl}
				open={openMenuIcon}
				onClose={handleMenuIconClose}
				PaperProps={{
					style: {
						maxHeight: "100%",
						width: "20ch",
					},
				}}
			>
				{buttonListForSmallSrn
					.filter((item) => item.name !== "")
					.map((item, index) => {
						return (
							<MenuItem onClick={item.func} key={index}>
								<item.icon sx={{ mr: 1 }} />
								{item.name}
							</MenuItem>
						);
					})}
			</Menu>

			{!isMobile ? (
				<Box
					ref={iframeRef}
					component="iframe"
					sx={{
						width: {
							xs: "1100px",
							md: "100%",
						},
						height: "80vh",
						overflowX: { xs: "scroll", sm: "visible" },
					}}
				></Box>
			) : (
				<QuotationTemplateCard
					quotationId={quotationId}
					downloadfunc={() => {
						if (isMobile) {
							generatePdfFromHtml({
								html: getHtmlText?.data ?? "",
							});
						} else {
							generatePdfFromRef({
								iframeRef,
							});
						}
					}}
				/>
			)}
		</Box>
	);
};

export default QuotationDetail;
