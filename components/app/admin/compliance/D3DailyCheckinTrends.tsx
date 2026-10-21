import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DailyCheckinTrendItem } from '../../../../data/complianceData';
import { useLanguage } from '../../../../context/LanguageContext';

interface D3DailyCheckinTrendsProps {
    data: DailyCheckinTrendItem[];
    height?: number;
}

export const D3DailyCheckinTrends: React.FC<D3DailyCheckinTrendsProps> = ({ data, height = 290 }) => {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedMetric, setSelectedMetric] = useState<'all' | 'compliant' | 'flags'>('all');
    const [tooltipData, setTooltipData] = useState<{
        x: number;
        y: number;
        item: DailyCheckinTrendItem;
    } | null>(null);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current || data.length === 0) return;

        const container = containerRef.current;
        const width = container.clientWidth || 600;
        const margin = { top: 25, right: 30, bottom: 40, left: 45 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Clear previous SVG contents
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

        // Definitions for gradients & drop shadows
        const defs = svg.append('defs');

        // Total check-ins gradient
        const totalGradient = defs.append('linearGradient')
            .attr('id', 'total-area-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        totalGradient.append('stop').attr('offset', '0%').attr('stop-color', '#1F2A37').attr('stop-opacity', 0.25);
        totalGradient.append('stop').attr('offset', '100%').attr('stop-color', '#1F2A37').attr('stop-opacity', 0.0);

        // Compliant check-ins gradient
        const compliantGradient = defs.append('linearGradient')
            .attr('id', 'compliant-area-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        compliantGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10B981').attr('stop-opacity', 0.28);
        compliantGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10B981').attr('stop-opacity', 0.0);

        // Flagged check-ins gradient
        const flagGradient = defs.append('linearGradient')
            .attr('id', 'flag-area-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        flagGradient.append('stop').attr('offset', '0%').attr('stop-color', '#C7A75D').attr('stop-opacity', 0.35);
        flagGradient.append('stop').attr('offset', '100%').attr('stop-color', '#C7A75D').attr('stop-opacity', 0.0);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scalePoint<string>()
            .domain(data.map(d => d.displayDate))
            .range([0, innerWidth])
            .padding(0.3);

        const maxTotal = d3.max(data, d => Math.max(d.totalCheckins, 10)) || 25;
        const yScale = d3.scaleLinear()
            .domain([0, Math.ceil(maxTotal * 1.15)])
            .range([innerHeight, 0])
            .nice();

        // Horizontal Grid lines
        const yAxisGrid = d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
            .ticks(5);

        g.append('g')
            .attr('class', 'grid-lines')
            .call(yAxisGrid)
            .selectAll('line')
            .attr('stroke', '#E7E5E4')
            .attr('stroke-dasharray', '3 3')
            .attr('opacity', 0.8);
        g.select('.grid-lines .domain').remove();

        // Bottom Axis
        const xAxis = d3.axisBottom(xScale)
            .tickSize(0)
            .tickPadding(12);

        const xAxisGroup = g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis);

        xAxisGroup.select('.domain').attr('stroke', '#E7E5E4');
        xAxisGroup.selectAll('text')
            .attr('fill', '#78716C')
            .attr('font-size', '11px')
            .attr('font-family', 'sans-serif');

        // Left Axis
        const yAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(0)
            .tickPadding(10)
            .tickFormat(d => `${d}`);

        const yAxisGroup = g.append('g').call(yAxis);
        yAxisGroup.select('.domain').remove();
        yAxisGroup.selectAll('text')
            .attr('fill', '#78716C')
            .attr('font-size', '11px')
            .attr('font-family', 'sans-serif');

        // Line and Area Generators
        const totalArea = d3.area<DailyCheckinTrendItem>()
            .x(d => xScale(d.displayDate) || 0)
            .y0(innerHeight)
            .y1(d => yScale(d.totalCheckins))
            .curve(d3.curveMonotoneX);

        const totalLine = d3.line<DailyCheckinTrendItem>()
            .x(d => xScale(d.displayDate) || 0)
            .y(d => yScale(d.totalCheckins))
            .curve(d3.curveMonotoneX);

        const compliantLine = d3.line<DailyCheckinTrendItem>()
            .x(d => xScale(d.displayDate) || 0)
            .y(d => yScale(d.compliantCheckins))
            .curve(d3.curveMonotoneX);

        const flagLine = d3.line<DailyCheckinTrendItem>()
            .x(d => xScale(d.displayDate) || 0)
            .y(d => yScale(d.flaggedCheckins))
            .curve(d3.curveMonotoneX);

        // 1. Draw Total Check-ins Area & Line
        if (selectedMetric === 'all') {
            g.append('path')
                .datum(data)
                .attr('fill', 'url(#total-area-gradient)')
                .attr('d', totalArea);

            g.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#1F2A37')
                .attr('stroke-width', 2.5)
                .attr('d', totalLine);
        }

        // 2. Draw Compliant Check-ins Line
        if (selectedMetric === 'all' || selectedMetric === 'compliant') {
            if (selectedMetric === 'compliant') {
                const compliantArea = d3.area<DailyCheckinTrendItem>()
                    .x(d => xScale(d.displayDate) || 0)
                    .y0(innerHeight)
                    .y1(d => yScale(d.compliantCheckins))
                    .curve(d3.curveMonotoneX);

                g.append('path')
                    .datum(data)
                    .attr('fill', 'url(#compliant-area-gradient)')
                    .attr('d', compliantArea);
            }

            g.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#10B981')
                .attr('stroke-width', selectedMetric === 'compliant' ? 2.5 : 2)
                .attr('stroke-dasharray', selectedMetric === 'all' ? '4 3' : 'none')
                .attr('d', compliantLine);
        }

        // 3. Draw Medical Flags Line
        if (selectedMetric === 'all' || selectedMetric === 'flags') {
            if (selectedMetric === 'flags') {
                const flagArea = d3.area<DailyCheckinTrendItem>()
                    .x(d => xScale(d.displayDate) || 0)
                    .y0(innerHeight)
                    .y1(d => yScale(d.flaggedCheckins))
                    .curve(d3.curveMonotoneX);

                g.append('path')
                    .datum(data)
                    .attr('fill', 'url(#flag-area-gradient)')
                    .attr('d', flagArea);
            }

            g.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#C7A75D')
                .attr('stroke-width', selectedMetric === 'flags' ? 2.5 : 2)
                .attr('d', flagLine);
        }

        // 4. Data points circles
        data.forEach(item => {
            const cx = xScale(item.displayDate) || 0;

            if (selectedMetric === 'all') {
                // Total circle
                g.append('circle')
                    .attr('cx', cx)
                    .attr('cy', yScale(item.totalCheckins))
                    .attr('r', 4)
                    .attr('fill', '#FFFFFF')
                    .attr('stroke', '#1F2A37')
                    .attr('stroke-width', 2);
            }

            if (selectedMetric === 'all' || selectedMetric === 'compliant') {
                g.append('circle')
                    .attr('cx', cx)
                    .attr('cy', yScale(item.compliantCheckins))
                    .attr('r', selectedMetric === 'compliant' ? 4 : 3)
                    .attr('fill', '#FFFFFF')
                    .attr('stroke', '#10B981')
                    .attr('stroke-width', 2);
            }

            if (selectedMetric === 'all' || selectedMetric === 'flags') {
                g.append('circle')
                    .attr('cx', cx)
                    .attr('cy', yScale(item.flaggedCheckins))
                    .attr('r', selectedMetric === 'flags' ? 4 : 3)
                    .attr('fill', '#FFFFFF')
                    .attr('stroke', '#C7A75D')
                    .attr('stroke-width', 2);
            }
        });

        // 5. Interactive overlay for hover tracking
        const overlay = g.append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .attr('cursor', 'crosshair');

        const hoverLine = g.append('line')
            .attr('stroke', '#A8A29E')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3 3')
            .attr('opacity', 0);

        overlay
            .on('mousemove', (event) => {
                const [mouseX] = d3.pointer(event);
                // Find closest point
                let closestItem = data[0];
                let minDistance = Infinity;

                data.forEach(item => {
                    const x = xScale(item.displayDate) || 0;
                    const dist = Math.abs(mouseX - x);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestItem = item;
                    }
                });

                const cx = xScale(closestItem.displayDate) || 0;
                hoverLine
                    .attr('x1', cx)
                    .attr('x2', cx)
                    .attr('y1', 0)
                    .attr('y2', innerHeight)
                    .attr('opacity', 1);

                const rect = container.getBoundingClientRect();
                setTooltipData({
                    x: cx + margin.left,
                    y: Math.min(yScale(closestItem.totalCheckins) + margin.top, innerHeight),
                    item: closestItem,
                });
            })
            .on('mouseleave', () => {
                hoverLine.attr('opacity', 0);
                setTooltipData(null);
            });

    }, [data, height, selectedMetric]);

    return (
        <div className="w-full relative" ref={containerRef}>
            {/* Chart Header & Series Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-p-text/70 uppercase tracking-wider">
                        {t({ de: 'D3.js Trend-Analyse', en: 'D3.js Trend Analysis' })}
                    </span>
                    <span className="text-[10px] bg-p-stone/60 text-p-primary font-mono px-2 py-0.5 rounded-full">
                        {data.length} {t({ de: 'Tage', en: 'Days' })}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 bg-p-background p-1 rounded-xl border border-p-stone text-xs">
                    <button
                        onClick={() => setSelectedMetric('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedMetric === 'all'
                                ? 'bg-white text-p-primary shadow-sm font-semibold'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-p-primary inline-block" />
                        {t({ de: 'Alle Metriken', en: 'All Metrics' })}
                    </button>
                    <button
                        onClick={() => setSelectedMetric('compliant')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedMetric === 'compliant'
                                ? 'bg-white text-p-success shadow-sm font-semibold'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-p-success inline-block" />
                        {t({ de: 'DSGVO-Konform', en: 'GDPR Compliant' })}
                    </button>
                    <button
                        onClick={() => setSelectedMetric('flags')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedMetric === 'flags'
                                ? 'bg-white text-p-accent shadow-sm font-semibold'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-p-accent inline-block" />
                        {t({ de: 'Med. Risikoflaggen', en: 'Medical Flags' })}
                    </button>
                </div>
            </div>

            {/* D3 SVG Canvas */}
            <div className="relative w-full bg-white rounded-2xl border border-p-stone/60 p-2 shadow-inner overflow-hidden">
                <svg ref={svgRef} className="w-full overflow-visible" />

                {/* Floating Interactive Tooltip */}
                {tooltipData && (
                    <div
                        className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
                        style={{
                            left: `${Math.min(Math.max(tooltipData.x, 90), (containerRef.current?.clientWidth || 500) - 130)}px`,
                            top: `${Math.max(tooltipData.y - 120, 10)}px`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="bg-p-primary/95 text-white backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10 text-xs min-w-[190px]">
                            <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-2 font-serif font-bold text-sm">
                                <span>{tooltipData.item.displayDate}</span>
                                <span className="text-[10px] font-sans font-normal text-p-accent uppercase tracking-wider">
                                    {tooltipData.item.complianceRate}% {t({ de: 'Konform', en: 'Compliant' })}
                                </span>
                            </div>
                            <div className="space-y-1.5 text-[11px]">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-white/80">
                                        <span className="w-2 h-2 rounded-full bg-white inline-block" />
                                        {t({ de: 'Gesamt-Check-ins:', en: 'Total Check-ins:' })}
                                    </span>
                                    <span className="font-bold font-mono text-white">
                                        {tooltipData.item.totalCheckins}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-white/80">
                                        <span className="w-2 h-2 rounded-full bg-p-success inline-block" />
                                        {t({ de: 'DSGVO signiert:', en: 'GDPR Signed:' })}
                                    </span>
                                    <span className="font-bold font-mono text-p-success">
                                        {tooltipData.item.compliantCheckins}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-white/80">
                                        <span className="w-2 h-2 rounded-full bg-p-accent inline-block" />
                                        {t({ de: 'Medizinische Flags:', en: 'Medical Flags:' })}
                                    </span>
                                    <span className="font-bold font-mono text-p-accent">
                                        {tooltipData.item.flaggedCheckins}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Metric Legends Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-xs text-p-text/70">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-p-primary rounded-full inline-block" />
                    <span>{t({ de: 'Gesamt-Check-ins', en: 'Total Check-ins' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-p-success rounded-full inline-block border-b border-dashed border-p-success" />
                    <span>{t({ de: 'DSGVO-Einwilligung erteilt', en: 'GDPR Consent Granted' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-p-accent rounded-full inline-block" />
                    <span>{t({ de: 'Aktive Risikoflaggen (Triage)', en: 'Active Risk Flags (Triage)' })}</span>
                </div>
            </div>
        </div>
    );
};
