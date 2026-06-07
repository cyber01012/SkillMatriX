"use client";

import React from "react";

const KPICard = ({ title, value, unit, icon: Icon, color = "indigo" }) => {
    // Standardizing to landing page palette with vibrant gradients
    const colorMap = {
        indigo: {
            bg: "bg-gradient-to-br from-white via-white to-indigo-100",
            icon: "bg-[#2A2771] text-white border-[#2A2771]/20",
            accent: "bg-[#2A2771]/30",
            glow: "group-hover:shadow-indigo-200/50"
        },
        teal: {
            bg: "bg-gradient-to-br from-white via-white to-emerald-100",
            icon: "bg-[#26B291] text-white border-[#26B291]/20",
            accent: "bg-[#26B291]/30",
            glow: "group-hover:shadow-emerald-200/50"
        },
        purple: {
            bg: "bg-gradient-to-br from-white via-white to-purple-100",
            icon: "bg-[#A354B5] text-white border-[#A354B5]/20",
            accent: "bg-[#A354B5]/30",
            glow: "group-hover:shadow-purple-200/50"
        },
        mint: {
            bg: "bg-gradient-to-br from-white via-white to-[#A8E6CF]/40",
            icon: "bg-[#A8E6CF] text-[#2A2771] border-[#A8E6CF]/50",
            accent: "bg-[#A8E6CF]/60",
            glow: "group-hover:shadow-green-200/50"
        },
    };

    const currentStyle = colorMap[color] || colorMap.indigo;

    return (
        <div className={`relative p-6 rounded-[2.5rem] ${currentStyle.bg} shadow-xl shadow-black/5 border border-white/40 flex flex-col items-center justify-center text-center hover:shadow-2xl ${currentStyle.glow} hover:-translate-y-2 transition-all duration-500 group h-full w-full overflow-hidden kpi-glass-card`}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mb-3 ${currentStyle.icon} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500 border z-10`}>
                {Icon && <Icon size={24} />}
            </div>

            <div className="space-y-0.5 z-10">
                <h3 className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em]">{title}</h3>
                <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-4xl font-bold text-[#2A2771] leading-none tracking-tighter transition-transform group-hover:scale-105 duration-500">{value}</span>
                    {unit && <span className="text-xs font-bold text-[#26B291] uppercase tracking-widest">{unit}</span>}
                </div>
            </div>

            {/* Vibrant Decorative Accent */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${currentStyle.accent} rounded-full blur-3xl opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700`} />
            <div className={`absolute -top-10 -left-10 w-24 h-24 ${currentStyle.accent} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-all duration-700`} />

            <style jsx>{`
                .kpi-glass-card {
                    -webkit-backdrop-filter: blur(4px);
                    backdrop-filter: blur(4px);
                    will-change: transform, backdrop-filter;
                    transform: translateZ(0);
                }
            `}</style>
        </div>
    );
};

export default KPICard;
