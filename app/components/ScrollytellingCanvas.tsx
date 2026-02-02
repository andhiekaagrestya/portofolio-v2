"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants, useSpring } from "framer-motion";
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

  // Main Path Drawing (Scroll Controlled) - Single continuous path
  const mainPathLength = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);



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
      pathLength: [0, 1, 0], // Only draw 70% to hint at the shape
      strokeDashoffset: [0, 0, 0], // Ensure offset doesn't interfere
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

  // --- Interactive Water Distortion ---
  // We use mouse coordinates to move a mask
  const mvX = useSpring(0, { stiffness: 600, damping: 45 });
  const mvY = useSpring(0, { stiffness: 600, damping: 45 });
  const radius = useSpring(0, { stiffness: 300, damping: 40 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = 1280 / rect.width;
    const scaleY = 832 / rect.height;

    mvX.set(x * scaleX);
    mvY.set(y * scaleY);
    radius.set(90);
  };

  const handleMouseLeave = () => {
    radius.set(0);
  };


  return (
    <LenisProvider>
      <div ref={containerRef} className="relative w-full h-[500vh] bg-[#0a0a0a] text-[#f5f5f5]">

        {/* Sticky Stage */}
        <div
          className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >

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
            className="relative z-10 w-full max-w-[5000px]"
            style={{ opacity: mainOpacity, scale: parallaxScale }}
            
          >
            <svg
              width="1280"
              height="832"
              viewBox="0 0 1280 832"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-2xl"
            >
              <defs>
                <filter
                  id="water-distortion"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                  filterUnits="userSpaceOnUse"
                >
                  {/* Directional water noise */}
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.004"
                    numOctaves="1"
                    seed="12"
                    result="noise"
                  >
                    <animate
                      attributeName="baseFrequency"
                      dur="7s"
                      values="0.003;0.0045;0.003"
                      repeatCount="indefinite"
                    />
                  </feTurbulence>

                  {/* Preserve energy */}
                  <feGaussianBlur
                    in="noise"
                    stdDeviation="2"
                    result="sharpNoise"
                  />

                  {/* STRONG lateral displacement */}
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="sharpNoise"
                    scale="500"
                    xChannelSelector="R"
                    yChannelSelector="B"
                  />
                </filter>

                {/* Mask that HIDES the clean line at cursor (Black spot on White bg) */}
                <mask id="mask-clean">
                  <rect width="1280" height="832" fill="white" />
                  <motion.circle cx={mvX} cy={mvY} r={radius} fill="black" filter="url(#blur-mask)" />
                </mask>

                {/* Mask that SHOWS the distorted line at cursor (White spot on Black bg) */}
                <mask id="mask-distort">
                  <rect width="1280" height="832" fill="black" />
                  <motion.circle cx={mvX} cy={mvY} r={radius} fill="white" filter="url(#blur-mask)" />
                </mask> 

                {/* Blur for the mask edges to blend smoothly */}
                <filter id="blur-mask">
                  <feGaussianBlur stdDeviation="15" />
                </filter>
              </defs>
              {/* 1. Distorted Path (Only visible at cursor) */}
              <motion.path
                d="M8 601.5C8 601.5 127.242 500.889 216 457.5C366.274 384.04 781.874 455.351 636 373.5C558.732 330.145 418 377.5 412 337.5C406 297.5 522.81 240.347 588 273.5C676.851 318.686 421.189 394.701 452 489.5C492.062 612.76 749.587 529.154 772 401.5C795.911 265.318 433 289.5 452 250C471 210.5 772 194 772 250C772 306 728 515 672 537.5C616 560 184.762 215.021 320 6.00002C443.89 -185.482 828.412 -209.176 904 6.00002C979.399 220.64 429 314.882 452 373.5C475 432.118 826.547 473.83 804 337.5C787.475 237.585 687.066 172.976 588 194C456.059 222.001 431.585 476.732 552 537.5C673.328 598.729 821.5 344 804 297.5C786.5 251 320 205.5 320 273.5C320 341.5 1357.98 163.877 1268 537.5C1234.92 674.854 1190.55 779.499 1060 833.5C836.446 925.968 781.5 347.5 616 401.5C450.5 455.5 468.687 279.044 504 194C544.296 96.9542 691.94 101.941 772 170C883.828 265.065 504 433.5 504 433.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                style={{ pathLength: mainPathLength }}
                filter="url(#water-distortion)"
                mask="url(#mask-distort)"
              />

              {/* <motion.path
                d="M8 601.5C8 601.5 127.242 500.889 216 457.5C366.274 384.04 781.874 455.351 636 373.5C558.732 330.145 418 377.5 412 337.5C406 297.5 522.81 240.347 588 273.5C676.851 318.686 421.189 394.701 452 489.5C492.062 612.76 749.587 529.154 772 401.5C795.911 265.318 433 289.5 452 250C471 210.5 772 194 772 250C772 306 728 515 672 537.5C616 560 184.762 215.021 320 6.00002C443.89 -185.482 828.412 -209.176 904 6.00002C979.399 220.64 429 314.882 452 373.5C475 432.118 826.547 473.83 804 337.5C787.475 237.585 687.066 172.976 588 194C456.059 222.001 431.585 476.732 552 537.5C673.328 598.729 821.5 344 804 297.5C786.5 251 320 205.5 320 273.5C320 341.5 1357.98 163.877 1268 537.5C1234.92 674.854 1190.55 779.499 1060 833.5C836.446 925.968 781.5 347.5 616 401.5C450.5 455.5 468.687 279.044 504 194C544.296 96.9542 691.94 101.941 772 170C883.828 265.065 504 433.5 504 433.5"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeOpacity="0.35"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ pathLength: mainPathLength }}
                filter="url(#water-distortion)"
                mask="url(#mask-distort)"
              /> */}


              {/* 2. Clean Path (Hidden at cursor) */}
              <motion.path
                d="M8 601.5C8 601.5 127.242 500.889 216 457.5C366.274 384.04 781.874 455.351 636 373.5C558.732 330.145 418 377.5 412 337.5C406 297.5 522.81 240.347 588 273.5C676.851 318.686 421.189 394.701 452 489.5C492.062 612.76 749.587 529.154 772 401.5C795.911 265.318 433 289.5 452 250C471 210.5 772 194 772 250C772 306 728 515 672 537.5C616 560 184.762 215.021 320 6.00002C443.89 -185.482 828.412 -209.176 904 6.00002C979.399 220.64 429 314.882 452 373.5C475 432.118 826.547 473.83 804 337.5C787.475 237.585 687.066 172.976 588 194C456.059 222.001 431.585 476.732 552 537.5C673.328 598.729 821.5 344 804 297.5C786.5 251 320 205.5 320 273.5C320 341.5 1357.98 163.877 1268 537.5C1234.92 674.854 1190.55 779.499 1060 833.5C836.446 925.968 781.5 347.5 616 401.5C450.5 455.5 468.687 279.044 504 194C544.296 96.9542 691.94 101.941 772 170C883.828 265.065 504 433.5 504 433.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                style={{ pathLength: mainPathLength }}
                mask="url(#mask-clean)"
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
    </LenisProvider >
  );
}
