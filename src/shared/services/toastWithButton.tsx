import { toast } from "react-toastify";

export const toastWithButton = () => {
	return toast.error(
		({ closeToast }) => (
			<div>
				<div>Limit exceeded. Please upgrade your plan to add more features.</div>

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
					Click here to upgrade
				</button>
			</div>
		),
		{
			autoClose: 15000,
		},
	);
};
