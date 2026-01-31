"use client";

import { useState, useRef, useCallback } from "react";
import GrainyBackground from "./GrainyBackground";
import SeedSVG from "./SeedSVG";
import GrowingSVG, { GrowingSVGRef } from "./GrowingSVG";
import TextReveal, { TextRevealRef } from "./TextReveal";
import LenisProvider from "./LenisProvider";

interface ScrollytellingCanvasProps {
  children?: React.ReactNode;
}

export default function ScrollytellingCanvas({ children }: ScrollytellingCanvasProps) {
  const [phase, setPhase] = useState<"intro" | "scrolling" | "complete">("intro");
  const [isLooping, setIsLooping] = useState(true);
  const growingSVGRef = useRef<GrowingSVGRef>(null);
  const textRevealRef = useRef<TextRevealRef>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback(() => {
    setIsLooping(false);
  }, []);

  const handleSeedTransitionComplete = useCallback(() => {
    setPhase("scrolling");
    // Start the scroll-driven animations
    setTimeout(() => {
      growingSVGRef.current?.startAnimation();
      textRevealRef.current?.startAnimation();
    }, 100);
  }, []);

  return (
    <LenisProvider enabled={phase === "scrolling"}>
      <div className="scrollytelling-wrapper">
        {/* Fixed Canvas Stage */}
        <div className="canvas-stage">
          {/* Background Layer */}
          <GrainyBackground />

          {/* Mid-ground Layer - Text */}
          <div className="mid-ground">
            <TextReveal
              ref={textRevealRef}
              text="THE LIVING LINE"
              className="hero-text"
            />
          </div>

          {/* Foreground Layer - SVG */}
          <div className="foreground">
            {phase === "intro" && (
              <SeedSVG
                isLooping={isLooping}
                onTransitionComplete={handleSeedTransitionComplete}
              />
            )}
            {phase !== "intro" && (
              <GrowingSVG
                ref={growingSVGRef}
                scrollContainer={scrollContainerRef}
              />
            )}
          </div>

          {/* Start Button */}
          {phase === "intro" && isLooping && (
            <button className="start-button" onClick={handleStart}>
              <span className="start-text">Begin Experience</span>
              <span className="start-arrow">↓</span>
            </button>
          )}
        </div>

        {/* Scroll Content */}
        {phase !== "intro" && (
          <div ref={scrollContainerRef} className="scroll-content">
            <div className="scroll-spacer" />

            {/* Next Section After Dive */}
            <section className="next-section">
              <div className="next-section-content">
                <h2 className="next-title">Welcome</h2>
                <p className="next-description">
                  You have entered a new dimension of digital experience.
                </p>
              </div>
            </section>
          </div>
        )}

        {children}
      </div>
    </LenisProvider>
  );
}
