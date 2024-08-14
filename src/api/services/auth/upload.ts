/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */
import { useMutation } from "@tanstack/react-query";
import type {
	MutationFunction,
	UseMutationOptions,
	UseMutationResult,
} from "@tanstack/react-query";
import type {
	UploadControllerUploadFileBody,
	UploadControllerUploadPdfBody,
	UploadResponseDto,
} from "./models";
import { authInstance } from "../../instances/authInstance";
import type { ErrorType } from "../../instances/authInstance";

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export const uploadControllerUploadFile = (
	uploadControllerUploadFileBody: UploadControllerUploadFileBody,
) => {
	const formData = new FormData();
	if (uploadControllerUploadFileBody.file !== undefined) {
		formData.append("file", uploadControllerUploadFileBody.file);
	}

	return authInstance<UploadResponseDto>({
		url: `/api/upload`,
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: formData,
	});
};

export const getUploadControllerUploadFileMutationOptions = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof uploadControllerUploadFile>>,
		TError,
		{ data: UploadControllerUploadFileBody },
		TContext
	>;
}): UseMutationOptions<
	Awaited<ReturnType<typeof uploadControllerUploadFile>>,
	TError,
	{ data: UploadControllerUploadFileBody },
	TContext
> => {
	const { mutation: mutationOptions } = options ?? {};

	const mutationFn: MutationFunction<
		Awaited<ReturnType<typeof uploadControllerUploadFile>>,
		{ data: UploadControllerUploadFileBody }
	> = (props) => {
		const { data } = props ?? {};

		return uploadControllerUploadFile(data);
	};

	return { mutationFn, ...mutationOptions };
};

export type UploadControllerUploadFileMutationResult = NonNullable<
	Awaited<ReturnType<typeof uploadControllerUploadFile>>
>;
export type UploadControllerUploadFileMutationBody = UploadControllerUploadFileBody;
export type UploadControllerUploadFileMutationError = ErrorType<unknown>;

export const useUploadControllerUploadFile = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof uploadControllerUploadFile>>,
		TError,
		{ data: UploadControllerUploadFileBody },
		TContext
	>;
}): UseMutationResult<
	Awaited<ReturnType<typeof uploadControllerUploadFile>>,
	TError,
	{ data: UploadControllerUploadFileBody },
	TContext
> => {
	const mutationOptions = getUploadControllerUploadFileMutationOptions(options);

	return useMutation(mutationOptions);
};
export const uploadControllerUploadPdf = (
	uploadControllerUploadPdfBody: UploadControllerUploadPdfBody,
) => {
	const formData = new FormData();
	if (uploadControllerUploadPdfBody.file !== undefined) {
		formData.append("file", uploadControllerUploadPdfBody.file);
	}

	return authInstance<UploadResponseDto>({
		url: `/api/upload/uploadPdf`,
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: formData,
	});
};

export const getUploadControllerUploadPdfMutationOptions = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof uploadControllerUploadPdf>>,
		TError,
		{ data: UploadControllerUploadPdfBody },
		TContext
	>;
}): UseMutationOptions<
	Awaited<ReturnType<typeof uploadControllerUploadPdf>>,
	TError,
	{ data: UploadControllerUploadPdfBody },
	TContext
> => {
	const { mutation: mutationOptions } = options ?? {};

	const mutationFn: MutationFunction<
		Awaited<ReturnType<typeof uploadControllerUploadPdf>>,
		{ data: UploadControllerUploadPdfBody }
	> = (props) => {
		const { data } = props ?? {};

		return uploadControllerUploadPdf(data);
	};

	return { mutationFn, ...mutationOptions };
};

export type UploadControllerUploadPdfMutationResult = NonNullable<
	Awaited<ReturnType<typeof uploadControllerUploadPdf>>
>;
export type UploadControllerUploadPdfMutationBody = UploadControllerUploadPdfBody;
export type UploadControllerUploadPdfMutationError = ErrorType<unknown>;

export const useUploadControllerUploadPdf = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof uploadControllerUploadPdf>>,
		TError,
		{ data: UploadControllerUploadPdfBody },
		TContext
	>;
}): UseMutationResult<
	Awaited<ReturnType<typeof uploadControllerUploadPdf>>,
	TError,
	{ data: UploadControllerUploadPdfBody },
	TContext
> => {
	const mutationOptions = getUploadControllerUploadPdfMutationOptions(options);

	return useMutation(mutationOptions);
};
