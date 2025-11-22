
import React, { useState } from 'react';
import { Logo } from '../constants';
import { LandingPageConfig } from '../types';
import Modal from '../components/Modal';

interface LandingPageProps {
  onLoginClick: () => void;
  config: LandingPageConfig;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, config }) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'refund' | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#030712]/80 backdrop-blur-md border-b border-white/10">
          <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo className="h-10 w-10 text-indigo-500" />
              <span className="text-2xl font-bold tracking-tight">EstateFlow</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-400">
              <button onClick={() => scrollToSection('about')} className="hover:text-indigo-400 transition-colors">About</button>
              <button onClick={() => scrollToSection('features')} className="hover:text-indigo-400 transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-400 transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-indigo-400 transition-colors">Contact</button>
            </div>
            <button 
              onClick={onLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
            >
              Login
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center space-x-2 bg-indigo-900/30 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>EstateFlow 2.0 is Live</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            {config.hero.title}
          </h1>
          
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            {config.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLoginClick}
              className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-200"
            >
              {config.hero.ctaText}
            </button>
            <button 
                onClick={() => scrollToSection('howitworks')} 
                className="px-8 py-4 rounded-xl font-bold text-lg text-white border border-gray-700 hover:bg-white/5 transition-colors flex items-center justify-center group"
            >
              How it Works
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 3D Visualization Area */}
        <div className="relative h-[500px] w-full flex items-center justify-center perspective-container">
            <div className="isometric-city">
                 <div className="platform"></div>
                 <div className="building-stack">
                    <div className="floor floor-1"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div></div>
                    <div className="floor floor-2"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div></div>
                    <div className="floor floor-3"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div></div>
                    <div className="floor floor-4"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div></div>
                 </div>
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
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-[#0b0f19] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                     <h2 className="text-3xl md:text-4xl font-bold text-white">{config.about.title}</h2>
                     <p className="text-gray-400 text-lg leading-relaxed">{config.about.description}</p>
                     <div className="flex gap-4">
                        <div className="p-4 bg-[#111827] rounded-lg border border-gray-800">
                            <h3 className="text-2xl font-bold text-indigo-400">500+</h3>
                            <p className="text-sm text-gray-500">Properties</p>
                        </div>
                        <div className="p-4 bg-[#111827] rounded-lg border border-gray-800">
                            <h3 className="text-2xl font-bold text-indigo-400">98%</h3>
                            <p className="text-sm text-gray-500">Satisfaction</p>
                        </div>
                     </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <img src={config.about.imageUrl} alt="About Us" className="relative rounded-2xl shadow-2xl border border-white/10" />
                </div>
            </div>
        </div>
      </section>

       {/* How It Works Section */}
       <section id="howitworks" className="py-20 bg-[#030712] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white">{config.howItWorks.title}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {config.howItWorks.steps.map((step, idx) => (
                    <div key={idx} className="relative p-8 bg-[#111827] rounded-2xl border border-gray-800 hover:border-indigo-500/50 transition-colors">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                            {idx + 1}
                        </div>
                        <h3 className="text-xl font-bold mt-4 mb-3">{step.title}</h3>
                        <p className="text-gray-400">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0b0f19] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{config.features.title}</h2>
                <p className="text-gray-400 text-lg">{config.features.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {config.features.items.map((feature, idx) => (
                    <div key={idx} className="p-6 bg-[#111827] rounded-xl border border-gray-800 hover:bg-[#1f2937] transition-colors group">
                        <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#030712] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{config.pricing.title}</h2>
                <p className="text-gray-400 text-lg">{config.pricing.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-start">
                {config.pricing.plans.map((plan, idx) => (
                    <div key={idx} className={`relative p-8 rounded-2xl border ${plan.highlighted ? 'bg-[#1e1b4b] border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.15)]' : 'bg-[#111827] border-gray-800'}`}>
                        {plan.highlighted && <div className="absolute top-0 right-0 bg-indigo-500 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>}
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-extrabold">{plan.price}</span>
                            <span className="text-gray-400">{plan.period}</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-center text-sm text-gray-300">
                                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <button onClick={onLoginClick} className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.highlighted ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                            Choose Plan
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#0b0f19] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">{config.testimonials.title}</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {config.testimonials.items.map((item, idx) => (
                    <div key={idx} className="p-8 bg-[#111827] rounded-2xl border border-gray-800 relative">
                        <svg className="absolute top-6 left-6 w-8 h-8 text-indigo-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                        <p className="text-gray-300 mb-6 italic pl-8">{item.comment}</p>
                        <div className="flex items-center gap-4">
                            <img src={item.avatarUrl} alt={item.name} className="w-12 h-12 rounded-full border-2 border-indigo-500" />
                            <div>
                                <h4 className="font-bold text-white">{item.name}</h4>
                                <p className="text-sm text-indigo-400">{item.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* Blog Section */}
      <section className="py-20 bg-[#030712] scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">{config.blog.title}</h2>
              <div className="grid md:grid-cols-2 gap-8">
                  {config.blog.posts.map((post, idx) => (
                      <div key={idx} className="bg-[#111827] rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all group cursor-pointer">
                          <div className="h-48 overflow-hidden">
                              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="p-6">
                              <div className="text-xs text-indigo-400 mb-2">{post.date}</div>
                              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{post.title}</h3>
                              <p className="text-gray-400 text-sm">{post.excerpt}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#0b0f19] scroll-mt-24">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">{config.faqs.title}</h2>
            <div className="space-y-4">
                {config.faqs.items.map((item, idx) => (
                    <details key={idx} className="group bg-[#111827] rounded-lg border border-gray-800 open:border-indigo-500/50 transition-all">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6">
                            <span>{item.question}</span>
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="text-gray-400 mt-0 p-6 pt-0">
                            {item.answer}
                        </div>
                    </details>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#02040a] pt-20 pb-10 border-t border-white/5 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2 mb-6">
                    <Logo className="h-8 w-8 text-indigo-500" />
                    <span className="text-xl font-bold">EstateFlow</span>
                  </div>
                  <p className="text-gray-400 mb-6 max-w-sm">
                      Revolutionizing property management with cutting-edge technology and user-centric design.
                  </p>
                  <div className="flex space-x-4">
                      {/* Social Icons Placeholder */}
                      <div className="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer">X</div>
                      <div className="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer">in</div>
                      <div className="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer">f</div>
                  </div>
              </div>
              <div>
                  <h4 className="font-bold text-white mb-6">Company</h4>
                  <ul className="space-y-3 text-gray-400 text-sm">
                      <li><button onClick={() => scrollToSection('about')} className="hover:text-indigo-400 text-left">About Us</button></li>
                      <li><button onClick={() => setActiveLegalModal('privacy')} className="hover:text-indigo-400 text-left">Privacy Policy</button></li>
                      <li><button onClick={() => setActiveLegalModal('terms')} className="hover:text-indigo-400 text-left">Terms of Service</button></li>
                      <li><button onClick={() => setActiveLegalModal('refund')} className="hover:text-indigo-400 text-left">Refund Policy</button></li>
                  </ul>
              </div>
              <div>
                  <h4 className="font-bold text-white mb-6">Contact</h4>
                  <ul className="space-y-3 text-gray-400 text-sm">
                      <li className="flex items-center"><span className="mr-2">📧</span> {config.contact.email}</li>
                      <li className="flex items-center"><span className="mr-2">📞</span> {config.contact.phone}</li>
                      <li className="flex items-center"><span className="mr-2">📍</span> {config.contact.address}</li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <p>© {new Date().getFullYear()} EstateFlow Inc. All rights reserved.</p>
              <p className="mt-2 md:mt-0">Developed by <span className="text-indigo-500 font-semibold">Jadan Technologies</span></p>
          </div>
      </footer>

      {/* Legal Modals */}
      <Modal isOpen={!!activeLegalModal} onClose={() => setActiveLegalModal(null)} title={activeLegalModal === 'privacy' ? 'Privacy Policy' : activeLegalModal === 'terms' ? 'Terms of Service' : 'Refund Policy'}>
          <div className="p-4 whitespace-pre-wrap text-gray-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
             {activeLegalModal === 'privacy' && config.legal.privacyPolicy}
             {activeLegalModal === 'terms' && config.legal.termsOfService}
             {activeLegalModal === 'refund' && config.legal.refundPolicy}
          </div>
          <div className="flex justify-end p-4 border-t border-white/10">
              <button onClick={() => setActiveLegalModal(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Close</button>
          </div>
      </Modal>

      {/* CSS Styles for 3D Animation */}
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
             0% { opacity: 0; transform: translateZ(300px); }
             100% { opacity: 1; }
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
