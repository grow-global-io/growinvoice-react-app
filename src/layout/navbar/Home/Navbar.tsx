import Sidebar from "./Sidebar";
const Navbar = ({ children }: { children: React.ReactNode }) => {
	return <Sidebar>{children}</Sidebar>;
};

export default Navbar;
