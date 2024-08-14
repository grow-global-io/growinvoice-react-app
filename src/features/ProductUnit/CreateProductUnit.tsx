import { CreateProductUnitDto } from "@api/services/models";
import {
	getProductunitControllerFindAllQueryKey,
	getProductunitControllerFindOneQueryKey,
	useProductunitControllerCreate,
	useProductunitControllerFindOne,
	useProductunitControllerUpdate,
} from "@api/services/productunit";
import { Box, Button } from "@mui/material";
import { TextFormField } from "@shared/components/FormFields/TextFormField";
import { useAuthStore } from "@store/auth";
import { Field, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateProductUnitStore } from "@store/createProductUnitStore";
import Loader from "@shared/components/Loader";
const validationSchema: Yup.Schema<CreateProductUnitDto> = Yup.object().shape({
	name: Yup.string().required("Unit Name is required"),
	user_id: Yup.string().required("User id is required"),
});
const style = {
	bgcolor: "custom.lightBlue",
	padding: 2,
	borderRadius: 1,
	mb: 1,
};

const CreateProductUnit = ({ handleClose }: { handleClose?: () => void }) => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const createProductUnit = useProductunitControllerCreate();
	const updateProductUnit = useProductunitControllerUpdate();
	const { editProductUnitId } = useCreateProductUnitStore.getState();
	const editValues = useProductunitControllerFindOne(editProductUnitId ?? "", {
		query: {
			enabled: editProductUnitId !== null,
		},
	});
	const initialValues: CreateProductUnitDto = {
		name: editValues?.data?.name ?? "",
		user_id: user?.id ?? "",
	};

	const handleSubmit = async (
		values: CreateProductUnitDto,
		action: FormikHelpers<CreateProductUnitDto>,
	) => {
		action.setSubmitting(true);
		if (editProductUnitId) {
			await updateProductUnit.mutateAsync({
				id: editProductUnitId ?? "",
				data: values,
			});
			queryClient.invalidateQueries({
				queryKey: getProductunitControllerFindOneQueryKey(editProductUnitId ?? ""),
			});
		} else {
			await createProductUnit.mutateAsync({
				data: values,
			});
		}
		action.resetForm();
		if (handleClose) handleClose();
		queryClient.invalidateQueries({
			queryKey: getProductunitControllerFindAllQueryKey(),
		});
		action.setSubmitting(false);
	};
	if (editValues?.isLoading || editValues?.isFetching) {
		return <Loader />;
	}
	return (
		<Box sx={style}>
			<Formik
				initialValues={initialValues}
				onSubmit={handleSubmit}
				validationSchema={validationSchema}
			>
				{({ handleSubmit }) => {
					return (
						<>
							<Field component={TextFormField} name="name" label="Unit Name" />
							<Box textAlign={"center"}>
								<Button
									variant="contained"
									onClick={() => {
										handleSubmit();
									}}
								>
									{editProductUnitId ? "Update" : "Create"} Product Unit
								</Button>
								{handleClose && (
									<Button variant="outlined" onClick={handleClose}>
										Close
									</Button>
								)}
							</Box>
						</>
					);
				}}
			</Formik>
		</Box>
	);
};

export default CreateProductUnit;
