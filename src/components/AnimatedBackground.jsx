import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-900">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-80" />

            {/* Animated Blobs - Optimized for performance */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{ willChange: "transform, opacity" }}
                className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-purple-600 rounded-full filter blur-[120px] opacity-20 pointer-events-none"
            />

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.35, 0.15],
                    x: [0, -50, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 2
                }}
                style={{ willChange: "transform, opacity" }}
                className="absolute top-1/4 -right-20 w-[700px] h-[700px] bg-blue-600 rounded-full filter blur-[120px] opacity-20 pointer-events-none"
            />

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 30, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 5
                }}
                style={{ willChange: "transform, opacity" }}
                className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-pink-600 rounded-full filter blur-[120px] opacity-20 pointer-events-none"
            />

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.35, 0.15],
                    x: [0, -30, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 8
                }}
                style={{ willChange: "transform, opacity" }}
                className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full filter blur-[120px] opacity-20 pointer-events-none"
            />
        </div>
    );
};

export default AnimatedBackground;
