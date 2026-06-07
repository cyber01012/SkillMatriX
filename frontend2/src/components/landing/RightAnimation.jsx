"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";

export default function RightAnimation() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/vector.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  if (!animationData) {
    return (
      <div className="hidden md:flex flex-1 justify-center items-center">
        <div className="w-full max-w-xl aspect-square" />
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-1 justify-center items-center">
      <div className="w-full max-w-xl aspect-square">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="w-full h-full object-contain translate-x-9"
          style={{ transform: 'translateY(-13px)' }}
        />
      </div>
    </div>
  );
}