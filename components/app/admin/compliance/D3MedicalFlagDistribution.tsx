import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MedicalFlagDistributionItem } from '../../../../data/complianceData';
import { InformationCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../../context/LanguageContext';

interface D3MedicalFlagDistributionProps {
    data: MedicalFlagDistributionItem[];
    height?: number;
}

export const D3MedicalFlagDistribution: React.FC<D3MedicalFlagDistributionProps> = ({ data, height = 290 }) => {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [viewMode, setViewMode] = useState<'bars' | 'donut'>('bars');
    const [selectedFlag, setSelectedFlag] = useState<MedicalFlagDistributionItem | null>(null);
    const [hoveredFlag, setHoveredFlag] = useState<{
        x: number;
        y: number;
        item: MedicalFlagDistributionItem;
    } | null>(null);

    // Color mapper for clinical risk levels
    const getRiskColor = (riskLevel: 'high' | 'medium' | 'info') => {
        switch (riskLevel) {
            case 'high':
                return { primary: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' }; // Red/Rose for high risk
            case 'medium':
                return { primary: '#C7A75D', bg: '#FEF3C7', border: '#FDE68A' }; // Amber/Gold for medium risk
            case 'info':
            default:
                return { primary: '#1F2A37', bg: '#E5E7EB', border: '#D1D5DB' }; // Slate
        }
    };

    useEffect(() => {
        if (!containerRef.current || !svgRef.current || data.length === 0) return;

        const container = containerRef.current;
        const width = container.clientWidth || 550;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

        if (viewMode === 'bars') {
            // Horizontal Bar Chart
            const margin = { top: 15, right: 75, bottom: 25, left: 165 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

            const yScale = d3.scaleBand()
                .domain(data.map(d => d.flagName))
                .range([0, innerHeight])
                .padding(0.28);

            const maxCount = d3.max(data, d => d.count) || 10;
            const xScale = d3.scaleLinear()
                .domain([0, maxCount * 1.1])
                .range([0, innerWidth]);

            // Background guide bars (subtle track)
            g.selectAll('.track-bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'track-bar')
                .attr('y', d => yScale(d.flagName) || 0)
                .attr('x', 0)
                .attr('height', yScale.bandwidth())
                .attr('width', innerWidth)
                .attr('rx', 6)
                .attr('fill', '#F5F5F4');

            // Colored Data Bars
            g.selectAll('.data-bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'data-bar')
                .attr('y', d => yScale(d.flagName) || 0)
                .attr('x', 0)
                .attr('height', yScale.bandwidth())
                .attr('width', 0)
                .attr('rx', 6)
                .attr('fill', d => getRiskColor(d.riskLevel).primary)
                .attr('cursor', 'pointer')
                .transition()
                .duration(500)
                .attr('width', d => xScale(d.count));

            // Hover interactions on bars
            g.selectAll('.data-bar')
                .on('mouseenter', (event, d: any) => {
                    const [mx, my] = d3.pointer(event, container);
                    setHoveredFlag({ x: mx, y: my, item: d });
                })
                .on('mousemove', (event, d: any) => {
                    const [mx, my] = d3.pointer(event, container);
                    setHoveredFlag({ x: mx, y: my, item: d });
                })
                .on('mouseleave', () => {
                    setHoveredFlag(null);
                })
                .on('click', (_, d: any) => {
                    setSelectedFlag(d === selectedFlag ? null : d);
                });

            // Value labels at end of bar
            g.selectAll('.value-label')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'value-label')
                .attr('y', d => (yScale(d.flagName) || 0) + yScale.bandwidth() / 2 + 4)
                .attr('x', d => xScale(d.count) + 8)
                .attr('font-size', '11px')
                .attr('font-weight', '600')
                .attr('fill', '#1F2A37')
                .attr('font-family', 'sans-serif')
                .text(d => `${d.count} (${d.percentage}%)`);

            // Left Y-Axis Labels (Flag Names)
            const yAxis = d3.axisLeft(yScale)
                .tickSize(0)
                .tickPadding(12);

            const yAxisGroup = g.append('g').call(yAxis);
            yAxisGroup.select('.domain').remove();
            yAxisGroup.selectAll('text')
                .attr('fill', '#1F2A37')
                .attr('font-size', '11px')
                .attr('font-weight', '500')
                .attr('font-family', 'sans-serif')
                .attr('cursor', 'pointer')
                .on('click', (_, d: any) => {
                    const found = data.find(item => item.flagName === d);
                    if (found) setSelectedFlag(found === selectedFlag ? null : found);
                });

        } else {
            // Donut Chart Mode
            const margin = 20;
            const radius = Math.min(width, height) / 2 - margin;
            const innerRadius = radius * 0.58;

            const g = svg.append('g')
                .attr('transform', `translate(${width / 2},${height / 2})`);

            const pie = d3.pie<MedicalFlagDistributionItem>()
                .value(d => d.count)
                .sort(null)
                .padAngle(0.03);

            const arc = d3.arc<d3.PieArcDatum<MedicalFlagDistributionItem>>()
                .innerRadius(innerRadius)
                .outerRadius(radius)
                .cornerRadius(4);

            const arcHover = d3.arc<d3.PieArcDatum<MedicalFlagDistributionItem>>()
                .innerRadius(innerRadius - 3)
                .outerRadius(radius + 7)
                .cornerRadius(4);

            const colorScale = d3.scaleOrdinal<string>()
                .domain(data.map(d => d.flagName))
                .range(['#DC2626', '#E11D48', '#C7A75D', '#D97706', '#4F46E5', '#2563EB', '#64748B']);

            const arcs = g.selectAll('.arc')
                .data(pie(data))
                .enter()
                .append('g')
                .attr('class', 'arc');

            arcs.append('path')
                .attr('d', arc)
                .attr('fill', d => colorScale(d.data.flagName))
                .attr('cursor', 'pointer')
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', 2)
                .on('mouseenter', function (event, d) {
                    d3.select(this).transition().duration(200).attr('d', arcHover as any);
                    const [mx, my] = d3.pointer(event, container);
                    setHoveredFlag({ x: mx, y: my, item: d.data });
                })
                .on('mousemove', function (event, d) {
                    const [mx, my] = d3.pointer(event, container);
                    setHoveredFlag({ x: mx, y: my, item: d.data });
                })
                .on('mouseleave', function (event, d) {
                    d3.select(this).transition().duration(200).attr('d', arc as any);
                    setHoveredFlag(null);
                })
                .on('click', (_, d) => {
                    setSelectedFlag(d.data === selectedFlag ? null : d.data);
                });

            // Center Text
            const totalFlags = data.reduce((s, c) => s + c.count, 0);
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '-0.2em')
                .attr('font-size', '20px')
                .attr('font-weight', 'bold')
                .attr('font-family', 'serif')
                .attr('fill', '#1F2A37')
                .text(totalFlags);

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1.3em')
                .attr('font-size', '10px')
                .attr('font-weight', '600')
                .attr('font-family', 'sans-serif')
                .attr('fill', '#78716C')
                .attr('letter-spacing', '0.05em')
                .text('RISIKO-EINTRÄGE');
        }

    }, [data, height, viewMode, selectedFlag]);

    return (
        <div className="w-full relative" ref={containerRef}>
            {/* Chart Sub-header & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-p-text/70 uppercase tracking-wider">
                        D3.js Risikofaktoren-Verteilung
                    </span>
                    <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 font-semibold px-2 py-0.5 rounded-full">
                        {data.filter(d => d.riskLevel === 'high').length} {t({ de: 'Hohe Risikostufen', en: 'High Risk Levels' })}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 bg-p-background p-1 rounded-xl border border-p-stone text-xs">
                    <button
                        onClick={() => setViewMode('bars')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            viewMode === 'bars'
                                ? 'bg-white text-p-primary shadow-sm font-semibold'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        {t({ de: 'Balken-Ranking', en: 'Bar Ranking' })}
                    </button>
                    <button
                        onClick={() => setViewMode('donut')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            viewMode === 'donut'
                                ? 'bg-white text-p-primary shadow-sm font-semibold'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        {t({ de: 'Donut-Kreis', en: 'Donut Chart' })}
                    </button>
                </div>
            </div>

            {/* D3 SVG Canvas */}
            <div className="relative w-full bg-white rounded-2xl border border-p-stone/60 p-2 shadow-inner overflow-hidden">
                <svg ref={svgRef} className="w-full overflow-visible" />

                {/* Hover Tooltip */}
                {hoveredFlag && (
                    <div
                        className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
                        style={{
                            left: `${Math.min(Math.max(hoveredFlag.x, 110), (containerRef.current?.clientWidth || 500) - 150)}px`,
                            top: `${Math.max(hoveredFlag.y - 130, 10)}px`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="bg-p-primary text-white backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10 text-xs min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-2 font-serif font-bold text-sm">
                                <span>{hoveredFlag.item.flagName}</span>
                                <span className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded ${
                                    hoveredFlag.item.riskLevel === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-p-accent/20 text-p-accent'
                                }`}>
                                    {hoveredFlag.item.riskLevel === 'high' 
                                        ? t({ de: 'Hohes Risiko', en: 'High Risk' }) 
                                        : t({ de: 'Mittleres Risiko', en: 'Moderate Risk' })}
                                </span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">{t({ de: 'Erfasste Fälle:', en: 'Recorded Cases:' })}</span>
                                    <span className="font-bold font-mono text-white">
                                        {hoveredFlag.item.count} {t({ de: 'Patienten', en: 'patients' })} ({hoveredFlag.item.percentage}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">{t({ de: 'Kategorie:', en: 'Category:' })}</span>
                                    <span className="text-white font-medium truncate max-w-[130px]">
                                        {hoveredFlag.item.clinicalCategory}
                                    </span>
                                </div>
                                <div className="pt-1.5 mt-1 border-t border-white/10 text-[10px] text-white/90">
                                    <span className="text-p-accent font-semibold block">{t({ de: 'Klinisches Protokoll:', en: 'Clinical Protocol:' })}</span>
                                    <span className="leading-tight block mt-0.5">{hoveredFlag.item.clinicalProtocol}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Flag Clinical Protocol Accordion */}
            {selectedFlag && (
                <div className="mt-3 p-3.5 bg-p-background rounded-xl border border-p-stone/70 animate-fade-in text-xs">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                            <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                                selectedFlag.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                <ExclamationTriangleIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-serif font-bold text-p-primary text-sm">
                                        {selectedFlag.flagName}
                                    </h4>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-p-stone text-p-text">
                                        {selectedFlag.count} {t({ de: 'Klienten betroffen', en: 'clients flagged' })}
                                    </span>
                                </div>
                                <p className="text-p-text/80 mt-1 leading-relaxed">
                                    <strong className="text-p-primary">{t({ de: 'Praxis-Sicherheitshinweis:', en: 'Practice Safety Notice:' })} </strong>
                                    {selectedFlag.clinicalProtocol}
                                </p>
                                {selectedFlag.affectedClients.length > 0 && (
                                    <p className="text-[11px] text-p-text/60 mt-1.5">
                                        {t({ de: 'Betroffene Kunden heute:', en: 'Flagged clients today:' })} <span className="font-medium text-p-primary">{selectedFlag.affectedClients.join(', ')}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedFlag(null)}
                            className="text-p-text/50 hover:text-p-primary text-xs underline font-medium flex-shrink-0"
                        >
                            {t({ de: 'Schließen', en: 'Close' })}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
