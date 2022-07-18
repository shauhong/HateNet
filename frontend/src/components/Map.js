
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { features } from '../utils/features.json';

const Map = ({ setToolTipContent, data, labels }) => {
    console.log(data);
    // const url = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
    // const url = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
    const colorScale = scaleQuantile().domain(data).range([
        '#f0f9ff',
        '#e0f2fe',
        '#bae6fd',
        '#7dd3fc',
        '#38bdf8',
        '#0ea5e9',
        '#0284c7',
        '#0369a1',
        '#075985',
        '#0c4a6e',
    ]);

    return (
        <ComposableMap data-tip="" className="rounded-3xl border border-slate-200 my-auto">
            <ZoomableGroup zoom={1} minZoom={1} maxZoom={10} center={[0, 0]}>
                <Geographies geography={"/features.json"}>
                    {
                        ({ geographies }) =>
                            geographies.map(geography => {
                                console.log(geography);
                                console.log(labels);
                                const current = labels.find(element => element === geography.id);
                                return (
                                    <Geography
                                        key={geography.rsmKey}
                                        geography={geography}
                                        onMouseEnter={() => {
                                            const { name } = geography.properties;
                                            const count = current ? data[labels.indexOf(current)] : 0
                                            setToolTipContent(`${name}: ${count}`);
                                        }}
                                        onMouseLeave={() => {
                                            setToolTipContent("");
                                        }}
                                        style={{
                                            default: {
                                                outline: "none"
                                            },
                                            hover: {
                                                fill: "#0ea5e9",
                                                outline: "none"
                                            }
                                        }}
                                        fill={
                                            current ? colorScale(data[labels.indexOf(current)]) : "#D6D6DA"
                                        }
                                    />);
                            })
                    }
                </Geographies>
            </ZoomableGroup>
        </ComposableMap>
    );
}

export default Map;