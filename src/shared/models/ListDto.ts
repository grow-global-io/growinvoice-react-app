export interface ListDto {
	value: string | number;
	label: string;
}

export const stringToListDto = (value: string): ListDto => {
	return {
		value,
		label: value,
	};
};
