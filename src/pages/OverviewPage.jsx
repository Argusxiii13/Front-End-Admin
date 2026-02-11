import Header from "../components/common/Header";

import OverviewCards from "../components/overview/OverviewCards";
import FinanceVisualizer from "../components/overview/FinanceVisualizer";
import BookingStatusVisualizer from "../components/overview/BookingStatusVisualizer";
import UsersGrowthRateVisualizer from "../components/overview/UsersGrowthRateVisualizer";
import FeedbackVisualizer from "../components/overview/FeedbackVisualizer";
import AIPoweredInsights from "../components/overview/AIPoweredInsights";

const OverviewPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
			<Header title={"Overview"} className = '2000'/>

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<OverviewCards />
				<AIPoweredInsights />
				<FinanceVisualizer />
				<BookingStatusVisualizer />
				<UsersGrowthRateVisualizer />
				<FeedbackVisualizer />
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
				{/*This is where i place additional components */}
				</div>

				
			</main>
		</div>
	);
};
export default OverviewPage;
