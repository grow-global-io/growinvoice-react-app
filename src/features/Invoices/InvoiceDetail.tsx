import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
	MoreVertOutlined,
	FileDownloadOutlined,
	EmailOutlined,
	WhatsApp,
	CreateOutlined,
	PaymentsOutlined,
	ShareOutlined,
	DeleteOutline,
	PaidOutlined,
	SendOutlined,
} from "@mui/icons-material";

import { Box, Chip, Typography, useMediaQuery } from "@mui/material";
import Loader from "@shared/components/Loader";
import NoDataFound from "@shared/components/NoDataFound";
import { useNavigate } from "react-router-dom";
import InvoiceTemplateCard from "./InvoiceTemplateCard";
import {
	useInvoiceControllerInvoicePublicFindOne,
	useInvoiceControllerTest,
} from "@api/services/invoice";
import { usePdfExport } from "@shared/hooks/usePdfExport";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Constants } from "@shared/constants";
import { useConfirmDialogStore } from "@store/confirmDialog";
import { useInvoiceHook } from "./invoiceHooks/useInvoiceHook";
import { useCreatePaymentStore } from "@store/createPaymentStore";
import { useGatewaydetailsControllerFindEnabledAll } from "@api/services/gatewaydetails";

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

const InvoiceDetail = ({ invoiceId, IsPublic }: { invoiceId: string; IsPublic?: boolean }) => {
	const navigate = useNavigate();
	const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
	const [menuIconAnchorEl, setMenuIconAnchorEl] = useState<null | HTMLElement>(null);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const { generatePdfFromRef, generatePdfFromHtml } = usePdfExport();
	const { handleOpen, cleanUp } = useConfirmDialogStore();
	const isMobile = useMediaQuery("(max-width:800px)");
	const {
		handleDelete,
		handleShare,
		handlePaid,
		handleMailedSent,
		handleSendMail,
		handleEdit,
		handleRedirectStripePayment,
		handleRazorPayPayment,
	} = useInvoiceHook();
	const { setOpenPaymentFormWithInvoiceId } = useCreatePaymentStore.getState();

	const getHtmlText = useInvoiceControllerTest(invoiceId ?? "", {
		query: {
			enabled: invoiceId !== undefined,
			gcTime: 0,
			staleTime: 0,
		},
	});

	const getInvoiceData = useInvoiceControllerInvoicePublicFindOne(invoiceId ?? "", {
		query: {
			enabled: invoiceId !== undefined,
		},
	});

	const enabledpayment = useGatewaydetailsControllerFindEnabledAll({
		user_id: getInvoiceData?.data?.user_id ?? "",
	});
	const StripeObject = enabledpayment?.data?.find((item) => item?.type === "Stripe");
	const razorpayObject = enabledpayment?.data?.find((item) => item?.type === "Razorpay");

	useEffect(() => {
		if (iframeRef.current && !getHtmlText.isLoading && getHtmlText.isSuccess) {
			const iframe = iframeRef.current;
			iframe.srcdoc = getHtmlText?.data;
		}
	}, [getHtmlText?.isSuccess, getHtmlText?.isRefetching, isMobile]);

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

	const handleCloseAll = async () => {
		handleMenuIconClose();
		handleMoreClose();
	};

	const handleInvoiceDelete = () => {
		handleOpen({
			title: "Delete Invoice",
			message: "Are you sure you want to delete this invoice?",
			onConfirm: async () => {
				await handleDelete(invoiceId);
				navigate("/invoice/invoicelist");
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
				handleShare(invoiceId);
				handleCloseAll();
			},
		},
		{
			name: "Marked Paid",
			func: async () => {
				await handlePaid(invoiceId);
				handleCloseAll();
			},
		},
		{
			name: "Mark Send",
			func: async () => {
				await handleMailedSent(invoiceId);
				handleCloseAll();
			},
		},
		{
			name: "Delete",
			func: async () => {
				handleInvoiceDelete();
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
				await handleSendMail(invoiceId, getInvoiceData?.data?.customer?.email ?? "");
				handleCloseAll();
			},
		},
		{
			name: "Send Whatsapp",
			icon: WhatsApp,
			func: () => {
				window.open(
					`https://api.whatsapp.com/send/?phone=${getInvoiceData?.data?.customer?.phone}&text=${window.location.origin}/invoice/invoicetemplate/${invoiceId}&type=url&app_absent=0`,
					"_blank",
				);
				handleCloseAll();
			},
		},
		{
			name: "Edit",
			icon: CreateOutlined,
			func: () => {
				handleEdit(invoiceId);
				handleCloseAll();
			},
		},
		{
			name: "Enter Payment",
			icon: PaymentsOutlined,
			func: () => {
				setOpenPaymentFormWithInvoiceId(true, invoiceId);
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
				navigate(`/invoice/invoicetemplate/${invoiceId}`);
				handleCloseAll();
			},
		},

		{
			name: "Marked Paid",
			icon: PaidOutlined,
			func: async () => {
				await handlePaid(invoiceId);
				handleCloseAll();
			},
		},

		{
			name: "Mark Send",
			icon: SendOutlined,
			func: async () => {
				await handleMailedSent(invoiceId);
				handleCloseAll();
			},
		},

		{
			name: "Delete",
			icon: DeleteOutline,
			func: () => {
				handleInvoiceDelete();
				handleCloseAll();
			},
		},
	];
	if (
		getHtmlText.isLoading ||
		getInvoiceData?.isLoading ||
		getInvoiceData?.isRefetching ||
		getInvoiceData?.isFetching ||
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
						#{Constants?.invoiceDefaultPrefix}-{getInvoiceData?.data?.invoice_number}
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
							label={getInvoiceData?.data?.status}
							variant="filled"
							color={
								Constants?.invoiceStatusColorEnums[getInvoiceData?.data?.status ?? ""] ?? "default"
							}
						/>
					</Box>
				</Box>

				{!IsPublic && getInvoiceData?.data?.paid_status === "Unpaid" && (
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
				{(IsPublic || getInvoiceData?.data?.paid_status === "Paid") && (
					<Box>
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
						{StripeObject && getInvoiceData?.data?.status !== "Paid" && (
							<Button
								onClick={() => {
									handleRedirectStripePayment(invoiceId, getInvoiceData?.data?.user_id ?? "");
								}}
								variant="outlined"
							>
								Payment With Stripe
							</Button>
						)}
						{razorpayObject && getInvoiceData?.data?.status !== "Paid" && (
							<Button
								onClick={() => {
									// handleRedirectStripePayment(invoiceId, getInvoiceData?.data?.user_id ?? "");
									handleRazorPayPayment({
										invoiceId,
										userId: getInvoiceData?.data?.user_id ?? "",
										razorpaykey: razorpayObject?.key ?? "",
									});
								}}
								variant="outlined"
							>
								Payment With Razorpay
							</Button>
						)}
					</Box>
				)}
			</Box>
			{!IsPublic && getInvoiceData?.data?.paid_status === "Unpaid" && (
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
				<InvoiceTemplateCard
					invoiceId={invoiceId}
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

export default InvoiceDetail;
