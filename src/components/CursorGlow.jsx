import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CursorGlow = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                x: springX,
                y: springY,
                translateX: '-50%',
                translateY: '-50%',
            }}
            className="w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-[1] select-none"
        />
    );
};

export default CursorGlow;
