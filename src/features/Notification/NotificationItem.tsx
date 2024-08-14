import { NotificationDto } from "@api/services/models";
import { ListItem, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const NotificationItem = ({ data }: { data: NotificationDto }) => {
	return (
		<ListItem sx={{ backgroundColor: data?.read && data?.read === true ? "" : "#f1f1f1" }} divider>
			{/* <ListItemAvatar>
				<Avatar
					sx={{ width: 56, height: 56, textDecoration: "none" }}
					to={`/patients/${data?.userId}`}
					component={Link}
				/>
			</ListItemAvatar> */}
			<ListItemText
				primary={
					<Typography
						variant="h6"
						component="span"
						sx={{ textDecoration: "none", ml: 2 }}
						color="text.secondary"
					>
						{data?.title}
					</Typography>
				}
				secondary={
					<>
						{data?.title ? (
							<Typography ml={2} color="text.secondary">
								{data?.body}
							</Typography>
						) : data?.title === "Task Alert" ? (
							<Typography
								ml={2}
								color="text.secondary"
								component={Link}
								to={`/collaboration?tab=1`}
								sx={{
									textDecoration: "none",
								}}
							>
								{data?.body ?? "Loading..................."}
							</Typography>
						) : (
							<Typography ml={2} color="text.secondary">
								{data?.body ?? "Loading..................."}
							</Typography>
						)}
					</>
				}
			/>
		</ListItem>
	);
};

export default NotificationItem;
