"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, Variants } from "framer-motion";
import LenisProvider from "./LenisProvider";

export default function ScrollytellingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // --- Animation Mapping ---

  // Intro (Looping) Opacity: Fades out quickly (0% -> 15%)
  const introOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const introScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]); // Subtle shrink match

  // Main (Scroll) Opacity: Fades in quickly (5% -> 20%) - overlapping for smoothness
  const mainOpacity = useTransform(scrollYProgress, [0.05, 0.2], [0, 1]);

  // Main Path Drawing (Scroll Controlled) - "Snake" / "Comet" Effect
  // The 'Head' draws forward, the 'Tail' chases it to erase the line.

  // Head moves from 0 to 1 between scroll 0.1 and 0.9
  const pathHead = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  // Tail moves from 0 to 1 between scroll 0.3 and 1.0 (Starts later, creates the trail length)
  const pathTail = useTransform(scrollYProgress, [0.3, 1.0], [0, 1]);

  // Derived Path Properties for the SVG path
  // pathLength is the visible length (Head - Tail)
  const mainPathLength = useTransform([pathHead, pathTail], ([h, t]) => Math.max(0, h - t));
  // pathOffset moves the start of the dash array
  const mainPathOffset = pathTail;

  // Main Path Ref for "Follow Line" calculation
  const pathRef = useRef<SVGPathElement>(null);

  // Camera Follow Springs (Percentages from center)
  const cameraX = useSpring(0, { stiffness: 60, damping: 20 });
  const cameraY = useSpring(0, { stiffness: 60, damping: 20 });
  const cameraXStr = useTransform(cameraX, (v) => `${v}%`);
  const cameraYStr = useTransform(cameraY, (v) => `${v}%`);

  // Update Camera Position on Scroll
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const path = pathRef.current;
    if (!path) return;

    // Track the "Head" progress for the camera
    // Reset range to match the pathHead range [0.1, 0.9]
    let progress = (latest - 0.1) / (0.9 - 0.1);
    // Clamp
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    try {
      const totalLen = path.getTotalLength();
      const point = path.getPointAtLength(progress * totalLen);

      // Calculate offset to center the point
      // ViewBox is 1267 wide x 832 high
      const pX = point.x / 1267; // 0..1
      const pY = point.y / 832;  // 0..1

      // Desired shift: 
      // We want to translate the container so that 'point' is at the center (0,0) relative to viewport
      // If pX is 0 (left), we need to shift +50% to bring it to center.
      // If pX is 1 (right), we need to shift -50% to bring it to center.

      cameraX.set((0.5 - pX) * 100);
      cameraY.set((0.5 - pY) * 100);

    } catch (e) {
      // Fallback
    }
  });

  // Parallax Zoom:
  // Starts distant (0.6) and zooms in close (2.5) as the form completes
  const parallaxScale = useTransform(scrollYProgress, [0.1, 1], [0.6, 2.5]);

  // Text Opacities
  const textIntroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const textMidOpacity = useTransform(scrollYProgress, [0.35, 0.4, 0.5, 0.55], [0, 1, 1, 0]);
  const textIdentityOpacity = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const textFinalOpacity = useTransform(scrollYProgress, [0.92, 0.98], [0, 1]);

  // Breathing Variant (Looping Scale)
  const breathingVariant: Variants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  const lineLoopVariant: Variants = {
    animate: {
      pathLength: [0, 1, 0],
      strokeDashoffset: [0, 0, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  const lineContinuousVariant: Variants = {
    animate: {
      strokeDashoffset: [0, -1000],
      transition: {
        duration: 3,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };


  return (
    <LenisProvider>
      <div ref={containerRef} className="relative w-full h-[500vh] bg-[#0a0a0a] text-[#f5f5f5]">

        {/* Sticky Stage */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

          {/* Background Grain */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          </div>

          {/* === INTRO SVG (LOOPING) === */}
          {/* Visible at top, loops endlessly */}
          <motion.div
            className="absolute z-20 w-full max-w-[200px] p-8 origin-center"
            style={{ opacity: introOpacity, scale: introScale }}
            variants={breathingVariant}
            animate="animate"
          >
            <svg
              width="327"
              height="663"
              viewBox="0 0 327 663"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <motion.path
                d="M147.903 35.3919C147.565 23.3302 146.258 15.855 141.403 0.891853C162.236 9.79072 172.556 18.0696 189.903 35.3919C205.646 56.9127 210.79 69.4831 216.403 92.3919C218.591 126.483 214.108 144.278 196.903 173.892C182.559 198.747 172.163 212.419 149.903 236.392C124.972 260.053 112.523 275.39 91.9032 304.892C72.5346 336.586 66.3419 356.387 64.9032 395.892C68.9166 424.332 73.2057 437.815 82.9032 459.392C96.8199 485.648 105.875 499.26 123.903 521.892L165.403 578.392L180.903 568.892C197.191 557.689 205.478 550.646 218.403 536.392C230.699 520.394 236.278 511.514 242.903 495.892H167.403C165.96 485.845 166.034 479.789 167.403 468.392C171.444 448.746 175.482 438.179 186.903 420.392C197.07 406.634 203.587 399.029 218.403 385.892C233.87 373.604 242.533 367.109 257.903 358.892C274.8 344.807 283.582 335.948 296.903 316.892L315.903 272.392C318.905 287.422 320.439 295.527 322.903 308.892C325.833 329.322 326.149 340.044 326.403 358.892C325.51 379.835 324.474 391.777 320.403 413.892H224.903L218.403 453.892H315.903L296.903 485.392L279.403 519.392L257.903 551.892C237.492 577.455 224.115 591.094 197.403 614.392C178.482 629.753 170.711 640.351 159.903 661.392C152.784 642.649 148.408 632.344 139.903 614.392C124.631 588.454 113.9 573.565 90.9032 546.392C65.9089 515.941 52.887 497.759 31.9032 462.892C15.3471 428.918 8.87044 408.921 2.90322 371.392C-0.302455 346.097 -0.299695 331.535 2.90322 304.892C10.4481 270.701 17.4121 251.82 36.9032 218.892C54.4389 197.464 65.019 185.674 86.4032 165.392C101.377 147.529 109.705 137.11 124.403 117.392C134.013 101.661 137.954 92.6104 141.403 75.8919C147.009 60.9574 148.275 52.0441 147.903 35.3919Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={lineContinuousVariant}
                strokeDasharray="900 100" // Dashed pattern for the loop effect
                animate="animate"
              />
              <motion.path
                d="M248.403 176.392C251.736 163.521 253.058 155.891 254.903 141.892C264.868 159.277 268.935 167.901 272.903 180.892C278.149 193.072 280.587 201.673 284.403 218.892C286.101 239.319 284.938 250.361 279.403 269.392C271.081 286.777 264.1 295.378 247.903 308.892L208.903 338.392C188.319 352.78 177.551 362.813 159.403 383.392C147.265 399.093 141.284 409.251 132.403 429.892C126.821 450.351 125.436 462.908 126.403 487.392C119.047 477.063 116.301 472.419 112.903 465.392C106.783 452.791 105.423 444.02 105.403 426.392C105.177 398.908 107.25 385.014 114.903 362.892C127.941 335.425 136.316 321.796 153.903 301.892L206.403 246.392C218.501 233.107 224.717 224.795 234.903 208.392C241.475 196.542 244.669 189.653 248.403 176.392Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                variants={lineContinuousVariant}
                strokeDasharray="900 100"
                animate="animate"
              />
            </svg>
            {/* "Scroll to Reveal" positioned explicitly under the SVG */}
            <motion.div
              className="mt-8 text-center"
              style={{ opacity: textIntroOpacity }}
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-medium">Scroll to Reveal</p>
            </motion.div>
          </motion.div>


          {/* === MAIN SVG (SCROLL CONTROLLED) === */}
          <motion.div
            className="relative z-10 w-full max-w-[2000px]"
            style={{ opacity: mainOpacity, scale: parallaxScale, x: cameraXStr, y: cameraYStr }}
          >
            <svg
              width="867"
              height="532"
              viewBox="0 0 1267 832"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-2xl"
            >
              <motion.path
                ref={pathRef}
                d="M0.321114 601.5C0.321114 601.5 119.563 500.889 208.321 457.5C358.595 384.04 774.195 455.351 628.321 373.5C551.054 330.145 410.321 377.5 404.321 337.5C398.321 297.5 515.132 240.347 580.321 273.5C669.172 318.686 413.51 394.701 444.321 489.5C484.383 612.76 741.908 529.154 764.321 401.5C788.232 265.318 425.321 289.5 444.321 250C463.321 210.5 764.321 194 764.321 250C764.321 306 720.321 515 664.321 537.5C608.321 560 177.083 215.021 312.321 6.00002C436.211 -185.482 820.734 -209.176 896.321 6.00002C971.721 220.64 421.321 314.882 444.321 373.5C467.321 432.118 818.869 473.83 796.321 337.5C779.796 237.585 679.387 172.976 580.321 194C448.38 222.001 423.906 476.732 544.321 537.5C665.649 598.729 813.821 344 796.321 297.5C778.821 251 312.321 205.5 312.321 273.5C312.321 341.5 1350.3 163.877 1260.32 537.5C1227.24 674.854 1182.88 779.499 1052.32 833.5C828.767 925.968 608.321 401.5 608.321 401.5C608.321 401.5 461.008 279.044 496.321 194C536.617 96.9542 684.261 101.941 764.321 170C876.149 265.065 496.321 433.5 496.321 433.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                style={{ pathLength: mainPathLength, pathOffset: mainPathOffset }}
              />
            </svg>
          </motion.div>

          {/* Text Overlays - Absolute positioning */}
          <div className="absolute inset-0 z-20 pointer-events-none">

            {/* Mid Section Narrative - Left */}
            <motion.div
              className="absolute top-[40%] left-[10%] max-w-xs"
              style={{ opacity: textMidOpacity }}
            >
              <p className="text-2xl md:text-3xl font-light leading-snug tracking-wide text-neutral-300">
                Form emerges from <span className="text-white font-normal">motion</span>.
              </p>
            </motion.div>

            {/* Later Section Narrative - Right */}
            <motion.div
              className="absolute top-[60%] right-[10%] max-w-xs text-right"
              style={{ opacity: textIdentityOpacity }}
            >
              <p className="text-2xl md:text-3xl font-light leading-snug tracking-wide text-neutral-300">
                Identity is not <span className="text-white font-normal">instant</span>.
              </p>
            </motion.div>

            {/* Final Section Narrative - Center Bottom */}
            <motion.div
              className="absolute bottom-[20%] left-1/2 -translate-x-1/2 text-center"
              style={{ opacity: textFinalOpacity }}
            >
              <p className="text-4xl md:text-6xl font-thin tracking-tight text-white mb-4">
                Completed.
              </p>
              <div className="h-[1px] w-24 bg-white mx-auto opacity-50"></div>
            </motion.div>

          </div>
        </div>
      </div>
    </LenisProvider>
  );
}
