import { toast } from "react-toastify";
import i18next from "i18next";

export const toastWithButton = () => {
	return toast.error(
		({ closeToast }) => (
			<div>
				<div>
					{i18next.t("plans.limitExceeded", {
						defaultValue: "Limit exceeded. Please upgrade your plan to add more features.",
					})}
				</div>

				<button
					onClick={() => {
						window.location.href = "/plan/planspage";
						closeToast();
					}}
					style={{
						backgroundColor: "#BC1817",
						color: "#fff",
						border: "none",
						padding: "5px 10px",
						marginTop: "10px",
						cursor: "pointer",
						borderRadius: "5px",
					}}
				>
					{i18next.t("plans.upgradeCta", { defaultValue: "Click here to upgrade" })}
				</button>
			</div>
		),
		{
			autoClose: 15000,
		},
	);
};
