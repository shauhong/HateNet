import { useEffect, useState } from 'react';

const Dropleft = ({ items, handleClick, icon, selected }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => { window.onclick = () => { setOpen(false) } });

    return (
        <div className="relative">
            <button type="button" className="peer btn p-2" onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>
                {icon}
            </button>
            <ul className={
                `absolute right-full top-0 z-10 bg-white rounded-2xl max-h-56 overflow-y-auto mr-1 hide-scrollbar ${open && "border"}`
            }>
                {
                    open &&
                    items.map((item, index) =>
                        <li
                            className={
                                `flex gap-2 items-center py-2 px-4 max-w-xs overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer ${item === selected ? "bg-sky-500 text-white" : "hover:bg-sky-500 hover:text-white"}`
                            }
                            key={index}
                            onClick={() => { handleClick(item); setOpen(false) }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className={item === selected ? "visible h-4 w-4" : "invisible h-4 w-4"}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                        </li>
                    )
                }
            </ul>
        </div>
    );
}

export default Dropleft;