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
		try {
			// Try to verify the token (login existing user)
			const verifyResponse = await authControllerVerifyGoogleToken({
				token: credentialResponse.credential,
			});
			if (verifyResponse?.authToken) {
				setToken(verifyResponse.authToken);
				// Redirect to dashboard after successful login
				navigate("/");
				return;
			}
			throw new Error("No auth token from verification");
		} catch (error: any) {
			// Check if error response contains authToken (some APIs return it in error)
			const errorAuthToken = error?.response?.data?.authToken;
			if (errorAuthToken) {
				setToken(errorAuthToken);
				navigate("/");
				return;
			}
			// If verification fails, try to create a new account
			try {
				// Decode the Google token to get user info
				const decodedToken = decodeJWT(credentialResponse.credential);
				if (!decodedToken || !decodedToken.email) {
					throw new Error("Failed to decode Google token");
				}

				// Extract user info from the token
				const email = decodedToken.email;
				const name = decodedToken.name || decodedToken.given_name || email.split("@")[0];

				// Generate a random secure password for Google sign-in users
				// They'll never need to use it since they authenticate via Google
				const randomPassword =
					Math.random().toString(36).slice(2) +
					Math.random().toString(36).slice(2) +
					Math.random().toString(36).toUpperCase().slice(2) +
					"@123";

				// Create a new user account (or login if already exists)
				// The API now returns { message: string, authToken: string } and logs in existing users
				const createUserResponse = await userControllerCreateUser({
					name: name,
					companyName: name, // Use name as company name for Google sign-in users
					email: email,
					phone: "", // Google doesn't provide phone number
					password: randomPassword, // Random password for Google sign-in users
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
					setToken(authToken);
					// User is now logged in, redirect to dashboard
					navigate("/");
					return;
				} else {
					throw new Error("No auth token received from account creation");
				}
			} catch (createError: any) {
				console.error("Failed to create account:", createError);

				// Check all possible locations for authToken in error response
				const errorResponse = createError?.response?.data;
				const errorAuthToken =
					errorResponse?.authToken ||
					errorResponse?.data?.authToken ||
					errorResponse?.token ||
					createError?.authToken ||
					createError?.data?.authToken;

				if (errorAuthToken) {
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

				if (isDuplicateEmail) {
					// Email already exists - the user should be logged in automatically
					// Try multiple approaches to get the authToken and log them in

					// Approach 1: Try to verify the Google token (most reliable for existing Google users)
					try {
						const retryResponse = await authControllerVerifyGoogleToken({
							token: credentialResponse.credential,
						});
						if (retryResponse?.authToken) {
							setToken(retryResponse.authToken);
							navigate("/");
							return;
						}
					} catch (retryError: any) {
						console.log("Token verification retry failed:", retryError);
						// Check if retry error also has authToken
						const retryAuthToken = retryError?.response?.data?.authToken || retryError?.authToken;
						if (retryAuthToken) {
							setToken(retryAuthToken);
							navigate("/");
							return;
						}
					}

					// Approach 2: Wait and retry verification (handles race conditions in production)
					try {
						await new Promise((resolve) => setTimeout(resolve, 1000));
						const finalRetry = await authControllerVerifyGoogleToken({
							token: credentialResponse.credential,
						});
						if (finalRetry?.authToken) {
							setToken(finalRetry.authToken);
							navigate("/");
							return;
						}
					} catch (finalError: any) {
						console.log("Final token verification failed:", finalError);
						// Check if final error has authToken
						const finalAuthToken = finalError?.response?.data?.authToken || finalError?.authToken;
						if (finalAuthToken) {
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
						await new Promise((resolve) => setTimeout(resolve, 2000));
						const lastRetry = await authControllerVerifyGoogleToken({
							token: credentialResponse.credential,
						});
						if (lastRetry?.authToken) {
							setToken(lastRetry.authToken);
							navigate("/");
							return;
						}
					} catch (lastError) {
						// All attempts failed - user exists but can't be logged in with Google
						// This might be a backend issue in production
						console.error("All login attempts failed for existing user:", lastError);
					}

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
