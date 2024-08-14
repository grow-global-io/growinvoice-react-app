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
	CreateUserPlansDto,
	UpdateUserPlanCustomDto,
	UserplansControllerCreate200,
	UserplansControllerUpdate200,
} from "./models";
import { authInstance } from "../../instances/authInstance";
import type { ErrorType } from "../../instances/authInstance";

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export const userplansControllerCreate = (createUserPlansDto: CreateUserPlansDto) => {
	return authInstance<UserplansControllerCreate200 | void>({
		url: `/api/userplans`,
		method: "POST",
		headers: { "Content-Type": "application/json" },
		data: createUserPlansDto,
	});
};

export const getUserplansControllerCreateMutationOptions = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof userplansControllerCreate>>,
		TError,
		{ data: CreateUserPlansDto },
		TContext
	>;
}): UseMutationOptions<
	Awaited<ReturnType<typeof userplansControllerCreate>>,
	TError,
	{ data: CreateUserPlansDto },
	TContext
> => {
	const { mutation: mutationOptions } = options ?? {};

	const mutationFn: MutationFunction<
		Awaited<ReturnType<typeof userplansControllerCreate>>,
		{ data: CreateUserPlansDto }
	> = (props) => {
		const { data } = props ?? {};

		return userplansControllerCreate(data);
	};

	return { mutationFn, ...mutationOptions };
};

export type UserplansControllerCreateMutationResult = NonNullable<
	Awaited<ReturnType<typeof userplansControllerCreate>>
>;
export type UserplansControllerCreateMutationBody = CreateUserPlansDto;
export type UserplansControllerCreateMutationError = ErrorType<unknown>;

export const useUserplansControllerCreate = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof userplansControllerCreate>>,
		TError,
		{ data: CreateUserPlansDto },
		TContext
	>;
}): UseMutationResult<
	Awaited<ReturnType<typeof userplansControllerCreate>>,
	TError,
	{ data: CreateUserPlansDto },
	TContext
> => {
	const mutationOptions = getUserplansControllerCreateMutationOptions(options);

	return useMutation(mutationOptions);
};
export const userplansControllerUpdate = (
	id: string,
	updateUserPlanCustomDto: UpdateUserPlanCustomDto,
) => {
	return authInstance<UserplansControllerUpdate200>({
		url: `/api/userplans/${id}`,
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		data: updateUserPlanCustomDto,
	});
};

export const getUserplansControllerUpdateMutationOptions = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof userplansControllerUpdate>>,
		TError,
		{ id: string; data: UpdateUserPlanCustomDto },
		TContext
	>;
}): UseMutationOptions<
	Awaited<ReturnType<typeof userplansControllerUpdate>>,
	TError,
	{ id: string; data: UpdateUserPlanCustomDto },
	TContext
> => {
	const { mutation: mutationOptions } = options ?? {};

	const mutationFn: MutationFunction<
		Awaited<ReturnType<typeof userplansControllerUpdate>>,
		{ id: string; data: UpdateUserPlanCustomDto }
	> = (props) => {
		const { id, data } = props ?? {};

		return userplansControllerUpdate(id, data);
	};

	return { mutationFn, ...mutationOptions };
};

export type UserplansControllerUpdateMutationResult = NonNullable<
	Awaited<ReturnType<typeof userplansControllerUpdate>>
>;
export type UserplansControllerUpdateMutationBody = UpdateUserPlanCustomDto;
export type UserplansControllerUpdateMutationError = ErrorType<unknown>;

export const useUserplansControllerUpdate = <
	TError = ErrorType<unknown>,
	TContext = unknown,
>(options?: {
	mutation?: UseMutationOptions<
		Awaited<ReturnType<typeof userplansControllerUpdate>>,
		TError,
		{ id: string; data: UpdateUserPlanCustomDto },
		TContext
	>;
}): UseMutationResult<
	Awaited<ReturnType<typeof userplansControllerUpdate>>,
	TError,
	{ id: string; data: UpdateUserPlanCustomDto },
	TContext
> => {
	const mutationOptions = getUserplansControllerUpdateMutationOptions(options);

	return useMutation(mutationOptions);
};
