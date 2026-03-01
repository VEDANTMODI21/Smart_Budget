import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const Counter = ({ value, precision = 2, prefix = '', suffix = '', duration = 2, className = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: duration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (latest) => {
                setDisplayValue(latest);
            },
        });

        return () => controls.stop();
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}
            {displayValue.toLocaleString(undefined, {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
            })}
            {suffix}
        </span>
    );
};

export default Counter;
