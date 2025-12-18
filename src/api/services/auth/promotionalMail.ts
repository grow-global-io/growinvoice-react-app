import { authInstance } from "../../instances/authInstance";
import type { ErrorType } from "../../instances/authInstance";
import {
	useMutation,
	type UseMutationOptions,
	type UseMutationResult,
	type MutationFunction,
} from "@tanstack/react-query";

export interface SendPromotionalMailDto {
	subject: string; // The subject line of the email
	html: string; // The HTML content of the email body
	sendToAllCustomers?: boolean; // Set to TRUE to send to EVERY customer
	customerIds?: string[]; // Optional: List of customer IDs to send to
	attachments?: {
		// Optional: Array of attachments
		filename: string;
		content: string; // Base64 encoded string
		contentType: string; // e.g. 'image/png', 'application/pdf'
		cid?: string; // Optional: Content-ID for inline images (use in HTML as <img src="cid:${cid}" />)
	}[];
}

// Success response DTO - assuming generic success response or void
export interface SuccessResponseDto {
	message: string;
	success: boolean;
}

export const mailControllerPromotional = (sendPromotionalMailDto: SendPromotionalMailDto) => {
	return authInstance<SuccessResponseDto | void>({
		url: `/api/mail/promotional`,
		method: "POST",
		headers: { "Content-Type": "application/json" },
		data: sendPromotionalMailDto,
	});
};

export const getMailControllerPromotionalMutationOptions = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof mailControllerPromotional>>,
		TError,
		{ data: SendPromotionalMailDto },
		TContext
	>;
}): UseMutationOptions<
	Awaited<ReturnType<typeof mailControllerPromotional>>,
	TError,
	{ data: SendPromotionalMailDto },
	TContext
> => {
	const { mutation: mutationOptions } = options ?? {};

	const mutationFn: MutationFunction<
		Awaited<ReturnType<typeof mailControllerPromotional>>,
		{ data: SendPromotionalMailDto }
	> = (props) => {
		const { data } = props ?? {};

		return mailControllerPromotional(data);
	};

	return { mutationFn, ...mutationOptions };
};

export const useMailControllerPromotional = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof mailControllerPromotional>>,
		TError,
		{ data: SendPromotionalMailDto },
		TContext
	>;
}): UseMutationResult<
	Awaited<ReturnType<typeof mailControllerPromotional>>,
	TError,
	{ data: SendPromotionalMailDto },
	TContext
> => {
	const mutationOptions = getMailControllerPromotionalMutationOptions(options);

	return useMutation(mutationOptions);
};
