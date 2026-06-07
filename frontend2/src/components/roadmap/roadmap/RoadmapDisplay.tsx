/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";
import ScrollToTop from "../common/ScrollToTop";
import React from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Target,
    ChevronRight,
    Sparkles,
    Trophy,
    ExternalLink,
    BookOpen,
    Rocket
} from "lucide-react";
import { cn } from "@/features/roadmap/lib/utils";

const statusConfig = {
    STRONG: {
        icon: CheckCircle2,
        color: "text-[#26b2d1]",
        bg: "bg-[#26b2d1]/10",
        border: "border-[#26b2d1]/40",
        glow: "shadow-[0_0_20px_rgba(38,178,209,0.3)]"
    },
    WEAK: {
        icon: AlertCircle,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/40",
        glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]"
    },
    MISSING: {
        icon: HelpCircle,
        color: "text-[#c86ad6]",
        bg: "bg-[#c86ad6]/10",
        border: "border-[#c86ad6]/40",
        glow: "shadow-[0_0_20px_rgba(200,106,214,0.3)]"
    },
    MILESTONE: {
        icon: Target,
        color: "text-white",
        bg: "bg-gradient-to-br from-[#26b2d1] via-[#c86ad6] to-[#3D418A]",
        border: "border-white/40",
        glow: "shadow-[0_0_40px_rgba(38,178,209,0.4)]"
    }
};

const StepCard = ({ step, index, isMilestone, config }) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className={cn(
            "w-full p-8 rounded-[3rem] border border-white/60 shadow-2xl backdrop-blur-2xl transition-all duration-300",
            isMilestone
                ? "bg-[#3D418A] text-white ring-8 ring-[#c86ad6]/10"
                : "bg-white/80 hover:bg-white text-[#3D418A]",
            "group cursor-pointer"
        )}
    >
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                    isMilestone ? "bg-[#c86ad6] text-white" : cn(config.bg, config.color)
                )}>
                    {step.status}
                </span>
                <span className="text-[10px] font-black text-[#3D418A]/20">STEP {index + 1}</span>
            </div>

            <h3 className={cn(
                "text-2xl font-black tracking-tight",
                isMilestone ? "text-[#a8e6cf]" : "text-[#3D418A]"
            )}>
                {step.skillName}
            </h3>

            <p className={cn(
                "font-semibold leading-relaxed",
                isMilestone ? "text-white/80" : "text-[#3D418A]/70"
            )}>
                {step.guidance}
            </p>

            {step.strategicAction && (
                <div className="mt-4 p-4 rounded-3xl bg-[#c86ad6]/5 border border-[#c86ad6]/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-[#c86ad6]" />
                        <span className="text-[10px] font-black uppercase text-[#c86ad6]">Strategic Action</span>
                    </div>
                    <p className={cn(
                        "text-xs font-bold leading-normal",
                        isMilestone ? "text-white/90" : "text-[#3D418A]"
                    )}>
                        {step.strategicAction}
                    </p>
                </div>
            )}

            {step.resources && (
                <div className={cn(
                    "mt-4 p-4 rounded-3xl border transition-all duration-300",
                    isMilestone
                        ? "bg-white/10 border-white/20 hover:bg-white/20"
                        : "bg-[#26b2d1]/5 border-[#26b2d1]/20 hover:bg-[#26b2d1]/10"
                )}>
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={14} className={isMilestone ? "text-[#a8e6cf]" : "text-[#26b2d1]"} />
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider",
                            isMilestone ? "text-[#a8e6cf]" : "text-[#26b2d1]"
                        )}>
                            Learning Resources
                        </span>
                    </div>
                    <div className={cn(
                        "text-xs font-bold leading-relaxed space-y-2",
                        isMilestone ? "text-white/70" : "text-[#3D418A]/80"
                    )}>
                        {step.resources.split(/(\s+)/).map((part, i) => {
                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                            const match = part.match(urlRegex);
                            if (match) {
                                const url = match[0].replace(/[.,;:]$/, '');
                                return (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[#26b2d1] hover:underline break-all"
                                    >
                                        {url}
                                        <ExternalLink size={10} />
                                    </a>
                                );
                            }
                            return part;
                        })}
                    </div>
                </div>
            )}
        </div>
    </motion.div>
);


