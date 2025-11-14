import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { authControllerVerifyGoogleToken } from "@api/services/auth";
import { useAuthStore } from "@store/auth";
import { AlertService } from "@shared/services/AlertService";
import { userControllerCreateUser } from "@api/services/users";
import { useNavigate } from "react-router-dom";

// Helper function to decode JWT token (Google credential is a JWT)
const decodeJWT = (token: string): any => {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((c) => {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join(""),
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error("Failed to decode JWT:", error);
		return null;
	}
};

const SigninWithGoogle = () => {
	const { setToken } = useAuthStore();
	const navigate = useNavigate();
	const handleSuccess = async (credentialResponse: CredentialResponse) => {
		if (!credentialResponse.credential) return;

		// Decode the Google token early to get user info (needed for error logging)
		const decodedToken = decodeJWT(credentialResponse.credential);
		const email = decodedToken?.email;
		const name = decodedToken?.name || decodedToken?.given_name || email?.split("@")[0];

		try {
			// Try to verify the token (login existing user)
			console.log("=== INITIAL GOOGLE TOKEN VERIFICATION ===");
			console.log("Email:", email);
			console.log("Calling: POST /api/auth/verify-google-token");

			const verifyResponse = await authControllerVerifyGoogleToken({
				token: credentialResponse.credential,
			});

			console.log("✅ INITIAL VERIFY RESPONSE (SUCCESS):", {
				fullResponse: verifyResponse,
				authToken: verifyResponse?.authToken,
				hasAuthToken: !!verifyResponse?.authToken,
				responseKeys: verifyResponse ? Object.keys(verifyResponse) : [],
			});

			if (verifyResponse?.authToken) {
				console.log("✅ Success! Logging in user with authToken from initial verification");
				setToken(verifyResponse.authToken);
				// Redirect to dashboard after successful login
				navigate("/");
				return;
			}
			throw new Error("No auth token from verification");
		} catch (error: any) {
			console.log("❌ INITIAL VERIFY RESPONSE (ERROR):", {
				error: error,
				errorMessage: error?.message,
				response: error?.response,
				responseData: error?.response?.data,
				responseStatus: error?.response?.status,
				responseStatusText: error?.response?.statusText,
				responseHeaders: error?.response?.headers,
				fullErrorObject: JSON.stringify(error, null, 2),
			});

			// Check if error response contains authToken (some APIs return it in error)
			const errorAuthToken = error?.response?.data?.authToken;
			if (errorAuthToken) {
				console.log("✅ Found authToken in error response, logging in user");
				setToken(errorAuthToken);
				navigate("/");
				return;
			}
			// If verification fails, try to create a new account
			try {
				if (!decodedToken || !email) {
					throw new Error("Failed to decode Google token");
				}

				// Generate a random secure password for Google sign-in users
				// They'll never need to use it since they authenticate via Google
				const randomPassword =
					Math.random().toString(36).slice(2) +
					Math.random().toString(36).slice(2) +
					Math.random().toString(36).toUpperCase().slice(2) +
					"@123";

				// Create a new user account (or login if already exists)
				// The API now returns { message: string, authToken: string } and logs in existing users
				console.log("=== CREATE USER REQUEST ===");
				console.log("Email:", email);
				console.log("Name:", name);
				console.log("Calling: POST /api/user/create");
				console.log("Request payload:", {
					name: name,
					companyName: name,
					email: email,
					phone: "",
					password: "***hidden***",
				});

				const createUserResponse = await userControllerCreateUser({
					name: name,
					companyName: name, // Use name as company name for Google sign-in users
					email: email,
					phone: "", // Google doesn't provide phone number
					password: randomPassword, // Random password for Google sign-in users
				});

				console.log("✅ CREATE USER RESPONSE (SUCCESS):", {
					fullResponse: createUserResponse,
					responseType: typeof createUserResponse,
					responseKeys: createUserResponse ? Object.keys(createUserResponse) : [],
					authToken: (createUserResponse as any)?.authToken,
					dataAuthToken: (createUserResponse as any)?.data?.authToken,
					resultAuthToken: (createUserResponse as any)?.result?.authToken,
					token: (createUserResponse as any)?.token,
					hasAuthToken: !!(createUserResponse as any)?.authToken,
					fullResponseStringified: JSON.stringify(createUserResponse, null, 2),
				});

				// The API now returns authToken directly, so we can use it immediately
				// Check all possible locations for authToken in the response
				const response = createUserResponse as any;
				const authToken =
					response?.authToken ||
					response?.data?.authToken ||
					response?.result?.authToken ||
					response?.token;

				if (authToken) {
					console.log("✅ Success! Logging in user with authToken from create user response");
					setToken(authToken);
					// User is now logged in, redirect to dashboard
					navigate("/");
					return;
				} else {
					console.warn("⚠️ No authToken found in create user response");
					throw new Error("No auth token received from account creation");
				}
			} catch (createError: any) {
				// Enhanced logging for production debugging
				console.error("❌ CREATE USER RESPONSE (ERROR):", {
					error: createError,
					errorMessage: createError?.message,
					errorCode: createError?.code,
					response: createError?.response,
					responseData: createError?.response?.data,
					responseStatus: createError?.response?.status,
					responseStatusText: createError?.response?.statusText,
					responseHeaders: createError?.response?.headers,
					message: createError?.message,
					responseMessage: createError?.response?.data?.message,
					fullErrorStringified: JSON.stringify(createError, null, 2),
				});

				// Check all possible locations for authToken in error response
				const errorResponse = createError?.response?.data;
				const errorAuthToken =
					errorResponse?.authToken ||
					errorResponse?.data?.authToken ||
					errorResponse?.token ||
					createError?.authToken ||
					createError?.data?.authToken ||
					createError?.response?.authToken;

				if (errorAuthToken) {
					console.log("Found authToken in error response, logging in user");
					setToken(errorAuthToken);
					navigate("/");
					return;
				}

				// Check if it's a duplicate email error
				const errorMessage = (errorResponse?.message || createError?.message || "").toLowerCase();
				const isDuplicateEmail =
					errorMessage.includes("email") ||
					errorMessage.includes("already") ||
					errorMessage.includes("exist") ||
					createError?.response?.status === 409 || // Conflict status code
					createError?.response?.status === 400; // Bad request might also indicate duplicate

				console.log("Is duplicate email error?", isDuplicateEmail, {
					errorMessage,
					status: createError?.response?.status,
				});

				if (isDuplicateEmail) {
					// Email already exists - the user should be logged in automatically
					// Try multiple approaches to get the authToken and log them in
					console.log("Duplicate email detected, attempting to log in user...");

					// Approach 1: Try to verify the Google token (most reliable for existing Google users)
					try {
						console.log("Attempt 1: Verifying Google token...");
						const retryResponse = await authControllerVerifyGoogleToken({
							token: credentialResponse.credential,
						});
						console.log("Token verification response:", retryResponse);
						if (retryResponse?.authToken) {
							console.log("Success! Got authToken from token verification");
							setToken(retryResponse.authToken);
							navigate("/");
							return;
						}
					} catch (retryError: any) {
						console.error("Token verification retry failed:", {
							error: retryError,
							response: retryError?.response,
							responseData: retryError?.response?.data,
							status: retryError?.response?.status,
						});
						// Check if retry error also has authToken
						const retryAuthToken = retryError?.response?.data?.authToken || retryError?.authToken;
						if (retryAuthToken) {
							console.log("Found authToken in retry error response");
							setToken(retryAuthToken);
							navigate("/");
							return;
						}
					}

					// Approach 2: Wait and retry verification (handles race conditions in production)
					try {
						console.log("Attempt 2: Retrying token verification after 1s delay...");
						await new Promise((resolve) => setTimeout(resolve, 1000));
						const finalRetry = await authControllerVerifyGoogleToken({
							token: credentialResponse.credential,
						});
						console.log("Retry response:", finalRetry);
						if (finalRetry?.authToken) {
							console.log("Success! Got authToken from retry");
							setToken(finalRetry.authToken);
							navigate("/");
							return;
						}
					} catch (finalError: any) {
						console.error("Final token verification failed:", {
							error: finalError,
							response: finalError?.response,
							responseData: finalError?.response?.data,
							status: finalError?.response?.status,
						});
						// Check if final error has authToken
						const finalAuthToken = finalError?.response?.data?.authToken || finalError?.authToken;
						if (finalAuthToken) {
							console.log("Found authToken in final error response");
							setToken(finalAuthToken);
							navigate("/");
							return;
						}
					}

					// If all verification attempts fail, the user account exists but isn't linked to Google
					// In this case, we should NOT show "user already exists" error
					// Instead, silently try one more verification or show a helpful message
					console.warn(
						"User exists but Google token verification failed. This might indicate the account isn't linked to Google.",
					);

					// Last attempt: try verification one more time after a longer delay
					try {
						console.log("Attempt 3: Final retry after 2s delay...");
						await new Promise((resolve) => setTimeout(resolve, 2000));
						const lastRetry = await authControllerVerifyGoogleToken({
							token: credentialResponse.credential,
						});
						console.log("Last retry response:", lastRetry);
						if (lastRetry?.authToken) {
							console.log("Success! Got authToken from last retry");
							setToken(lastRetry.authToken);
							navigate("/");
							return;
						}
					} catch (lastError: any) {
						// All attempts failed - user exists but can't be logged in with Google
						// This might be a backend issue in production
						console.error("All login attempts failed for existing user:", {
							error: lastError,
							response: lastError?.response,
							responseData: lastError?.response?.data,
							status: lastError?.response?.status,
						});
					}

					// Log the full error structure for backend debugging
					console.error("PRODUCTION ISSUE - Full error details for backend team:", {
						createErrorFull: createError,
						createErrorResponse: createError?.response,
						createErrorResponseData: createError?.response?.data,
						createErrorStatus: createError?.response?.status,
						email: decodedToken?.email,
					});

					// Don't show error message - the backend should handle this
					// But if we get here, something is wrong with the backend configuration
					AlertService.instance.errorMessage(
						"Unable to sign in. Please try logging in with your email and password, or contact support.",
					);
					return;
				}

				// For other errors, show the error message
				AlertService.instance.errorMessage(
					errorResponse?.message ||
						createError?.message ||
						"Failed to sign in with Google. Please try again.",
				);
			}
		}
	};

	const handleError = () => {
		AlertService.instance.errorMessage("Login Failed");
	};
	return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
};

export default SigninWithGoogle;
