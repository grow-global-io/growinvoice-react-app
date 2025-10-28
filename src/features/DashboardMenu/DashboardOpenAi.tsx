import {
	OpenaiControllerCreate200Item,
	OpenaiControllerCreateGraph200Item,
} from "@api/services/models";
import { useOpenaiControllerCreate, useOpenaiControllerCreateGraph } from "@api/services/openai";
import {
	Box,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	Tooltip,
	ListItemIcon,
	Radio,
	Typography,
} from "@mui/material";
import { Field, Form, Formik, FormikProps } from "formik";
import React, { useRef, useState, useEffect } from "react";
import * as Yup from "yup";
import { AlertService } from "@shared/services/AlertService";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useAuthStore } from "@store/auth";

import { CiBoxList } from "react-icons/ci";
import PublishIcon from "@mui/icons-material/Publish";

// Chat message types
type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	text: string;
	createdAt: number;
};

const CHAT_STORAGE_KEY = "aiChatMessages";

const DashboardOpenAi = () => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const openTypeMenu = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleCloseTypeMenu = () => {
		setAnchorEl(null);
	};
	const { user } = useAuthStore();
	const initialValues = {
		prompt: "",
		type: "Table",
		title: "",
		user_id: user?.id ?? "",
		query: "",
	};
	const formikRef = useRef<FormikProps<typeof initialValues>>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	// Load chat messages from localStorage on component mount
	useEffect(() => {
		try {
			const cached = localStorage.getItem(CHAT_STORAGE_KEY);
			if (cached) {
				setMessages(JSON.parse(cached));
			}
		} catch (_) {
			// ignore parsing errors
		}
	}, []);

	// Save chat messages to localStorage whenever messages change
	useEffect(() => {
		try {
			localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
		} catch (_) {
			// ignore storage errors
		}
		scrollToBottom();
	}, [messages]);

	// Clear chat history on logout
	useEffect(() => {
		const handleLogout = () => {
			localStorage.removeItem(CHAT_STORAGE_KEY);
			setMessages([]);
		};

		// Listen for logout events (you may need to adjust this based on your auth implementation)
		window.addEventListener("logout", handleLogout);
		return () => window.removeEventListener("logout", handleLogout);
	}, []);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const validationSchema = Yup.object().shape({
		prompt: Yup.string().required("Prompt is required"),
		type: Yup.string().required("Type is required"),
	});

	const openAiApi = useOpenaiControllerCreate();
	const openAiApiGraph = useOpenaiControllerCreateGraph({
		mutation: {
			onError: () => {
				AlertService.instance?.errorMessage("Error occurred! please try again after 30 seconds");
			},
		},
	});

	const handleSubmit = async (values: typeof initialValues) => {
		// Add user message to chat
		const userMessage: ChatMessage = {
			id: `${Date.now()}-user`,
			role: "user",
			text: values.prompt,
			createdAt: Date.now(),
		};
		setMessages((prev) => [...prev, userMessage]);

		if (values?.type === "Table") {
			try {
				const a = await openAiApi.mutateAsync({
					data: {
						prompt: values.prompt,
					},
				});
				const keysData = a as unknown as OpenaiControllerCreate200Item;
				formikRef.current?.setFieldValue("prompt", keysData?.prompt);
				formikRef.current?.setFieldValue("query", keysData?.query);

				// Create AI response message
				const replyText = (() => {
					// If there's a message, show that instead of raw query
					if ((keysData as any)?.message) return (keysData as any)?.message as string;

					// If there's result data, format it nicely
					if ((keysData as any)?.result) {
						try {
							const result = (keysData as any)?.result;
							const resultCount = Array.isArray(result) ? result.length : 0;

							// If it's a single value (like profit calculation), show it nicely
							if (resultCount === 1 && typeof result[0] === "object") {
								const data = result[0];
								const keys = Object.keys(data);
								if (keys.length === 1) {
									const key = keys[0];
									const value = data[key];
									return `📊 **${key.replace(/_/g, " ").toUpperCase()}**: ${value}`;
								}
							}

							// For multiple records, show a summary
							if (resultCount > 0) {
								return `📊 I found ${resultCount} records. Here's the data:\n\n${JSON.stringify(result, null, 2).slice(0, 1500)}${JSON.stringify(result, null, 2).length > 1500 ? "\n\n... (truncated)" : ""}`;
							}

							return "📊 I processed your request but no data was found.";
						} catch (_) {
							return "📊 I processed your request and found some data for you.";
						}
					}

					// Don't show raw SQL queries, show a friendly message instead
					return "📊 I've processed your request and retrieved the data for you.";
				})();

				const assistantMessage: ChatMessage = {
					id: `${Date.now()}-assistant`,
					role: "assistant",
					text: replyText,
					createdAt: Date.now(),
				};
				setMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				const errorMessage: ChatMessage = {
					id: `${Date.now()}-assistant`,
					role: "assistant",
					text: "❌ Sorry, I encountered an error processing your request. Please try again.",
					createdAt: Date.now(),
				};
				setMessages((prev) => [...prev, errorMessage]);
				console.error(error);
			}
		} else {
			try {
				const response = await openAiApiGraph.mutateAsync({
					data: {
						prompt: values.prompt,
					},
				});
				const keysData = response as unknown as OpenaiControllerCreateGraph200Item;
				formikRef.current?.setFieldValue("prompt", keysData?.prompt);
				formikRef.current?.setFieldValue("query", keysData?.query);

				const replyText =
					(keysData as any)?.message ||
					"📈 I've created a chart visualization based on your request.";
				const assistantMessage: ChatMessage = {
					id: `${Date.now()}-assistant`,
					role: "assistant",
					text: replyText,
					createdAt: Date.now(),
				};
				setMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				console.error(error);
				const errorMessage: ChatMessage = {
					id: `${Date.now()}-assistant`,
					role: "assistant",
					text: "❌ Sorry, I encountered an error creating the chart. Please try again.",
					createdAt: Date.now(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		}
	};

	// Chat bubble component
	const ChatBubble = ({ message }: { message: ChatMessage }) => {
		const isUser = message.role === "user";
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: isUser ? "flex-end" : "flex-start",
					mb: 2,
					px: 2,
				}}
			>
				<Box
					sx={{
						maxWidth: "70%",
						px: 2,
						py: 1.5,
						borderRadius: 3,
						backgroundColor: isUser ? "primary.main" : "grey.100",
						color: isUser ? "primary.contrastText" : "text.primary",
						boxShadow: 1,
						wordWrap: "break-word",
						whiteSpace: "pre-wrap",
					}}
				>
					<Typography variant="body1">{message.text}</Typography>
				</Box>
			</Box>
		);
	};

	return (
		<Box
			sx={{
				height: "85vh",
				display: "flex",
				flexDirection: "column",
				position: "relative",
			}}
		>
			{/* Chat messages area */}
			<Box
				sx={{
					flex: 1,
					overflow: "auto",
					p: 2,
					bgcolor: "background.paper",
					display: "flex",
					flexDirection: "column",
					position: "relative",
				}}
			>
				{messages.length === 0 && (
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							zIndex: 1,
						}}
					>
						<Typography variant="h4" color="text.secondary" textAlign="center">
							Hey! How can I help you today?
						</Typography>
					</Box>
				)}
				{messages.map((message) => (
					<ChatBubble key={message.id} message={message} />
				))}
				<div ref={messagesEndRef} />
			</Box>

			{/* Input area - Fixed at bottom */}
			<Box
				sx={{
					p: 2,
					bgcolor: "background.paper",
					display: "flex",
					justifyContent: "center",
					borderTop: 1,
					borderColor: "divider",
				}}
			>
				<Box sx={{ width: "100%", maxWidth: "600px" }}>
					<Formik
						initialValues={initialValues}
						onSubmit={handleSubmit}
						validationSchema={validationSchema}
						innerRef={formikRef}
					>
						{(formik) => {
							const handleMenuItemClick = (value: string) => {
								formik.setFieldValue("type", value);
								handleCloseTypeMenu();
							};
							return (
								<Form>
									<Field
										name="prompt"
										placeholder="Tell us what you want to see?"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Tooltip title="Type">
														<Box>
															<IconButton onClick={handleClick}>
																<CiBoxList />
															</IconButton>
														</Box>
													</Tooltip>
												</InputAdornment>
											),
											endAdornment: (
												<InputAdornment position="end">
													<IconButton type="submit" disabled={openAiApi?.isPending}>
														<PublishIcon />
													</IconButton>
												</InputAdornment>
											),
										}}
										component={TextFormField}
									/>
									<Menu anchorEl={anchorEl} open={openTypeMenu} onClose={handleCloseTypeMenu}>
										{["Table", "Graph"].map((item, index) => {
											return (
												<MenuItem
													sx={{ pr: 6 }}
													onClick={() => handleMenuItemClick(item)}
													key={index}
												>
													<ListItemIcon>
														<Radio checked={formik.values.type === item} value={item} />
													</ListItemIcon>
													{item}
												</MenuItem>
											);
										})}
									</Menu>
								</Form>
							);
						}}
					</Formik>
				</Box>
			</Box>
		</Box>
	);
};

export default DashboardOpenAi;
