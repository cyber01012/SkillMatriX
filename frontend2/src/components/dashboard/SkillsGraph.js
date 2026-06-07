"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    CheckCircle2,
    Sparkles,
    Box
} from "lucide-react";

const SkillsGraph = ({ data }) => {
    const total = data.strong + data.weak + data.missing;

    // Mapping categories to landing page theme colors (No red/yellow)
    const skills = [
        { label: "Mastered", value: data.strong, color: "#2A2771", icon: CheckCircle2 }, // Deep Indigo
        { label: "In Progress", value: data.weak, color: "#26B291", icon: Sparkles },    // Teal
        { label: "Pending", value: data.missing, color: "#A354B5", icon: Box },         // Purple
    ];

    let currentAngle = 0;
    const segments = skills.map((skill) => {
        const angle = (skill.value / total) * 360;
        const segment = {
            ...skill,
            startAngle: currentAngle,
            angle: angle,
        };
        currentAngle += angle;
        return segment;
    });

    return (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#2A2771]/5 flex flex-col md:flex-row items-center gap-16 h-full relative overflow-hidden group">
            {/* Decorative Gradient Background */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#A8E6CF]/10 rounded-full blur-[100px] group-hover:bg-[#A8E6CF]/20 transition-all duration-1000" />

            {/* Pie Chart SVG container */}
            <div className="relative w-64 h-64 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-sm">
                    {segments.map((segment, i) => {
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDasharray = `${(segment.angle / 360) * circumference} ${circumference}`;
                        const strokeDashoffset = -((segment.startAngle / 360) * circumference);

                        return (
                            <motion.circle
                                key={i}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={segment.color}
                                strokeWidth="10"
                                strokeDasharray={strokeDasharray}
                                initial={{ strokeDashoffset: circumference, strokeWidth: 0, opacity: 0 }}
                                whileInView={{
                                    strokeDashoffset: strokeDashoffset,
                                    strokeWidth: 10,
                                    opacity: 1
                                }}
                                viewport={{ once: false }}
                                whileHover={{
                                    strokeWidth: 14,
                                    transition: { duration: 0.2 }
                                }}
                                transition={{
                                    duration: 1.5,
                                    ease: [0.16, 1, 0.3, 1],
                                    delay: i * 0.1
                                }}
                                className="cursor-pointer"
                            />
                        );
                    })}
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Impact</span>
                    <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: false }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
                        className="text-4xl font-black text-[#2A2771]"
                    >
                        {total}
                    </motion.span>
                </div>
            </div>

            {/* Legend and Details */}
            <div className="flex-1 space-y-8 w-full z-10">
                <div>
                    <h3 className="text-[#2A2771] font-black text-3xl mb-1 flex items-center gap-3">
                        Skill Analytics
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <TrendingUp size={24} className="text-[#26B291]" />
                        </motion.div>
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Competency Distribution</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {skills.map((skill, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                whileHover={{ x: 8 }}
                                transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                                className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100/80 hover:bg-white hover:shadow-md transition-all group/item"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl" style={{ backgroundColor: `${skill.color}10`, color: skill.color }}>
                                        <skill.icon size={22} />
                                    </div>
                                    <div>
                                        <span className="block text-[#2A2771] font-bold text-base leading-tight">{skill.label}</span>
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{((skill.value / total) * 100).toFixed(0)}% Match</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-[#2A2771]">{skill.value}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SkillsGraph;