export default function RoadmapDisplay({ roadmap, role }) {
    // const displayRole = role && role.trim() !== "" ;
    if (!roadmap || roadmap.length === 0) return null;

    return (
        <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-24">
            {/* Refined Background Overlays - Reduced Top Intensity */}
            <div className="absolute top-0 -left-60 w-[800px] h-[800px] bg-[#c86ad6]/25 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-0 -right-40 w-[700px] h-[700px] bg-[#26b2d1]/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#c86ad6]/30 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/25 blur-[170px] rounded-full pointer-events-none" />
            <div className="absolute top-1/3 -right-60 w-[700px] h-[700px] bg-[#26b2d1]/30 blur-[110px] rounded-full pointer-events-none" />
            <div className="absolute top-2/3 -left-80 w-[800px] h-[800px] bg-[#c86ad6]/50 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[700px] h-[700px] bg-[#26b2d1]/35 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 -right-60 w-[1000px] h-[1000px] bg-[#c86ad6]/45 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/2 w-[600px] h-[600px] bg-[#26b2d1]/20 blur-[130px] rounded-full pointer-events-none" />
            <ScrollToTop />
            {/* Simplified Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-5 py-1.5 mt-4 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-[#333777] text-[10px] font-black tracking-[0.2em] uppercase">
                    <Rocket size={12} className="text-[#c86ad6]" />
                    Career Pathway
                </div>
                <h2 className="text-7xl md:text-8xl font-black text-[#333777] tracking-tighter leading-[1.1] pb-8">
                    Roadmap <span className="text-5xl md:text-5xl font-bold opacity-80 align-baseline mx-0.5">to</span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#333777] to-[#c86ad6] text-6xl md:text-7xl italic px-10 py-4 -mt-2 inline-block">
                        {role}
                    </span>
                </h2>
                <p className="text-[#333777]/90 font-bold max-w-xl mx-auto text-base leading-relaxed -mt-8">
                    A precisely engineered sequence to bridge your gaps and <span className="text-[#26b2d1] italic">accelerate</span> your growth.
                </p>
            </motion.div>

            {/* Roadmap Container */}
            <div className="relative">
                {/* The "Roadmap" Path - Compact version */}
                <div className="absolute left-10 md:left-1/2 top-4 bottom-4 w-[6px] bg-[#3D418A]/10 hidden md:block -translate-x-1/2 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="w-full bg-gradient-to-b from-[#26b2d1] via-[#c86ad6] to-[#3D418A]"
                    />
                </div>

                <div className="space-y-12 md:space-y-0 relative z-10">
                    {roadmap.map((step, index) => {
                        const isMilestone = step.status === 'MILESTONE';
                        const config = statusConfig[step.status] || statusConfig.MISSING;
                        const Icon = config.icon;
                        const isLeft = index % 2 === 0;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                viewport={{ once: true, margin: "-20px" }}
                                className={cn(
                                    "relative md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-12",
                                    isMilestone ? "mt-40 mb-96" : "mb-12 md:mb-0"
                                )}
                            >
                                {/* Left Side Area (Desktop) */}
                                <div className={cn(
                                    "hidden md:flex justify-end",
                                    !isLeft && "md:invisible pointer-events-none"
                                )}>
                                    {isLeft && !isMilestone && (
                                        <StepCard step={step} index={index} isMilestone={isMilestone} config={config} />
                                    )}
                                </div>

                                {/* Central Node / Milestone Icon */}
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center z-20 transition-all duration-500",
                                        "bg-white border-4 shadow-xl",
                                        isMilestone ? "bg-gradient-to-br from-[#26b2d1] to-[#c86ad6] border-white scale-110" : cn("border-[#3D418A]/10", config.glow)
                                    )}>
                                        <Icon className={cn(
                                            "w-7 h-7 md:w-9 md:h-9",
                                            isMilestone ? "text-white" : config.color
                                        )} />
                                    </div>

                                    {/* Mobile Card (Visible only on mobile) */}
                                    <div className="mt-8 md:hidden w-full max-w-sm px-4">
                                        <StepCard step={step} index={index} isMilestone={isMilestone} config={config} />
                                    </div>
                                </div>

                                {/* Right Side Area (Desktop) */}
                                <div className={cn(
                                    "hidden md:flex justify-start",
                                    isLeft && "md:invisible pointer-events-none"
                                )}>
                                    {!isLeft && !isMilestone && (
                                        <StepCard step={step} index={index} isMilestone={isMilestone} config={config} />
                                    )}
                                </div>

                                {/* Milestone Content (Desktop) */}
                                {isMilestone && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="mt-96 md:mt-[30rem] w-full max-w-lg pointer-events-auto">
                                            <StepCard step={step} index={index} isMilestone={true} config={config} />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Success Celebration */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
                className="mt-[600px] text-center"
            >
                <div className="relative inline-block px-16 py-12 rounded-[4rem] bg-white shadow-[0_40px_100px_rgba(61,65,138,0.15)] overflow-hidden">
                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#a8e6cf]/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c86ad6]/10 blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                        className="mb-6 mx-auto w-16 h-16 bg-[#a8e6cf] rounded-2xl flex items-center justify-center shadow-lg"
                    >
                        <Trophy className="text-[#3D418A] w-8 h-8" />
                    </motion.div>

                    <h4 className="text-4xl font-black text-[#3D418A] tracking-tighter mb-4">
                        SUCCESS <span className="text-[#26b2d1] italic">ACCELERATED</span>
                    </h4>
                    <p className="font-bold text-[#3D418A]/50 max-w-sm mx-auto leading-relaxed">
                        Your career trajectory is now mathematically <span className="text-[#c86ad6] italic">optimized</span>. Take your first step toward {role} today.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
