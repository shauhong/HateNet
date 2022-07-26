import { useState } from 'react';
import { getEndOfTargetMonth } from "../utils";

const useChart = () => {
    const [chart, setChart] = useState({
        labels: [],
        data: [],
    });

    const reset = () => {
        setChart({
            labels: [],
            data: [],
        });
    }

    const updateTrend = (data, scope = 'all time', type = null) => {
        scope = scope.toLowerCase();
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const updated = {};
        if (scope === 'past month') {
            const range = Array.from(Array(getEndOfTargetMonth(year, month)), (x, i) => i + 1);
            if (data[year] && data[year][month + 1]) {
                range.forEach(item => {
                    const current = data[year][month + 1][item];
                    if (current) {
                        if (type) {
                            const count = current[type] ? current[type].count : 0;
                            if (count) {
                                updated[item] = updated[item] ? updated[item] + count : count;
                            }
                        } else {
                            for (const type in current) {
                                if (type === 'Non-Hateful') continue;
                                const count = current[type].count;
                                updated[item] = updated[item] ? updated[item] + count : count;
                            }
                        }
                    }
                });
            }
            chart.labels = range;
            chart.data = range.map(i => updated[i] ? updated[i] : 0);
        }
        if (scope === 'past year') {
            const range = Array.from(Array(12), (x, i) => i + 1);
            if (data[year]) {
                range.forEach(item => {
                    const current = data[year][item];
                    if (current) {
                        for (const day in current) {
                            if (type) {
                                const count = current[day][type] ? current[day][type].count : 0;
                                if (count) {
                                    updated[item] = updated[item] ? updated[item] + count : count;
                                }
                            } else {
                                for (const type in current[day]) {
                                    if (type === 'Non-Hateful') continue;
                                    const count = current[day][type].count;
                                    updated[item] = updated[item] ? updated[item] + count : count;
                                }
                            }
                        }
                    }
                });
            }
            chart.labels = range;
            chart.data = range.map(i => updated[i] ? updated[i] : 0);
        }
        if (scope === 'all time') {
            for (const year in data) {
                for (const month in data[year]) {
                    for (const day in data[year][month]) {
                        if (type) {
                            const count = data[year][month][day][type] ? data[year][month][day][type].count : 0;
                            if (count) {
                                updated[year] = updated[year] ? updated[year] + count : count;
                            }
                        } else {
                            for (const type in data[year][month][day]) {
                                if (type === 'Non-Hateful') continue;
                                const count = data[year][month][day][type].count;
                                updated[year] = updated[year] ? updated[year] + count : count;
                            }
                        }
                    }
                }
            }
            chart.labels = Object.keys(updated);
            chart.data = Object.values(updated);
        }
        setChart({ ...chart });
    };

    const updateDistribution = (data, scope = 'all time', type = null) => {
        scope = scope.toLowerCase();
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth();
        const updated = {};
        if (scope === 'past month') {
            const range = Array.from(Array(getEndOfTargetMonth(year, month)), (x, i) => i + 1);
            if (data[year] && data[year][month + 1]) {
                range.forEach(item => {
                    const current = data[year][month + 1][item];
                    if (current) {
                        for (const type in current) {
                            const count = current[type].count;
                            updated[type] = updated[type] ? updated[type] + count : count;
                        }
                    }
                }
                );
            }
        }
        if (scope === 'past year') {
            const range = Array.from(Array(12), (x, i) => i + 1);
            if (data[year]) {
                range.forEach(item => {
                    const current = data[year][item];
                    if (current) {
                        for (const day in current) {
                            for (const type in current[day]) {
                                const count = current[day][type].count;
                                updated[type] = updated[type] ? updated[type] + count : count;
                            }
                        }
                    }
                });
            }
        }
        if (scope === 'all time') {
            for (const year in data) {
                for (const month in data[year]) {
                    for (const day in data[year][month]) {
                        for (const type in data[year][month][day]) {
                            const count = data[year][month][day][type].count;
                            updated[type] = updated[type] ? updated[type] + count : count;
                        }
                    }
                }
            }
        }
        chart.data = Object.values(updated);
        chart.labels = Object.keys(updated);
        setChart({ ...chart });
    }

    const getDocuments = (data, scope = "all time") => {
        scope = scope.toLowerCase()
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const documents = {};
        if (scope === 'past month') {
            const range = Array.from(Array(getEndOfTargetMonth(year, month)), (x, i) => i + 1);
            if (data[year] && data[year][month + 1]) {
                range.forEach(item => {
                    const current = data[year][month + 1][item];
                    if (current) {
                        for (const type in current) {
                            if (type === 'Non-Hateful') continue;
                            const text = current[type]['text']
                            documents[type] = documents[type] ? documents[type].concat(text) : text;
                        }
                    }
                })
            }
        }
        if (scope === 'past year') {
            const range = Array.from(Array(12), (x, i) => i + 1);
            if (data[year]) {
                range.forEach(item => {
                    const current = data[year][item];
                    if (current) {
                        for (const day in current) {
                            for (const type in current[day]) {
                                if (type === 'Non-Hateful') continue;
                                const text = current[day][type]['text'];
                                documents[type] = documents[type] ? documents[type].concat(text) : text;
                            }
                        }
                    }
                });
            }
        }
        if (scope === 'all time') {
            for (const year in data) {
                for (const month in data[year]) {
                    for (const day in data[year][month]) {
                        for (const type in data[year][month][day]) {
                            if (type === 'Non-Hateful') continue;
                            const text = data[year][month][day][type]['text'];
                            documents[type] = documents[type] ? documents[type].concat(text) : text;
                        }
                    }
                }
            }
        }
        for (const label of Object.keys(documents)) {
            documents[label] = documents[label].join(" ");
        }
        return documents
    };

    const updateTFIDF = (data, type = null) => {
        if (type) {
            if (data.hasOwnProperty(type)) {
                const keys = Object.keys(data[type]).sort((a, b) => data[type][b] - data[type][a]);
                const values = keys.map(key => data[type][key]);
                chart.labels = keys;
                chart.data = values;
                setChart({ ...chart });
            } else {
                setChart({ data: [], labels: [] });
            }
        } else {
            let all = {};
            for (const type in data) {
                all = { ...all, ...data[type] };
            }
            const keys = Object.keys(all).sort((a, b) => all[b] - all[a]);
            const values = keys.map(key => all[key]);
            chart.labels = keys;
            chart.data = values;
            setChart({ ...chart });
        }
    }

    const updateField = (data, field, scope = 'all time', type = null, ignore = null) => {
        scope = scope.toLowerCase();
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const updated = {};
        if (scope === 'past month') {
            const range = Array.from(Array(getEndOfTargetMonth(year, month)), (x, i) => i + 1);
            if (data[year] && data[year][month + 1]) {
                range.forEach(item => {
                    const current = data[year][month + 1][item];
                    if (current) {
                        if (type) {
                            if (current[type]) {
                                for (const value in current[type][field]) {
                                    const count = current[type][field][value];
                                    updated[value] = updated[value] ? updated[value] + count : count;
                                }
                            }
                        } else {
                            for (const type in current) {
                                if (type === 'Non-Hateful') continue;
                                for (const value in current[type][field]) {
                                    const count = current[type][field][value];
                                    updated[value] = updated[value] ? updated[value] + count : count;
                                }
                            }
                        }
                    }
                })
            }
        }
        if (scope === 'past year') {
            const range = Array.from(Array(12), (x, i) => i + 1);
            if (data[year]) {
                range.forEach(item => {
                    const current = data[year][item];
                    if (current) {
                        for (const day in current) {
                            if (type) {
                                if (current[day][type]) {
                                    for (const value in current[day][type][field]) {
                                        const count = current[day][type][field][value];
                                        updated[value] = updated[value] ? updated[value] + count : count;
                                    }
                                }
                            } else {
                                for (const type in current[day]) {
                                    if (type === 'Non-Hateful') continue;
                                    for (const value in current[day][type][field]) {
                                        const count = current[day][type][field][value];
                                        updated[value] = updated[value] ? updated[value] + count : count;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        if (scope === 'all time') {
            for (const year in data) {
                for (const month in data[year]) {
                    for (const day in data[year][month]) {
                        if (type) {
                            if (data[year][month][day][type]) {
                                for (const value in data[year][month][day][type][field]) {
                                    const count = data[year][month][day][type][field][value];
                                    updated[value] = updated[value] ? updated[value] + count : count;
                                }
                            }
                        } else {
                            for (const type in data[year][month][day]) {
                                if (type === 'Non-Hateful') continue;
                                for (const value in data[year][month][day][type][field]) {
                                    const count = data[year][month][day][type][field][value];
                                    updated[value] = updated[value] ? updated[value] + count : count;
                                }
                            }
                        }
                    }
                }
            }
        }
        const keys = Object.keys(updated).sort((a, b) => updated[b] - updated[a]);
        const values = keys.map(key => updated[key]);
        chart.labels = keys;
        chart.data = values;
        setChart({ ...chart });
    }

    return { chart, updateTrend, updateDistribution, updateField, updateTFIDF, getDocuments, reset };
};

export default useChart;