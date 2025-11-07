import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { authControllerVerifyGoogleToken } from "@api/services/auth";
import { useAuthStore } from "@store/auth";
import { AlertService } from "@shared/services/AlertService";
import { userControllerCreateUser } from "@api/services/users";

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
	const handleSuccess = async (credentialResponse: CredentialResponse) => {
		if (!credentialResponse.credential) return;
		try {
			// Try to verify the token (login existing user)
			const a = await authControllerVerifyGoogleToken({
				token: credentialResponse.credential,
			});
			if (!a) throw new Error("No auth token");
			setToken(a.authToken);
		} catch (error: any) {
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

				// Create a new user account
				const createUserResponse = await userControllerCreateUser({
					name: name,
					companyName: name, // Use name as company name for Google sign-in users
					email: email,
					phone: "", // Google doesn't provide phone number
					password: randomPassword, // Random password for Google sign-in users
				});

				// After creating the account, try to verify the token again to log them in
				if (createUserResponse) {
					const loginResponse = await authControllerVerifyGoogleToken({
						token: credentialResponse.credential,
					});
					if (loginResponse?.authToken) {
						setToken(loginResponse.authToken);
						AlertService.instance.successMessage("Account created successfully!");
					} else {
						throw new Error("Failed to login after account creation");
					}
				}
			} catch (createError: any) {
				console.error("Failed to create account:", createError);
				// Check if it's a duplicate email error
				if (
					createError?.response?.data?.message?.toLowerCase().includes("email") ||
					createError?.response?.data?.message?.toLowerCase().includes("already")
				) {
					// Email already exists, try to verify again (maybe user was just created)
					try {
						const retryResponse = await authControllerVerifyGoogleToken({
							token: credentialResponse.credential,
						});
						if (retryResponse?.authToken) {
							setToken(retryResponse.authToken);
							return;
						}
					} catch (retryError) {
						// Fall through to error message
					}
				}
				AlertService.instance.errorMessage(
					createError?.response?.data?.message || "Email not registered",
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
