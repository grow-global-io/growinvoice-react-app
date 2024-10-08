/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Growinvoice API
 * Enhance your business with Growinvoice API
 * OpenAPI spec version: 1.0
 */
import { useQuery } from "@tanstack/react-query";
import type {
	DefinedInitialDataOptions,
	DefinedUseQueryResult,
	QueryFunction,
	QueryKey,
	UndefinedInitialDataOptions,
	UseQueryOptions,
	UseQueryResult,
} from "@tanstack/react-query";
import type {
	Expenses,
	Invoice,
	InvoiceDto,
	InvoiceProducts,
	ProfitLossCountDto,
	ProfitLostReportsDto,
	RangeSelectDto,
	ReportsControllerGetCustomerReportsParams,
	ReportsControllerGetExpenseReportsParams,
	ReportsControllerGetInvoiceReportsParams,
	ReportsControllerGetProductReportsParams,
	ReportsControllerGetProfitLossCountParams,
	ReportsControllerGetProfitLossReportsParams,
} from "./models";
import { authInstance } from "../../instances/authInstance";
import type { ErrorType } from "../../instances/authInstance";

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export const reportsControllerGetProfitLossCount = (
	params: ReportsControllerGetProfitLossCountParams,
	signal?: AbortSignal,
) => {
	return authInstance<ProfitLossCountDto>({
		url: `/api/reports/profit-loss-count`,
		method: "GET",
		params,
		signal,
	});
};

export const getReportsControllerGetProfitLossCountQueryKey = (
	params: ReportsControllerGetProfitLossCountParams,
) => {
	return [`/api/reports/profit-loss-count`, ...(params ? [params] : [])] as const;
};

export const getReportsControllerGetProfitLossCountQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossCountParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
				TError,
				TData
			>
		>;
	},
) => {
	const { query: queryOptions } = options ?? {};

	const queryKey = queryOptions?.queryKey ?? getReportsControllerGetProfitLossCountQueryKey(params);

	const queryFn: QueryFunction<Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>> = ({
		signal,
	}) => reportsControllerGetProfitLossCount(params, signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetProfitLossCountQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>
>;
export type ReportsControllerGetProfitLossCountQueryError = ErrorType<unknown>;

export function useReportsControllerGetProfitLossCount<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossCountParams,
	options: {
		query: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
				TError,
				TData
			>
		> &
			Pick<
				DefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProfitLossCount<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossCountParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
				TError,
				TData
			>
		> &
			Pick<
				UndefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProfitLossCount<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossCountParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
				TError,
				TData
			>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetProfitLossCount<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossCountParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossCount>>,
				TError,
				TData
			>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetProfitLossCountQueryOptions(params, options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}

export const reportsControllerGetProfitLossReports = (
	params: ReportsControllerGetProfitLossReportsParams,
	signal?: AbortSignal,
) => {
	return authInstance<ProfitLostReportsDto>({
		url: `/api/reports/profit-loss-reports`,
		method: "GET",
		params,
		signal,
	});
};

export const getReportsControllerGetProfitLossReportsQueryKey = (
	params: ReportsControllerGetProfitLossReportsParams,
) => {
	return [`/api/reports/profit-loss-reports`, ...(params ? [params] : [])] as const;
};

export const getReportsControllerGetProfitLossReportsQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
				TError,
				TData
			>
		>;
	},
) => {
	const { query: queryOptions } = options ?? {};

	const queryKey =
		queryOptions?.queryKey ?? getReportsControllerGetProfitLossReportsQueryKey(params);

	const queryFn: QueryFunction<
		Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>
	> = ({ signal }) => reportsControllerGetProfitLossReports(params, signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetProfitLossReportsQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>
>;
export type ReportsControllerGetProfitLossReportsQueryError = ErrorType<unknown>;

export function useReportsControllerGetProfitLossReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossReportsParams,
	options: {
		query: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
				TError,
				TData
			>
		> &
			Pick<
				DefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProfitLossReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
				TError,
				TData
			>
		> &
			Pick<
				UndefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProfitLossReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
				TError,
				TData
			>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetProfitLossReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProfitLossReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossReports>>,
				TError,
				TData
			>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetProfitLossReportsQueryOptions(params, options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}

export const reportsControllerGetProfitLossRange = (signal?: AbortSignal) => {
	return authInstance<RangeSelectDto>({
		url: `/api/reports/profit-loss-range`,
		method: "GET",
		signal,
	});
};

export const getReportsControllerGetProfitLossRangeQueryKey = () => {
	return [`/api/reports/profit-loss-range`] as const;
};

export const getReportsControllerGetProfitLossRangeQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>, TError, TData>
	>;
}) => {
	const { query: queryOptions } = options ?? {};

	const queryKey = queryOptions?.queryKey ?? getReportsControllerGetProfitLossRangeQueryKey();

	const queryFn: QueryFunction<Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>> = ({
		signal,
	}) => reportsControllerGetProfitLossRange(signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetProfitLossRangeQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>
>;
export type ReportsControllerGetProfitLossRangeQueryError = ErrorType<unknown>;

export function useReportsControllerGetProfitLossRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
	TError = ErrorType<unknown>,
>(options: {
	query: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>, TError, TData>
	> &
		Pick<
			DefinedInitialDataOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
				TError,
				TData
			>,
			"initialData"
		>;
}): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProfitLossRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>, TError, TData>
	> &
		Pick<
			UndefinedInitialDataOptions<
				Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
				TError,
				TData
			>,
			"initialData"
		>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProfitLossRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>, TError, TData>
	>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetProfitLossRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProfitLossRange>>, TError, TData>
	>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetProfitLossRangeQueryOptions(options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}

export const reportsControllerGetCustomerReports = (
	params: ReportsControllerGetCustomerReportsParams,
	signal?: AbortSignal,
) => {
	return authInstance<Invoice[]>({
		url: `/api/reports/customer-reports`,
		method: "GET",
		params,
		signal,
	});
};

export const getReportsControllerGetCustomerReportsQueryKey = (
	params: ReportsControllerGetCustomerReportsParams,
) => {
	return [`/api/reports/customer-reports`, ...(params ? [params] : [])] as const;
};

export const getReportsControllerGetCustomerReportsQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetCustomerReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
				TError,
				TData
			>
		>;
	},
) => {
	const { query: queryOptions } = options ?? {};

	const queryKey = queryOptions?.queryKey ?? getReportsControllerGetCustomerReportsQueryKey(params);

	const queryFn: QueryFunction<Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>> = ({
		signal,
	}) => reportsControllerGetCustomerReports(params, signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetCustomerReportsQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>
>;
export type ReportsControllerGetCustomerReportsQueryError = ErrorType<unknown>;

export function useReportsControllerGetCustomerReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetCustomerReportsParams,
	options: {
		query: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
				TError,
				TData
			>
		> &
			Pick<
				DefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetCustomerReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetCustomerReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
				TError,
				TData
			>
		> &
			Pick<
				UndefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetCustomerReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetCustomerReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
				TError,
				TData
			>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetCustomerReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetCustomerReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<
				Awaited<ReturnType<typeof reportsControllerGetCustomerReports>>,
				TError,
				TData
			>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetCustomerReportsQueryOptions(params, options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}

export const reportsControllerGetProductReports = (
	params: ReportsControllerGetProductReportsParams,
	signal?: AbortSignal,
) => {
	return authInstance<InvoiceProducts[]>({
		url: `/api/reports/product-reports`,
		method: "GET",
		params,
		signal,
	});
};

export const getReportsControllerGetProductReportsQueryKey = (
	params: ReportsControllerGetProductReportsParams,
) => {
	return [`/api/reports/product-reports`, ...(params ? [params] : [])] as const;
};

export const getReportsControllerGetProductReportsQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProductReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProductReports>>, TError, TData>
		>;
	},
) => {
	const { query: queryOptions } = options ?? {};

	const queryKey = queryOptions?.queryKey ?? getReportsControllerGetProductReportsQueryKey(params);

	const queryFn: QueryFunction<Awaited<ReturnType<typeof reportsControllerGetProductReports>>> = ({
		signal,
	}) => reportsControllerGetProductReports(params, signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetProductReportsQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetProductReports>>
>;
export type ReportsControllerGetProductReportsQueryError = ErrorType<unknown>;

export function useReportsControllerGetProductReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProductReportsParams,
	options: {
		query: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProductReports>>, TError, TData>
		> &
			Pick<
				DefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProductReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProductReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProductReports>>, TError, TData>
		> &
			Pick<
				UndefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetProductReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProductReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProductReports>>, TError, TData>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetProductReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetProductReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetProductReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetProductReports>>, TError, TData>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetProductReportsQueryOptions(params, options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}

export const reportsControllerGetExpenseReports = (
	params: ReportsControllerGetExpenseReportsParams,
	signal?: AbortSignal,
) => {
	return authInstance<Expenses[]>({
		url: `/api/reports/expense-reports`,
		method: "GET",
		params,
		signal,
	});
};

export const getReportsControllerGetExpenseReportsQueryKey = (
	params: ReportsControllerGetExpenseReportsParams,
) => {
	return [`/api/reports/expense-reports`, ...(params ? [params] : [])] as const;
};

export const getReportsControllerGetExpenseReportsQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetExpenseReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>, TError, TData>
		>;
	},
) => {
	const { query: queryOptions } = options ?? {};

	const queryKey = queryOptions?.queryKey ?? getReportsControllerGetExpenseReportsQueryKey(params);

	const queryFn: QueryFunction<Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>> = ({
		signal,
	}) => reportsControllerGetExpenseReports(params, signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetExpenseReportsQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>
>;
export type ReportsControllerGetExpenseReportsQueryError = ErrorType<unknown>;

export function useReportsControllerGetExpenseReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetExpenseReportsParams,
	options: {
		query: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>, TError, TData>
		> &
			Pick<
				DefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetExpenseReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetExpenseReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>, TError, TData>
		> &
			Pick<
				UndefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetExpenseReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetExpenseReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>, TError, TData>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetExpenseReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetExpenseReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseReports>>, TError, TData>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetExpenseReportsQueryOptions(params, options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}

export const reportsControllerGetExpenseRange = (signal?: AbortSignal) => {
	return authInstance<RangeSelectDto>({ url: `/api/reports/expense-range`, method: "GET", signal });
};

export const getReportsControllerGetExpenseRangeQueryKey = () => {
	return [`/api/reports/expense-range`] as const;
};

export const getReportsControllerGetExpenseRangeQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>, TError, TData>
	>;
}) => {
	const { query: queryOptions } = options ?? {};

	const queryKey = queryOptions?.queryKey ?? getReportsControllerGetExpenseRangeQueryKey();

	const queryFn: QueryFunction<Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>> = ({
		signal,
	}) => reportsControllerGetExpenseRange(signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetExpenseRangeQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>
>;
export type ReportsControllerGetExpenseRangeQueryError = ErrorType<unknown>;

export function useReportsControllerGetExpenseRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
	TError = ErrorType<unknown>,
>(options: {
	query: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>, TError, TData>
	> &
		Pick<
			DefinedInitialDataOptions<
				Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
				TError,
				TData
			>,
			"initialData"
		>;
}): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetExpenseRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>, TError, TData>
	> &
		Pick<
			UndefinedInitialDataOptions<
				Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
				TError,
				TData
			>,
			"initialData"
		>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetExpenseRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>, TError, TData>
	>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetExpenseRange<
	TData = Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>,
	TError = ErrorType<unknown>,
>(options?: {
	query?: Partial<
		UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetExpenseRange>>, TError, TData>
	>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetExpenseRangeQueryOptions(options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}

export const reportsControllerGetInvoiceReports = (
	params: ReportsControllerGetInvoiceReportsParams,
	signal?: AbortSignal,
) => {
	return authInstance<InvoiceDto[]>({
		url: `/api/reports/invoice-reports`,
		method: "GET",
		params,
		signal,
	});
};

export const getReportsControllerGetInvoiceReportsQueryKey = (
	params: ReportsControllerGetInvoiceReportsParams,
) => {
	return [`/api/reports/invoice-reports`, ...(params ? [params] : [])] as const;
};

export const getReportsControllerGetInvoiceReportsQueryOptions = <
	TData = Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetInvoiceReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>, TError, TData>
		>;
	},
) => {
	const { query: queryOptions } = options ?? {};

	const queryKey = queryOptions?.queryKey ?? getReportsControllerGetInvoiceReportsQueryKey(params);

	const queryFn: QueryFunction<Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>> = ({
		signal,
	}) => reportsControllerGetInvoiceReports(params, signal);

	return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
		Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
		TError,
		TData
	> & { queryKey: QueryKey };
};

export type ReportsControllerGetInvoiceReportsQueryResult = NonNullable<
	Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>
>;
export type ReportsControllerGetInvoiceReportsQueryError = ErrorType<unknown>;

export function useReportsControllerGetInvoiceReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetInvoiceReportsParams,
	options: {
		query: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>, TError, TData>
		> &
			Pick<
				DefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetInvoiceReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetInvoiceReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>, TError, TData>
		> &
			Pick<
				UndefinedInitialDataOptions<
					Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
					TError,
					TData
				>,
				"initialData"
			>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useReportsControllerGetInvoiceReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetInvoiceReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>, TError, TData>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useReportsControllerGetInvoiceReports<
	TData = Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>,
	TError = ErrorType<unknown>,
>(
	params: ReportsControllerGetInvoiceReportsParams,
	options?: {
		query?: Partial<
			UseQueryOptions<Awaited<ReturnType<typeof reportsControllerGetInvoiceReports>>, TError, TData>
		>;
	},
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
	const queryOptions = getReportsControllerGetInvoiceReportsQueryOptions(params, options);

	const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

	query.queryKey = queryOptions.queryKey;

	return query;
}
