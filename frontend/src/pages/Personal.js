import { Preference } from '../components';

const Personal = () => {
    return (
        <div className="py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-semibold text-2xl pb-2">Personal</p>
                    <p className="font-light text-md text-gray-600">Manage your own personal profile here</p>
                </div>
            </div>
            <Preference />
        </div>
    );
}

export default Personal;