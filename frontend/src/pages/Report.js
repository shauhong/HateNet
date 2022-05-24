import { Report as Table } from '../components';

const Report = () => {
    return (
        <div className="py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-semibold text-2xl pb-2">Report</p>
                    <p className="font-light text-md text-gray-600">Report of hate speech received from users</p>
                </div>
            </div>
            <div className="shadow-md rounded-3xl p-6 bg-white">
                <div className="mb-4">
                    <span className="font-semibold text-lg">Reported Tweets</span>
                </div>
                <Table />
            </div>
        </div>
    );
}

export default Report;