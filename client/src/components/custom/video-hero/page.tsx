import React, { useEffect, useState } from "react";

export default function VideoHeroSection() {
  const [particles, setParticles] = useState<
    Array<{
      left: string;
      top: string;
      duration: string;
      delay: string;
    }>
  >([]);

  useEffect(() => {
    // Client-side only particle generation
    const generatedParticles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${5 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full bg-white">
        {/* Vimeo Background Video */}
        <iframe
          src="https://player.vimeo.com/video/1128780230?background=1&autoplay=1&loop=1&muted=1&autopause=0&quality=1080p"
          className="absolute inset-0 w-full h-full object-cover"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />

        {/* Dark Overlay for better text readability */}
        <div className="relative inset-0 bg-white/50 backdrop-blur-[8px]" />

        {/* Gradient Overlay */}
        <div className="relative inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-8 px-4 py-2 mb-40 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-white/90">
              Now Live - Automotive Marketplace
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight animate-pulse">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Automotive Commerce
            </span>
          </h1>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-sm text-white/60">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
              <div className="w-1.5 h-3 bg-white/60 rounded-full mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Animated Particles (Client-side only) */}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                animation: `float ${particle.duration} ease-in-out infinite`,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
