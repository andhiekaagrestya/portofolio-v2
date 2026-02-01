"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface SeedSVGProps {
  isLooping: boolean;
  onTransitionComplete?: () => void;
}

export default function SeedSVG({ isLooping, onTransitionComplete }: SeedSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const pathLength = path.getTotalLength();

    // Set initial state
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    if (isLooping) {
      // Create looping animation
      animationRef.current = gsap.timeline({ repeat: -1 });

      animationRef.current
        .to(path, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: "power2.inOut",
        })
        .to(path, {
          strokeDashoffset: -pathLength,
          duration: 2.5,
          ease: "power2.inOut",
        })
        .set(path, {
          strokeDashoffset: pathLength,
        });

      // Add subtle pulse effect
      gsap.to(svgRef.current, {
        scale: 1.02,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else {
      // Kill looping animation and transition out
      if (animationRef.current) {
        animationRef.current.kill();
      }
      gsap.killTweensOf(svgRef.current);

      gsap.to(svgRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: onTransitionComplete,
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      gsap.killTweensOf(path);
      gsap.killTweensOf(svgRef.current);
    };
  }, [isLooping, onTransitionComplete]);

  return (
    <svg
      ref={svgRef}
      className="seed-svg"
      width="149"
      height="296"
      viewBox="0 0 149 296"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={pathRef}
        d="M72.5549 0.297516C72.5549 0.297516 84.0549 15.7975 84.0549 35.7975C84.0549 55.7975 72.5998 71.7234 45.0549 90.7975C17.51 109.872 8.0552 125.298 2.05488 152.798C-3.46725 178.106 6.76567 188.534 16.0549 208.798L50.0549 258.798C60.1843 269.099 64.6923 277.981 72.5549 294.298C90.398 282.756 108.055 258.798 108.055 258.798C108.055 258.798 124.886 238.207 130.055 223.298H84.0549C84.6509 209.845 95.0549 189.798 95.0549 189.798C95.0549 189.798 102.128 181.2 108.055 178.798C113.981 176.395 142.055 178.798 142.055 178.798C148.348 162.556 147.555 137.298 147.555 137.298M121.055 68.2975C126.725 80.3073 121.055 97.2975 121.055 97.2975C120.92 111.351 111.883 116.144 99.0549 126.298C86.2266 136.451 88.0071 140.801 76.5549 148.798C67.8196 154.897 63.7821 160.014 58.5549 169.298C51.9326 181.058 50.0549 202.798 50.0549 202.798"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
