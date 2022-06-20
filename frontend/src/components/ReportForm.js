import { useState } from "react";
import { useGlobal } from "../hooks";

const ReportForm = ({ projects, add }) => {
    const { closeModal } = useGlobal();
    const [selected, setSelected] = useState([]);

    const handleSelect = (project) => {
        setSelected([...selected, project]);
    }

    const handleRemove = (project) => {
        setSelected([...selected.filter(element => element.name !== project.name)]);
    }

    const handleAdd = () => {
        add(selected);
        closeModal();
    }

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl border p-6 mx-auto space-y-4">
            <div className="flex justify-between px-3">
                <span className="font-semibold text-xl">Projects</span>
                <button onClick={closeModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="overflow-y-auto max-h-80 rounded-3xl hide-scrollbar border-2 border-gray-50">
                {
                    projects && projects.map((project, index) =>
                        <div key={index} className="w-full flex justify-between odd:bg-gray-50 p-4">
                            <span className="text-lg">{project.name}</span>
                            {
                                selected.includes(project)
                                    ? <button onClick={() => handleRemove(project)} className="rounded-3xl text-sm px-4 py-2 bg-red-500 text-white hover:bg-red-600 font-semibold">Remove</button>
                                    : <button onClick={() => handleSelect(project)} className="rounded-3xl text-sm px-4 py-2 bg-sky-500 text-white hover:bg-sky-600 font-semibold">Add</button>
                            }
                        </div>
                    )
                }
            </div>
            <div className="flex justify-end gap-x-3">
                <button onClick={closeModal} className="px-4 py-2 hover:text-sky-500 font-semibold">Close</button>
                <button onClick={handleAdd} className="rounded-3xl px-4 py-2 bg-sky-500 text-white hover:bg-sky-600 font-semibold">Confirm</button>
            </div>
        </div>
    );
}

export default ReportForm;