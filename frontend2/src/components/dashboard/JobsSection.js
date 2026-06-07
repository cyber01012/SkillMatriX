"use client";

import React from "react";
import { ExternalLink, Briefcase } from "lucide-react";

const JobsSection = ({ jobs }) => {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#A8E6CF]/20 flex flex-col h-full group">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#26B291]/10 text-[#26B291] rounded-xl">
                        <Briefcase size={22} />
                    </div>
                    <h3 className="text-[#2A2771] font-black text-xl">Top 3 Ranked Jobs</h3>
                </div>
                <button className="text-[#26B291] text-sm font-bold hover:underline px-4 py-2 hover:bg-[#26B291]/5 rounded-xl transition-all" 
                    onClick={() => {
                        const rec = userData.lastRecId;
                        window.location.href = rec
                        ? `/jobs?from=dashboard&recId=${rec}`
                        : `/jobs`;
                    }}
                    >View All Opportunities</button>
            </div>

            <div className="space-y-4 flex-1">
                {jobs.map((job, index) => (
                    <div
                        key={index}
                        className="group/job p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 hover:border-[#26B291]/40 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 flex items-center justify-center text-[#2A2771]/50 font-black text-2xl group-hover/job:text-[#26B291] transition-all">
                                {index + 1}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-[#2A2771] text-base group-hover/job:text-[#26B291] transition-colors">{job.title}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.company || "Fortune 500 Co."}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold text-[#26B291] leading-none">{job.match}%</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Match Scope</span>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/job:bg-[#26B291] group-hover/job:text-white group-hover/job:border-[#26B291] group-hover/job:rotate-12 transition-all shadow-sm" 
                                onClick={() => {
                                    if (job?.url) window.open(job.url, '_blank', 'noopener,noreferrer');
                                }}
                                disabled={!job?.url}
                                >
                                <ExternalLink size={20} /> 
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobsSection;
