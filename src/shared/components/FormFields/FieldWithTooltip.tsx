import { Tooltip, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { type ReactNode, cloneElement, isValidElement } from "react";

interface FieldWithTooltipProps {
	children: ReactNode;
	tooltipTitle?: string;
	tooltipDescription?: string;
}

/**
 * Wrapper component that adds a tooltip to form fields
 * Displays an info icon with tooltip next to the label
 */
export function FieldWithTooltip({
	children,
	tooltipTitle,
	tooltipDescription,
}: FieldWithTooltipProps) {
	if (!tooltipTitle && !tooltipDescription) {
		return <>{children}</>;
	}

	const tooltipIcon = (
		<Tooltip
			title={
				<Box>
					{tooltipTitle && <strong>{tooltipTitle}</strong>}
					{tooltipTitle && tooltipDescription && <br />}
					{tooltipDescription}
				</Box>
			}
			arrow
			placement="top"
		>
			<InfoIcon
				sx={{
					fontSize: 18,
					color: "primary.main",
					cursor: "help",
					ml: 0.5,
					verticalAlign: "middle",
				}}
			/>
		</Tooltip>
	);

	// Clone the child element and pass tooltipIcon as a prop
	if (isValidElement(children)) {
		const childProps = (children as React.ReactElement).props || {};
		return cloneElement(
			children as React.ReactElement,
			{
				...childProps,
				tooltipIcon: tooltipIcon,
			} as any,
		);
	}

	return <>{children}</>;
}
