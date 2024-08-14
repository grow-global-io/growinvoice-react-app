import { Field, useField } from "formik";
import { AutocompleteField } from "./AutoComplete";
import { useCurrencyControllerFindStatesByCountry } from "@api/services/currency";

const StateFormField = ({
	countryFieldName,
	stateFieldName,
	stateLabel,
	...props
}: {
	countryFieldName: string;
	stateFieldName: string;
	stateLabel: string;
	isRequired?: boolean;
}) => {
	const [field] = useField(countryFieldName);

	const statesFindAllByCountry = useCurrencyControllerFindStatesByCountry({
		countryId: field.value,
	});

	return (
		<Field
			name={stateFieldName}
			label={stateLabel}
			component={AutocompleteField}
			options={statesFindAllByCountry?.data?.map((item) => ({ label: item.name, value: item.id }))}
			loading={statesFindAllByCountry.isLoading}
			{...props}
		/>
	);
};

export default StateFormField;
