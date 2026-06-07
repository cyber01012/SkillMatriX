"use client";

import { useState, useEffect } from "react";
import GradientText from "@/components/design/GradientText";

export default function DashboardHeader({ userName }) {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) setGreeting('Good Morning');
        else if (currentHour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <div className="mb-4 text-left">
            {/* Header Title Group (Vertical Stack) */}
            <div className="flex flex-col  mb-2 w-full">
                <h1 className="text-5xl md:text-7xl font-bold italic tracking-tighter leading-tight text-[#1A184D]/90 ">
                    {greeting},
                </h1>

                <div className="ml-1">
                    <GradientText
                        colors={["#1A184D", "#26B291", "#A354B5"]}
                        animationSpeed={8}
                        className="text-[2.5rem] md:text-[2.75rem] font-bold tracking-tight leading-none"
                    >
                        {userName}
                    </GradientText>
                </div>
            </div>

            {/* Description Text */}
            <p className="text-[#1A184D]/80 font-medium text-sm md:text-base max-w-xl ml-2">
                Monitor your growth on your personalized dashboard.
            </p>
        </div>
    );
}