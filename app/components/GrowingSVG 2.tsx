"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface GrowingSVGRef {
  startAnimation: () => void;
}

interface GrowingSVGProps {
  scrollContainer?: React.RefObject<HTMLElement | null>;
}

const GrowingSVG = forwardRef<GrowingSVGRef, GrowingSVGProps>(
  ({ scrollContainer }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useImperativeHandle(ref, () => ({
      startAnimation: () => {
        if (!pathRef.current || !svgRef.current || !containerRef.current) return;

        const path = pathRef.current;
        const pathLength = path.getTotalLength();

        // Set initial state
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        // Start FULL SCREEN - close to camera
        gsap.set(containerRef.current, {
          opacity: 1,
          z: 500,
          scale: 3,
        });

        // Start with thick stroke (close)
        gsap.set(path, {
          strokeWidth: 12,
        });

        // Create the main timeline
        timelineRef.current = gsap.timeline({
          scrollTrigger: {
            trigger: ".scroll-content",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
            markers: false,
          },
        });

        // Phase 1: The Draw + Move Back (0-70%)
        // Line draws as it moves INTO the distance
        timelineRef.current.to(
          path,
          {
            strokeDashoffset: 0,
            duration: 0.7,
            ease: "power2.inOut",
          },
          0
        );

        // Move from front to back - following the line growth
        timelineRef.current.to(
          containerRef.current,
          {
            z: -2000,
            scale: 0.3,
            duration: 0.7,
            ease: "power2.inOut",
          },
          0
        );

        // Stroke gets thinner as it moves away
        timelineRef.current.to(
          path,
          {
            strokeWidth: 1,
            duration: 0.7,
            ease: "power2.inOut",
          },
          0
        );

        // Phase 2: Final fade into distance (70-100%)
        timelineRef.current.to(
          containerRef.current,
          {
            z: -4000,
            scale: 0.05,
            opacity: 0,
            duration: 0.3,
            ease: "power4.in",
          },
          0.7
        );
      },
    }));

    useEffect(() => {
      return () => {
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
      };
    }, []);

    return (
      <div ref={containerRef} className="growing-svg-container">
        <svg
          ref={svgRef}
          className="growing-svg"
          viewBox="0 0 1270 682"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            ref={pathRef}
            d="M0.162354 681.122C130.626 636.34 193.696 583.372 300.662 473.622C540.934 522.024 673.28 465.467 910.662 411.622C800.497 363.446 733.894 340.713 595.662 364.122C537.305 370.898 507.496 366.159 475.662 295.122C557.227 226.302 606.802 230.944 695.662 244.122C772.792 268.022 802.149 263.85 824.662 218.622C739.591 164.525 689.368 161.604 595.662 200.622C576.663 300.173 602.885 318.286 670.162 329.622C702.702 354.164 714.774 369.968 695.662 411.622C629.699 444.236 592.142 453.941 521.162 411.622C475.575 395.742 465.532 382.348 497.162 344.122C562.057 274.69 547.009 229.385 768.662 282.122C639.043 340.41 586.005 326.493 521.162 231.122C558.424 190.196 570.475 158.375 670.162 180.122C760.905 219.821 758.079 259.166 752.162 329.622C456.016 391.096 348.782 354.388 264.162 160.122C558.041 -96.0794 711.938 3.49553 988.662 131.122C903.038 187.516 894.016 219.337 979.662 276.622C1051.84 427.62 1121.82 433.576 1269.16 384.122"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);

GrowingSVG.displayName = "GrowingSVG";

export default GrowingSVG;
