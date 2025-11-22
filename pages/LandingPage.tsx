import React, { useState } from 'react';
import { Logo } from '../constants';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [activeTab, setActiveTab] = useState<'managers' | 'tenants'>('managers');

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center space-x-2">
          <Logo className="h-10 w-10 text-indigo-500" />
          <span className="text-2xl font-bold tracking-tight">EstateFlow</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-indigo-400 transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
        </div>
        <button 
          onClick={onLoginClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-10 pb-20 lg:pt-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center space-x-2 bg-indigo-900/30 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>v2.0 Live: AI Smart Reports</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            The Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Real Estate</span> <br/>
            Management.
          </h1>
          
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            EstateFlow isn't just a dashboard. It's a complete digital ecosystem for modern property management. Automate rent, manage tenants, and visualize your portfolio in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLoginClick}
              className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-200"
            >
              Get Started
            </button>
            <button className="px-8 py-4 rounded-xl font-bold text-lg text-white border border-gray-700 hover:bg-white/5 transition-colors flex items-center justify-center group">
              Watch Demo
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="pt-8 border-t border-gray-800 flex items-center gap-8">
             <div>
               <p className="text-3xl font-bold text-white">500+</p>
               <p className="text-xs text-gray-500 uppercase tracking-widest">Properties</p>
             </div>
             <div>
               <p className="text-3xl font-bold text-white">₦2.5B</p>
               <p className="text-xs text-gray-500 uppercase tracking-widest">Managed</p>
             </div>
             <div>
               <p className="text-3xl font-bold text-white">99.9%</p>
               <p className="text-xs text-gray-500 uppercase tracking-widest">Uptime</p>
             </div>
          </div>
        </div>

        {/* 3D Visualization Area */}
        <div className="relative h-[500px] w-full flex items-center justify-center perspective-container">
            {/* This is a pure CSS 3D construction representing a digital building */}
            <div className="isometric-city">
                 {/* Base Platform */}
                 <div className="platform"></div>
                 
                 {/* Building Layers - Animated */}
                 <div className="building-stack">
                    <div className="floor floor-1">
                        <div className="face front"></div>
                        <div className="face back"></div>
                        <div className="face right"></div>
                        <div className="face left"></div>
                        <div className="face top"></div>
                    </div>
                    <div className="floor floor-2">
                         <div className="face front"></div>
                        <div className="face back"></div>
                        <div className="face right"></div>
                        <div className="face left"></div>
                        <div className="face top"></div>
                    </div>
                    <div className="floor floor-3">
                        <div className="face front"></div>
                        <div className="face back"></div>
                        <div className="face right"></div>
                        <div className="face left"></div>
                        <div className="face top"></div>
                    </div>
                    <div className="floor floor-4">
                        <div className="face front"></div>
                        <div className="face back"></div>
                        <div className="face right"></div>
                        <div className="face left"></div>
                        <div className="face top"></div>
                    </div>
                 </div>

                 {/* Floating Data Cards */}
                 <div className="floating-card card-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-mono text-green-400">Rent Paid: 100%</span>
                    </div>
                 </div>
                 <div className="floating-card card-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[8px] font-mono text-indigo-400">Occupancy: 95%</span>
                    </div>
                 </div>
            </div>
        </div>
      </main>

      {/* CSS Styles for 3D Animation - Injected here for the component */}
      <style>{`
        .perspective-container {
            perspective: 1200px;
            transform-style: preserve-3d;
        }

        .isometric-city {
            position: relative;
            width: 300px;
            height: 300px;
            transform: rotateX(60deg) rotateZ(-45deg);
            transform-style: preserve-3d;
            animation: rotateCity 20s infinite linear;
        }

        @keyframes rotateCity {
            0% { transform: rotateX(60deg) rotateZ(-45deg); }
            50% { transform: rotateX(60deg) rotateZ(-15deg); }
            100% { transform: rotateX(60deg) rotateZ(-45deg); }
        }

        .platform {
            position: absolute;
            width: 300px;
            height: 300px;
            background: rgba(17, 24, 39, 0.8);
            border: 2px solid #4f46e5;
            box-shadow: 0 0 30px rgba(79, 70, 229, 0.2), inset 0 0 50px rgba(79, 70, 229, 0.1);
            transform: translateZ(-20px);
        }

        .building-stack {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            transform-style: preserve-3d;
        }

        .floor {
            position: absolute;
            width: 100px;
            height: 100px;
            transform-style: preserve-3d;
        }

        .floor-1 { transform: translateZ(0px); animation: assemble 2s ease-out 0s forwards; opacity: 0; }
        .floor-2 { transform: translateZ(40px); animation: assemble 2s ease-out 0.2s forwards; opacity: 0; }
        .floor-3 { transform: translateZ(80px); animation: assemble 2s ease-out 0.4s forwards; opacity: 0; }
        .floor-4 { transform: translateZ(120px); animation: assemble 2s ease-out 0.6s forwards; opacity: 0; }

        @keyframes assemble {
            from { opacity: 0; transform: translateZ(300px); }
            to { opacity: 1; } /* transform is handled by specific classes, but opacity needs keyframes */
        }
        /* Fix for keyframes overriding transforms: we rely on the 'to' state keeping the specific class transforms if we only animate properties that don't conflict, or use specific keyframes per floor. 
           Simplification: Just animate opacity and a slight Z offset relative to final. 
        */
        @keyframes assemble {
             0% { opacity: 0; transform: translateZ(300px); }
             100% { opacity: 1; } /* transform returns to class definition */
        }

        .face {
            position: absolute;
            width: 100px;
            height: 100px;
            background: rgba(31, 41, 55, 0.9);
            border: 1px solid rgba(79, 70, 229, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 0 20px rgba(79, 70, 229, 0.2);
        }

        .front { transform: rotateY(0deg) translateZ(50px); }
        .back { transform: rotateY(180deg) translateZ(50px); }
        .right { transform: rotateY(90deg) translateZ(50px); }
        .left { transform: rotateY(-90deg) translateZ(50px); }
        .top { transform: rotateX(90deg) translateZ(50px); background: rgba(79, 70, 229, 0.3); }

        .floor-1 .face { height: 40px; top: 30px; }
        .floor-1 .top { transform: rotateX(90deg) translateZ(20px); }
        
        .floor-2 .face { height: 40px; top: 30px; }
        .floor-2 .top { transform: rotateX(90deg) translateZ(20px); }

        .floor-3 .face { height: 40px; top: 30px; }
        .floor-3 .top { transform: rotateX(90deg) translateZ(20px); }

        .floor-4 .face { height: 40px; top: 30px; }
        .floor-4 .top { transform: rotateX(90deg) translateZ(20px); }


        .floating-card {
            position: absolute;
            background: rgba(17, 24, 39, 0.9);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 8px 12px;
            border-radius: 8px;
            transform-style: preserve-3d;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
            white-space: nowrap;
        }

        .card-1 {
            transform: translateZ(150px) translateX(80px) rotateX(-90deg) rotateY(45deg);
            animation: float 4s ease-in-out infinite;
        }

        .card-2 {
             transform: translateZ(100px) translateX(-100px) rotateX(-90deg) rotateY(45deg);
             animation: float 4s ease-in-out infinite reverse;
        }

        @keyframes float {
            0%, 100% { margin-top: 0px; }
            50% { margin-top: -15px; }
        }

      `}</style>
    </div>
  );
};

export default LandingPage;