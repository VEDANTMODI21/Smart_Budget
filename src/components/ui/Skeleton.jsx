import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }}
            className={`bg-white/10 rounded-xl ${className}`}
        />
    );
};

export default Skeleton;
