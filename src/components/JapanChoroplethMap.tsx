'use client';

import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { useTranslations } from 'next-intl';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import japanMap from './maps/japan.json';
import { PREFECTURE_TOTALS, getTotalRange } from './maps/mockPrefectureTotals';

// Type for the TopoJSON feature properties
interface PrefectureProperties {
    nam: string;
    nam_ja: string;
    id: number;
}

export interface StatisticsPrefectureDensity {
    prefecture_name: string;
    value_numeric: number;
}

interface JapanChoroplethMapProps {
    className?: string;
    data?: StatisticsPrefectureDensity[];
}

const JapanChoroplethMap: React.FC<JapanChoroplethMapProps> = ({ className, data }) => {
    const t = useTranslations();
    const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
    const [hoveredPrefecture, setHoveredPrefecture] = useState<string | null>(null);

    // Zoom and Pan State
    const [position, setPosition] = useState({ coordinates: [137, 36] as [number, number], zoom: 1 });

    // Map database data to a lookup object with normalization
    const densityMap = useMemo(() => {
        if (!data || data.length === 0) return null;
        const lookup: Record<string, number> = {};
        data.forEach(item => {
            // Original name (e.g., "Tokyo To" or "Tokyo")
            lookup[item.prefecture_name] = item.value_numeric;

            // Normalized versions for better matching
            const lower = item.prefecture_name.toLowerCase();
            lookup[lower] = item.value_numeric;

            // Match without common suffixes
            const clean = lower.replace(/\s+(ken|to|fu|do)$/i, '').trim();
            lookup[clean] = item.value_numeric;
        });
        return lookup;
    }, [data]);

    // Color scale: based on absolute total values
    const colorScale = useMemo(() => {
        let min = 0;
        let max = 100000;

        if (densityMap) {
            const values = Object.values(densityMap);
            if (values.length > 0) {
                min = Math.min(...values);
                max = Math.max(...values);
            }
        } else {
            const range = getTotalRange();
            min = range[0];
            max = range[1];
        }

        // Avoid division by zero or same min/max
        if (min === max) max = min + 1;

        return scaleLinear<string>()
            .domain([min, min + (max - min) * 0.25, min + (max - min) * 0.5, min + (max - min) * 0.75, max])
            .range(["#e3f2fd", "#90caf9", "#42a5f5", "#1e88e5", "#0d47a1"]);
    }, [densityMap]);

    // Active data to show in info card
    const activeData = useMemo(() => {
        const prefName = selectedPrefecture || hoveredPrefecture;

        if (prefName) {
            let total = 0;
            let displayName = prefName;

            if (densityMap && densityMap[prefName] !== undefined) {
                total = densityMap[prefName];
            } else if (PREFECTURE_TOTALS[prefName]) {
                total = PREFECTURE_TOTALS[prefName].total;
                displayName = PREFECTURE_TOTALS[prefName].name;
            }

            return {
                name: displayName,
                total: total,
                isSelected: !!selectedPrefecture
            };
        }

        // Default: Tokyo
        const defaultTotal =
            densityMap?.['Tokyo To'] ??
            densityMap?.['tokyo to'] ??
            densityMap?.['tokyo'] ??
            densityMap?.['Tokyo'] ??
            580000;

        return {
            name: "Tokyo",
            total: defaultTotal,
            isSelected: false
        };
    }, [selectedPrefecture, hoveredPrefecture, densityMap]);

    const handlePrefectureClick = (prefName: string) => {
        setSelectedPrefecture(prefName);
    };

    const handleZoomIn = () => {
        if (position.zoom >= 5) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleReset = () => {
        setPosition({ coordinates: [137, 36], zoom: 1 });
    };

    // Fix for type mismatch in react-simple-maps onMoveEnd
    const handleMoveEnd = (newPosition: { coordinates: [number, number]; zoom: number }) => {
        setPosition(newPosition);
    };

    return (
        <div className={`w-full flex flex-col ${className}`}>
            {/* Info Card - Mobile Version (Top) */}
            <div className="md:hidden w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-4 transition-all duration-300">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 text-center">
                    {activeData.isSelected
                        ? t('statistics.regionalDistribution.selectedPrefecture')
                        : t('statistics.regionalDistribution.hoverHint')}
                </p>
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                        {activeData.name}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                            {activeData.total.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {t('statistics.regionalDistribution.foreignResidents')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-auto md:h-full flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/50 dark:bg-slate-900/20 shadow-inner group">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        center: [137, 36],
                        scale: 1600
                    }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        onMoveEnd={handleMoveEnd}
                        maxZoom={8}
                        minZoom={1}
                    >
                        <Geographies geography={japanMap}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const { nam } = geo.properties as PrefectureProperties;

                                    const total = densityMap
                                        ? (densityMap[nam] ?? densityMap[nam.toLowerCase()] ?? densityMap[nam.toLowerCase().replace(/\s+(ken|to|fu|do)$/i, '').trim()] ?? 0)
                                        : (PREFECTURE_TOTALS[nam]?.total || 0);

                                    const isSelected = selectedPrefecture === nam;
                                    const isHovered = hoveredPrefecture === nam;

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onClick={() => handlePrefectureClick(nam)}
                                            onMouseEnter={() => setHoveredPrefecture(nam)}
                                            onMouseLeave={() => setHoveredPrefecture(null)}
                                            style={{
                                                default: {
                                                    fill: colorScale(total),
                                                    stroke: isSelected ? "#D70F24" : "#fff",
                                                    strokeWidth: isSelected ? 2 : 0.5,
                                                    outline: "none",
                                                    transition: "all 0.2s ease"
                                                },
                                                hover: {
                                                    fill: isHovered ? "#1565c0" : colorScale(total),
                                                    stroke: isSelected ? "#D70F24" : "#fff",
                                                    strokeWidth: isSelected ? 2 : 1,
                                                    outline: "none",
                                                    transition: "all 0.2s ease",
                                                    cursor: "pointer"
                                                },
                                                pressed: {
                                                    fill: "#0d47a1",
                                                    outline: "none"
                                                }
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>

                {/* ZOOM CONTROLS - Floating */}
                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-10">
                    <button
                        onClick={handleZoomIn}
                        className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                        title="Zoom In"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                        title="Zoom Out"
                    >
                        <Minus size={20} strokeWidth={3} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                        title="Reset View"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>

                {/* Info Card - Desktop Version */}
                <div className="hidden md:block absolute top-6 left-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-[260px] pointer-events-none transition-all duration-300">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                        {activeData.isSelected
                            ? t('statistics.regionalDistribution.selectedPrefecture')
                            : t('statistics.regionalDistribution.hoverHint')}
                    </p>
                    <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight">
                        {activeData.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {activeData.total.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                {t('statistics.regionalDistribution.foreignResidents')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Legend - Desktop Version */}
                <div className="hidden md:block absolute bottom-6 right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-none">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        {t('statistics.regionalDistribution.legendTitle')}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
                            {t('statistics.regionalDistribution.lowerTotal')}
                        </span>
                        <div className="flex h-3 w-32 rounded-full overflow-hidden">
                            <div className="flex-1 bg-[#e3f2fd]"></div>
                            <div className="flex-1 bg-[#90caf9]"></div>
                            <div className="flex-1 bg-[#42a5f5]"></div>
                            <div className="flex-1 bg-[#1e88e5]"></div>
                            <div className="flex-1 bg-[#0d47a1]"></div>
                        </div>
                        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
                            {t('statistics.regionalDistribution.higherTotal')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Legend - Mobile Version (Bottom) */}
            <div className="md:hidden mt-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 pointer-events-none">
                <div className="flex items-center justify-between gap-4">
                    <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {t('statistics.regionalDistribution.legendTitle')}
                    </p>
                    <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                        <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                            {t('statistics.regionalDistribution.lowerTotal')}
                        </span>
                        <div className="flex h-2 flex-1 rounded-full overflow-hidden">
                            <div className="flex-1 bg-[#e3f2fd]"></div>
                            <div className="flex-1 bg-[#90caf9]"></div>
                            <div className="flex-1 bg-[#42a5f5]"></div>
                            <div className="flex-1 bg-[#1e88e5]"></div>
                            <div className="flex-1 bg-[#0d47a1]"></div>
                        </div>
                        <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                            {t('statistics.regionalDistribution.higherTotal')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JapanChoroplethMap;
