import { Dialog, Divider, DialogContent, Grid, FormControlLabel, Checkbox } from "@mui/material";
import { AddressExpressions, Constants } from "@shared/constants";
import AppDialogHeader from "./Dialog/AppDialogHeader";

interface IAddressExpressionsDialogProps {
	open: boolean;
	handleClose: () => void;
	currentTemplate: keyof AddressExpressions;
	fieldValue: string;
	handleChecked: (checked: boolean, label: string) => void;
}

const AddressExpressionsDialog = ({
	open,
	handleClose,
	currentTemplate,
	fieldValue,
	...props
}: IAddressExpressionsDialogProps) => {
	return (
		<Dialog open={open} onClose={handleClose} fullWidth={true}>
			<AppDialogHeader title="Template Tags" handleClose={handleClose} />
			<Divider />
			<DialogContent>
				<Grid container>
					{Constants?.addressExpressions?.[currentTemplate]?.map((field, index) => (
						<Grid item xs={12} key={`${field?.name}-${index}`} my={0}>
							<FormControlLabel
								control={<Checkbox />}
								label={field.label}
								checked={fieldValue?.includes(field.label.toString())}
								onChange={(_, checked) => {
									props.handleChecked(checked, field.label.toString());
								}}
							/>
						</Grid>
					))}
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default AddressExpressionsDialog;
