"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface TextRevealRef {
  startAnimation: () => void;
}

interface TextRevealProps {
  text: string;
  className?: string;
}

const TextReveal = forwardRef<TextRevealRef, TextRevealProps>(
  ({ text, className = "" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const charsRef = useRef<HTMLSpanElement[]>([]);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useImperativeHandle(ref, () => ({
      startAnimation: () => {
        if (!containerRef.current || charsRef.current.length === 0) return;

        // Set initial state
        gsap.set(charsRef.current, {
          opacity: 0,
          y: 50,
          rotateX: -90,
        });

        gsap.set(containerRef.current, {
          opacity: 1,
        });

        // Create scroll-triggered animation
        timelineRef.current = gsap.timeline({
          scrollTrigger: {
            trigger: ".scroll-content",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        });

        // Phase 3: Text Interaction (40-60%)
        timelineRef.current.to(
          charsRef.current,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.02,
            duration: 0.2,
            ease: "power2.out",
          },
          0.4
        );

        // Fade out with the dive
        timelineRef.current.to(
          containerRef.current,
          {
            scale: 3,
            opacity: 0,
            duration: 0.2,
            ease: "power4.in",
          },
          0.8
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

    // Split text into characters
    const chars = text.split("");

    return (
      <div
        ref={containerRef}
        className={`text-reveal ${className}`}
        style={{ opacity: 0 }}
      >
        {chars.map((char, index) => (
          <span
            key={index}
            ref={(el) => {
              if (el) charsRef.current[index] = el;
            }}
            className="text-reveal-char"
            style={{ display: char === " " ? "inline" : "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    );
  }
);

TextReveal.displayName = "TextReveal";

export default TextReveal;
