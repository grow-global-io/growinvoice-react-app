import Sidebar from "./Sidebar";
import React from "react";
const Navbar = ({ children }: { children: React.ReactNode }) => {
	return <Sidebar>{children}</Sidebar>;
};

export default Navbar;
