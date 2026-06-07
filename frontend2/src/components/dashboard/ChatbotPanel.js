"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, Maximize2, Sparkles, Loader2, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatbotPanel = ({
    isFullView = true,
    onToggle,
    onInteract,
    messages = [],
    inputText = "",
    setInputText,
    sessionId,
    hasSkillData,
    isLoading = false,
    onSendMessage,
    role = "Full Stack Developer"
}) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const suggestedQuestions = [
        "What is my next best action?",
        "Why is this skill a priority?",
        "Show me my career scenarios",
        "How can I bridge my skill gap?"
    ];

    const handleInteractionTrigger = (question = null) => {
        if (!isFullView) {
            if (onInteract) onInteract();
            if (question && onSendMessage) {
                setTimeout(() => onSendMessage(question), 100);
            }
        }
    };

    return (
        <div className={`flex flex-col h-full bg-[#1A184D] relative shadow-2xl overflow-hidden font-sans border border-white/5 ${!isFullView ? "cursor-pointer" : ""}`}
            onClick={() => !isFullView && handleInteractionTrigger()}
        >
            {/* Minimal Subtle Header Glow */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#A354B5]/20 to-transparent" />

            {/* Header */}
            <div className={`px-6 ${isFullView ? "py-4" : "py-3"} border-b border-white/5 flex justify-between items-center bg-[#1A184D]/80 backdrop-blur-xl z-10`}>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#A354B5] to-[#6366F1] rounded-xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className={`relative ${isFullView ? "w-10 h-10" : "w-8 h-8"} bg-[#2A2771] border border-white/10 rounded-xl flex items-center justify-center shadow-lg`}>
                            <Bot className="text-[#A5B4FC]" size={isFullView ? 22 : 18} />
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 ${isFullView ? "w-3 h-3" : "w-2.5 h-2.5"} bg-[#26B291] border-2 border-[#1A184D] rounded-full shadow-lg`} />
                    </div>
                    <div>
                        <span className={`block text-white font-bold tracking-tight text-shadow-sm ${isFullView ? "text-sm" : "text-xs"}`}>Strategic Co-Pilot</span>
                        <span className={`flex items-center gap-1.5 text-[#A354B5] font-bold uppercase tracking-[0.2em] opacity-90 ${isFullView ? "text-[9px]" : "text-[7px]"}`}>
                            <Sparkles size={isFullView ? 10 : 8} className="animate-pulse" />
                            AI Insight Active
                        </span>
                    </div>
                </div>
                {onToggle && isFullView && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="text-white/40 hover:text-white transition-all p-2 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10"
                    >
                        <Maximize2 size={16} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar-indigo ${isFullView ? "p-5 space-y-4" : "p-4 space-y-3"}`}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div
                            className={`max-w-[92%] p-3 px-4 rounded-2xl leading-relaxed shadow-lg ${isFullView ? "text-[12px]" : "text-[11px]"} ${msg.type === "user"
                                ? "bg-gradient-to-br from-[#c86ad9] to-[#2ed3a6] text-white rounded-tr-none font-semibold shadow-[#c86ad9]/20 whitespace-pre-wrap"
                                : "bg-[#2A2771]/50 border border-white/10 text-slate-100 rounded-tl-none font-medium backdrop-blur-sm chat-markdown-content"
                                }`}
                        >
                            {msg.type === "user" ? (
                                msg.text
                            ) : (
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            )}
                        </div>
                        <span className={`text-[8px] font-bold mt-1 uppercase tracking-widest px-1 ${msg.type === "bot" ? "text-[#c86ad9]/60" : "text-[#2ed3a6]/60"}`}>
                            {msg.type === "bot" ? "SkillmatriX Intelligence" : "Protocol User"}
                        </span>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col items-start animate-in fade-in duration-300">
                        <div className="bg-[#2A2771]/50 border border-white/10 p-3 rounded-2xl rounded-tl-none backdrop-blur-sm">
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#A354B5] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#A354B5] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#A354B5] rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`${isFullView ? "p-4" : "p-3"} bg-[#1A184D] border-t border-white/5 relative`}>
                {!isFullView && (
                    <div className="absolute inset-0 bg-[#1A184D]/40 backdrop-blur-[2px] z-20 flex items-center justify-center group">
                        <span className="text-[10px] font-bold text-white/40 group-hover:text-white/70 transition-colors tracking-widest uppercase flex items-center gap-2">
                            <Bot size={12} className="text-[#A354B5]" />
                            Click to Engage Co-Pilot
                        </span>
                    </div>
                )}

                {/* Suggested Actions - Only if skills present */}
                {hasSkillData && messages.length === 1 && !isLoading && (
                    <div className={`flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${isFullView ? "mb-5" : "mb-3"}`}>
                        {suggestedQuestions.map((question, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    isFullView ? onSendMessage(question) : handleInteractionTrigger(question);
                                }}
                                className={`px-3 py-1.5 bg-white/5 hover:bg-[#A354B5]/10 border border-white/5 hover:border-[#A354B5]/30 rounded-lg text-slate-400 hover:text-[#A354B5] transition-all font-bold tracking-tight ${isFullView ? "text-[10px]" : "text-[8px]"}`}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (isFullView && hasSkillData) onSendMessage();
                        }}
                        className={`relative flex items-center bg-[#15123d] border border-white/10 rounded-full p-1.5 shadow-2xl transition-all ${hasSkillData ? "focus-within:border-[#26B291]/40" : "opacity-60 grayscale-[0.5] cursor-not-allowed"}`}
                    >
                        <div className="flex-1 relative flex items-center">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={hasSkillData ? (isFullView ? "Enter your career command..." : "Engage to chat...") : "AWAITING STRATEGIC DATA"}
                                className={`w-full bg-transparent text-slate-100 py-3 px-5 focus:outline-none placeholder:text-white/40 font-medium ${isFullView ? "text-[13px]" : "text-[11px]"} ${(!hasSkillData || !isFullView) ? "cursor-not-allowed" : ""}`}
                                disabled={isLoading || !sessionId || !hasSkillData || !isFullView}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !sessionId || !hasSkillData || !isFullView}
                            className={`w-10 h-10 ${hasSkillData ? "bg-gradient-to-tr from-[#c86ad9] to-[#2ed3a6] hover:shadow-[0_0_20px_rgba(46,211,166,0.3)]" : "bg-slate-700"} rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 disabled:opacity-50`}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    {!hasSkillData && (
                        <p className={`mt-3 font-bold text-center flex items-center justify-center gap-2 tracking-widest uppercase text-white/20 ${isFullView ? "text-[10px]" : "text-[8px]"}`}>
                            <Upload size={isFullView ? 10 : 8} />
                            Resume Analysis Required
                        </p>
                    )}
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar-indigo::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-indigo::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-indigo::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-indigo::-webkit-scrollbar-thumb:hover {
          background: rgba(38, 178, 145, 0.2);
        }
        
        .backdrop-blur-sm {
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
        }

        .chat-markdown-content p:not(:last-child) {
          margin-bottom: 0.75rem;
        }
        .chat-markdown-content strong {
          color: #fff;
          font-weight: 700;
        }
        .chat-markdown-content ul {
          margin-left: 1.25rem;
          margin-top: 0.5rem;
          list-style-type: disc;
        }
        .chat-markdown-content li {
          margin-bottom: 0.25rem;
        }
      `}</style>
        </div>
    );
};

export default ChatbotPanel;
