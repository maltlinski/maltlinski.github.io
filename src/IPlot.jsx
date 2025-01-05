import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const SplitEmotionAnalysis = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [currentFrame, setCurrentFrame] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hoverTime, setHoverTime] = useState(null);
    const [currentFileNumber, setCurrentFileNumber] = useState(2);

    const situations = [
        "Baustelle in der Stadt",
        "\"Heranschiessendes\" Fahrzeug",
        "Ampel mit Vorderfahrzeug",
        "Ampel ohne Vorderfahrzeug",
        "Ueberholen Bus mit Ausweichen in Gegenverkehr",
        "Knapp querender Querverkehr bei eigener Vorfahrt",
        "Auffahrt auf Stadtschnellstrasse",
        "Baustelle auf Stadtschnellstrasse",
        "rot werdenende Ampel 1 auf Stadtschnellstrasse",
        "rot werdende Ampel 2 auf Stadtschnellstrasse",
        "Halten an Stoppschild"
    ];

    const parseCSV = (csvString) => {
        return new Promise((resolve, reject) => {
            Papa.parse(csvString, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.error('CSV parsing errors:', results.errors);
                        reject(new Error('CSV parsing failed'));
                    } else {
                        resolve(results.data);
                    }
                },
                error: (error) => {
                    console.error('Papa Parse error:', error);
                    reject(error);
                }
            });
        });
    };

    const loadData = async (fileNumber) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`./summary_data${fileNumber}.csv`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            const parsedData = await parseCSV(csvText);
            const sortedData = parsedData
                .filter(row => row.mean_rel_zeit_s != null)
                .sort((a, b) => a.mean_rel_zeit_s - b.mean_rel_zeit_s);

            setData(sortedData);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData(currentFileNumber);
    }, [currentFileNumber]);

    const handleFileChange = (fileNumber) => {
        setCurrentFileNumber(fileNumber);
    };

    const metrics = [
        {
            id: 'anger',
            color: '#C0392B',
            name: 'Ärger',
            mean: 'mean_fl_anger_sm',
            lower: 'ci_lower_anger_sm',
            upper: 'ci_upper_anger_sm'
        },
        {
            id: 'disgust',
            color: '#27AE60',
            name: 'Ekel',
            mean: 'mean_fl_disgust_sm',
            lower: 'ci_lower_disgust_sm',
            upper: 'ci_upper_disgust_sm'
        },
        {
            id: 'fear',
            color: '#8E44AD',
            name: 'Angst',
            mean: 'mean_fl_fear_sm',
            lower: 'ci_lower_fear_sm',
            upper: 'ci_upper_fear_sm'
        },
        {
            id: 'happiness',
            color: '#F39C12',
            name: 'Freude',
            mean: 'mean_fl_happiness_sm',
            lower: 'ci_lower_happiness_sm',
            upper: 'ci_upper_happiness_sm'
        },
        {
            id: 'sadness',
            color: '#2C3E50',
            name: 'Trauer',
            mean: 'mean_fl_sadness_sm',
            lower: 'ci_lower_sadness_sm',
            upper: 'ci_upper_sadness_sm'
        },
        {
            id: 'surprise',
            color: '#F1C40F',
            name: 'Überraschung',
            mean: 'mean_fl_surprise_sm',
            lower: 'ci_lower_surprise_sm',
            upper: 'ci_upper_surprise_sm'
        },
        {
            id: 'neutral',
            color: '#95A5A6',
            name: 'Neutral',
            mean: 'mean_fl_neutral_sm',
            lower: 'ci_lower_neutral_sm',
            upper: 'ci_upper_neutral_sm'
        }
    ];

    const formatXAxis = (tickItem) => {
        return Math.round(tickItem);
    };

    const handleMouseMove = (e) => {
        if (e && e.activeLabel) {
            const frameNumber = Math.round(e.activeLabel);
            if (frameNumber >= 0) {
                const paddedNumber = String(frameNumber).padStart(6, '0');
                setCurrentFrame(`/Video/image_${paddedNumber}.png`);
                setHoverTime(e.activeLabel);
            }
        }
    };

    const handleMouseLeave = () => {
        setCurrentFrame(null);
        setHoverTime(null);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length > 0) {
            return (
                <div className="bg-white p-4 border rounded shadow-lg">
                    <p className="font-bold">Zeit: {Math.round(label)}s</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value?.toFixed(3)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return <div className="p-4">Loading data...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    const xValues = data.map(d => d.mean_rel_zeit_s).filter(x => x != null);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    return (
        <div className="p-4 flex">
            {/* Left side - Plots */}
            <div className="w-2/3 pr-4">
                {/* Diskomfort Plot */}
                <h2 className="text-lg font-bold mb-2">Diskomfort</h2>
                <div style={{ width: '100%', height: '300px', marginBottom: '1.5rem' }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 20, left: 40, bottom: 20 }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="mean_rel_zeit_s"
                                type="number"
                                domain={[xMin, xMax]}
                                tickFormatter={formatXAxis}
                                label={{ value: 'Zeit (s)', position: 'bottom' }}
                            />
                            <YAxis
                                domain={[0, 'auto']}
                                label={{ value: 'Diskomfort', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
                            {hoverTime !== null && (
                                <ReferenceLine x={hoverTime} stroke="#666" strokeWidth={1} />
                            )}
                            <Line
                                type="monotone"
                                dataKey="ci_upper_diskomfort"
                                stroke="#E74C3C"
                                strokeDasharray="3 3"
                                strokeWidth={1}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="ci_lower_diskomfort"
                                stroke="#E74C3C"
                                strokeDasharray="3 3"
                                strokeWidth={1}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="mean_diskomfort"
                                stroke="#E74C3C"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Individual Emotion Plots */}
                {metrics.map(metric => (
                    <div key={metric.id} className="mb-6">
                        <h2 className="text-lg font-bold mb-2">{metric.name}</h2>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer>
                                <LineChart
                                    data={data}
                                    margin={{ top: 10, right: 20, left: 40, bottom: 20 }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="mean_rel_zeit_s"
                                        type="number"
                                        domain={[xMin, xMax]}
                                        tickFormatter={formatXAxis}
                                        label={{ value: 'Zeit (s)', position: 'bottom' }}
                                    />
                                    <YAxis
                                        domain={[0, 'auto']}
                                        label={{ value: 'Intensität', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
                                    {hoverTime !== null && (
                                        <ReferenceLine x={hoverTime} stroke="#666" strokeWidth={1} />
                                    )}
                                    <Line
                                        type="monotone"
                                        dataKey={metric.upper}
                                        stroke={metric.color}
                                        strokeDasharray="3 3"
                                        strokeWidth={1}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={metric.lower}
                                        stroke={metric.color}
                                        strokeDasharray="3 3"
                                        strokeWidth={1}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={metric.mean}
                                        stroke={metric.color}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right side - Video Frame Display and File Selection */}
            <div className="w-1/3">
                <div className="sticky top-4">
                    {/* Video Frame Display */}
                    <div className="border rounded shadow-lg p-2 bg-white mb-4">
                        {currentFrame ? (
                            <>
                                <img
                                    src={currentFrame}
                                    alt="Video Frame"
                                    className="w-full h-auto"
                                    onError={(e) => {
                                        console.error('Error loading image:', currentFrame);
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <p className="text-center mt-2 text-sm text-gray-600">
                                    Frame bei {currentFrame.match(/\d+/)?.[0] || 'N/A'} Sekunden
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                                    <p className="text-gray-500 text-center px-4">
                                        Bewegen Sie den Mauszeiger über die Graphen um das entsprechende Video-Frame zu sehen
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* File Selection Buttons */}
                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[...Array(11)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handleFileChange(index + 1)}
                                    className={`p-3 rounded-lg text-base font-medium ${
                                        currentFileNumber === index + 1
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}
                                >
                                    Situation {index + 1}
                                </button>
                            ))}
                        </div>

                        {/* Situation Description */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Aktuelle Situation:</h3>
                            <p className="text-base text-gray-700 leading-relaxed">
                                {situations[currentFileNumber - 1]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitEmotionAnalysis;