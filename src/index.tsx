import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { environment } from "@enviroment";
import { ErrorBoundary } from "react-error-boundary";
import InternalServerErrorPage from "@pages/InternalServerErrorPage";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			staleTime: 1 * 60 * 60 * 1000, // 1 hour
			retry: false,
		},
	},
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<BrowserRouter>
					<ErrorBoundary FallbackComponent={InternalServerErrorPage}>
						<App />
					</ErrorBoundary>
				</BrowserRouter>
			</ThemeProvider>
			{!environment.production && <ReactQueryDevtools />}
		</QueryClientProvider>
	</React.StrictMode>,
);
