import { useEffect, useState } from "react";
import { capitalize } from "../utils";

const Filter = ({ filters, selected, handleClick }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => { window.onclick = () => { setOpen(false) } });

    return (
        <div className="relative">
            <button type="peer button" className="btn px-2 py-2" onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
            </button>
            <div className={
                `absolute right-full top-0 z-10 bg-white rounded-2xl max-h-56 overflow-y-auto mr-1 hide-scrollbar ${open && "border"}`
            }>
                {
                    open &&
                    Object.keys(filters).map((filter, index) =>
                        <div className="w-40" key={index}>
                            <p className="font-semibold px-4 py-2">{capitalize(filter)}</p>
                            <ul>
                                {
                                    filters[filter].map((item, index) =>
                                        <li
                                            className={
                                                `flex gap-2 items-center p-2 cursor-pointer ${selected[filter] === item ? 'bg-sky-500 text-white' : 'hover:bg-sky-500 hover:text-white'}`
                                            }
                                            onClick={() => handleClick(filter, item)}
                                            key={index}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                className={selected[filter] === item ? "visible h-4 w-4 flex-shrink-0" : "invisible h-4 w-4 flex-shrink-0"}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className=" whitespace-nowrap text-ellipsis overflow-hidden">{capitalize(item)}</span>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default Filter;