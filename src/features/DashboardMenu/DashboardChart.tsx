import ReactApexChart from "react-apexcharts";

// eslint-disable-next-line 
const BarChart = ({ graphData }: { graphData: any }) => {
	return (
		<div id="chart">
			<ReactApexChart
				options={graphData?.options ?? {}}
				series={graphData?.series ?? { data: [] }}
				type={graphData?.options?.chart?.type ?? "bar"}
				height={350}
			/>
		</div>
	);
};

export default BarChart;
