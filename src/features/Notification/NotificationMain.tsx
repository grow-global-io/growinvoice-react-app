import { Box, Button, Drawer, Paper, Stack, Typography } from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { useDialog } from "@shared/hooks/useDialog";
import { useCallback, useRef } from "react";
import {
	notificationsControllerFindAll,
	useNotificationsControllerMarkAsRead,
} from "@api/services/notifications";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import NoDataFound from "@shared/components/NoDataFound";
import NotificationListItem from "./NotificationItem";
import { NotificationDto } from "@api/services/models";

const NotificationMain = () => {
	const queryClient = useQueryClient();
	const { handleClickOpen, handleClose, open } = useDialog();
	const observer = useRef<IntersectionObserver | null>(null); // Add type annotation for the observer ref
	const markasRead = useNotificationsControllerMarkAsRead();
	const {
		data: alertsNotificationListsa,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		initialPageParam: undefined,
		queryKey: ["notificationsControllerFindAll"],
		queryFn: async (pageParams: { pageParam: string | undefined }) => {
			const notifications = await notificationsControllerFindAll({
				take: "10",
				skip: pageParams?.pageParam ?? undefined,
			});
			return notifications;
		},
		getNextPageParam: (lastPage) => {
			return lastPage.nextId;
		},
	});

	const flatNotifications = alertsNotificationListsa?.pages.flatMap((page) => page.results) ?? [];

	const lastElementRef = useCallback(
		(node: HTMLElement | null) => {
			if (node && hasNextPage && !isFetchingNextPage) {
				observer.current?.disconnect();
				observer.current = new IntersectionObserver(async (entries) => {
					if (entries[0].isIntersecting) {
						await fetchNextPage();
					}
				});
				observer.current.observe(node);
			}
		},
		[hasNextPage, isFetchingNextPage],
	);

	const handleMarkAsRead = async () => {
		await markasRead.mutateAsync();
		queryClient.invalidateQueries({
			queryKey: ["notificationsControllerFindAll"],
		});
		handleClose();
	};

	return (
		<>
			<Box
				mx={{ xs: 0, sm: 2 }}
				sx={{ cursor: "pointer" }}
				onClick={() => {
					handleClickOpen();
				}}
			>
				<NotificationsOutlinedIcon />
			</Box>
			<Drawer
				PaperProps={{
					sx: {
						height: "calc(100% - 100px)",
						maxWidth: "25%",
						minWidth: "25%",
						top: 66,
						right: 10,
						borderRadius: 2,
					},
				}}
				slotProps={{
					backdrop: {
						invisible: true,
					},
				}}
				open={open}
				anchor="right"
				onClose={handleClose}
			>
				<Paper
					elevation={0}
					sx={{
						display: "flex",
						flexDirection: "column",
						padding: 1,
						width: "95%",
					}}
				>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="flex-start"
							color="text.primary"
							spacing={2}
						>
							<Typography
								variant="h6"
								sx={{
									color: "text.secondary",
									p: 1,
									py: 2,
									fontSize: 16,
								}}
							>
								NOTIFICATIONS
							</Typography>
						</Stack>
						<Box sx={{ pt: 0.1 }}>
							<Button
								size="small"
								sx={{ fontSize: 8, borderRadius: 10 }}
								variant="contained"
								color="primary"
								onClick={handleMarkAsRead}
							>
								Mark all as read
							</Button>
						</Box>
					</Box>
					{flatNotifications?.length > 0 ? (
						flatNotifications.map((notification, index) =>
							flatNotifications?.length === index + 1 ? (
								<div ref={lastElementRef} key={notification?.id}>
									<NotificationListItem
										key={notification?.id}
										data={notification as NotificationDto}
									/>
								</div>
							) : (
								<div key={notification?.id}>
									<NotificationListItem
										key={notification?.id}
										data={notification as NotificationDto}
									/>
								</div>
							),
						)
					) : (
						<NoDataFound message="No  Notifications..." />
					)}
					{isFetchingNextPage && <>Loading..............</>}
				</Paper>
			</Drawer>
		</>
	);
};

export default NotificationMain;
