import React from 'react';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0f1d]">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1d] via-[#1a1635] to-[#0a0f1d]" />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes blob-bounce {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob-1 { animation: blob-bounce 25s infinite ease-in-out; }
                .animate-blob-2 { animation: blob-bounce 30s infinite ease-in-out reverse; }
                .animate-blob-3 { animation: blob-bounce 28s infinite ease-in-out 5s; }
                .animate-blob-4 { animation: blob-bounce 35s infinite ease-in-out 2s reverse; }
            `}} />

            {/* Optimized Blobs using CSS Animations */}
            <div
                className="absolute -top-[10%] -left-[10%] w-[45vw] h-[45vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-blob-1 will-change-transform"
            />
            <div
                className="absolute top-[20%] -right-[15%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-blob-2 will-change-transform"
            />
            <div
                className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] bg-pink-600/8 rounded-full blur-[90px] pointer-events-none animate-blob-3 will-change-transform"
            />
            <div
                className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none animate-blob-4 will-change-transform"
            />

            {/* Noise Texture for extra premium feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default AnimatedBackground;

