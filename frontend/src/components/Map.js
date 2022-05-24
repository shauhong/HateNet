
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

const Map = ({ setToolTipContent, data, labels }) => {
    const url = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
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
                <Geographies geography={url}>
                    {
                        ({ geographies }) =>
                            geographies.map(geography => {
                                const current = labels.find(element => element === geography.properties.ISO_A2);
                                return (
                                    <Geography
                                        key={geography.rsmKey}
                                        geography={geography}
                                        onMouseEnter={() => {
                                            const { NAME } = geography.properties;
                                            const count = current ? data[labels.indexOf(current)] : 0
                                            setToolTipContent(`${NAME}: ${count}`);
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