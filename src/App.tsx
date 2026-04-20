import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { 
  QUESTIONS, OPTIONS, PROFILES, LETTER_RULES, generateArtworkDataUri 
} from './data';
import { Copy, CheckCircle2 } from 'lucide-react';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default function App() {
  const [view, setView] = useState<'welcome' | 'quiz' | 'result'>('welcome');
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, currentIndex]);

  const handleStart = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrentIndex(0);
    setView('quiz');
  };

  const handleSelect = (val: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = val;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        finishQuiz(newAnswers);
      }
    }, 350);
  };

  const finishQuiz = async (finalAnswers: (number | null)[]) => {
    const scores = { IR: 0, DA: 0, MS: 0, PC: 0 };
    QUESTIONS.forEach((q, idx) => {
      const val = finalAnswers[idx] || 0;
      scores[q.dimension as keyof typeof scores] += val;
    });

    const code = [
      scores.IR > 0 ? LETTER_RULES.IR[0] : LETTER_RULES.IR[1],
      scores.DA > 0 ? LETTER_RULES.DA[0] : LETTER_RULES.DA[1],
      scores.MS > 0 ? LETTER_RULES.MS[0] : LETTER_RULES.MS[1],
      scores.PC > 0 ? LETTER_RULES.PC[0] : LETTER_RULES.PC[1]
    ].join('');

    setResultCode(code);
    setView('result');

    if (!supabase) return;

    try {
      const profileInfo = PROFILES[code as keyof typeof PROFILES];
      await supabase.from('quiz_results').insert({
        app_name: 'Y-MAP',
        result_code: code,
        result_title: profileInfo?.title,
        answers: finalAnswers,
        source: 'web',
        user_agent: navigator.userAgent,
        completed: true
      });
    } catch (e) {}
  };

  const handleCopy = async () => {
    if (!resultCode) return;
    const profile = PROFILES[resultCode];
    const text = `Y-MAP 测试结果：${resultCode}\n${profile.title}\n\n内心侧写：${profile.portrait}\n\n时代回音：${profile.echo}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(e) {}
  };

  const currentQ = QUESTIONS[currentIndex];
  // Calculate progress for the minimal warm bar
  const percent = Math.round(((answers.filter(a => a !== null).length) / QUESTIONS.length) * 100);

  return (
    <div className="relative min-h-screen text-stone-800 overflow-hidden font-sans pb-24">
      {/* Background paper texture & warm gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 paper-noise opacity-60" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-[#FAF8F5]/80 via-transparent to-[#ECE7DC]/60" />

      <main className="relative z-10 w-full max-w-5xl mx-auto px-5 py-10 md:py-20">
        <AnimatePresence mode="wait">
          
          {/* ---- Welcome View ---- */}
          {view === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <div className="editorial-panel rounded-3xl p-10 md:p-20 relative overflow-hidden">
                {/* Decorative classic line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="text-stone-400 text-xs tracking-[0.3em] font-medium uppercase mb-8 border-b border-stone-200 pb-3 inline-block">
                    Youth Mission & Attitude Profile
                  </div>
                  <h1 className="font-serif text-5xl md:text-6xl lg:text-[5rem] text-stone-900 leading-[1.1] mb-8 font-black">
                    青年志向罗盘
                  </h1>
                  <p className="font-serif text-xl md:text-2xl text-stone-600 italic mb-10">
                    “在拥挤与失速之间，找寻前行的锚点。”
                  </p>
                  <p className="text-stone-500/90 text-[15px] md:text-base leading-[2] max-w-2xl font-light mb-14">
                    这是一份关于当代大学生人生驱动力、行动风格与生存策略的交互画像测试。它不评价“谁更优秀”，只试图用如实的人文刻度，帮你看见：你究竟为何前行，又会以什么样的姿态，抵达想去的地方。
                  </p>
                  
                  <button 
                    onClick={handleStart} 
                    className="group border border-stone-800 bg-stone-900 text-[#F4F1EB] rounded-full px-12 py-4 text-base font-medium tracking-[0.15em] hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
                  >
                    开始阅读自己
                  </button>
                  <p className="mt-6 text-stone-400 text-xs font-light">共 16 题情境，凭第一直觉作答即可。</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ---- Quiz View ---- */}
          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}>
              <div className="editorial-panel rounded-3xl p-8 md:p-14 relative flex flex-col min-h-[70vh]">
                
                <div className="mb-10">
                  <div className="flex justify-between items-end border-b border-stone-200 pb-4 mb-4">
                    <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">
                      Question {String(currentIndex + 1).padStart(2, '0')} <span className="font-normal text-stone-300 mx-1">/</span> {QUESTIONS.length}
                    </span>
                    <span className="font-serif text-lg text-stone-800 italic">{percent}%</span>
                  </div>
                </div>
                
                <h2 className="font-serif text-[1.65rem] md:text-3xl text-stone-900 leading-[1.6] mb-14 max-w-4xl tracking-wide font-medium">
                  {currentQ.text}
                </h2>

                {/* Card Container */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-10 mb-14 relative flex-grow">
                  <div className="p-8 pb-12 rounded-2xl bg-[#FDFDFB] border border-stone-200 relative group shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[10px] font-bold tracking-[0.25em] text-stone-400 mb-6 uppercase border-b border-stone-100 pb-2 inline-block">Option A</div>
                    <p className="text-stone-700 leading-[2.2] text-[15px] md:text-[17px] font-sans font-light">
                      {currentQ.a}
                    </p>
                  </div>
                  
                  <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-400 z-10 shadow-sm font-serif italic text-sm">
                    vs
                  </div>

                  <div className="p-8 pb-12 rounded-2xl bg-[#FDFDFB] border border-stone-200 relative group shadow-sm hover:shadow-md transition-shadow">
                     <div className="text-[10px] font-bold tracking-[0.25em] text-stone-400 mb-6 uppercase border-b border-stone-100 pb-2 inline-block">Option B</div>
                    <p className="text-stone-700 leading-[2.2] text-[15px] md:text-[17px] font-sans font-light">
                      {currentQ.b}
                    </p>
                  </div>
                </div>
                
                {/* Options Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-auto">
                  {OPTIONS.map(opt => {
                    const isSelected = answers[currentIndex] === opt.value;
                    return (
                      <button 
                        key={opt.value} 
                        onClick={() => handleSelect(opt.value)}
                        className={`text-left sm:text-center p-5 rounded-xl border transition-all duration-300 flex flex-col items-start sm:items-center justify-center ${
                          isSelected 
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xl scale-[1.02]' 
                            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-[#FAF9F6] text-stone-700'
                        }`}
                      >
                        <div className={`text-[15px] font-medium mb-1.5 ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                          {opt.label}
                        </div>
                        <div className={`text-[12px] leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {opt.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ---- Result View ---- */}
          {view === 'result' && resultCode && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <div className="editorial-panel rounded-[2rem] overflow-hidden flex flex-col lg:flex-row">
                
                {/* Visual Art Side treated like an art gallery frame */}
                <div className="w-full lg:w-5/12 bg-white p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col items-center justify-center relative">
                   <div className="absolute top-6 left-6 text-stone-300 font-serif italic text-xs tracking-widest">
                     Visual Portrait
                   </div>
                   {/* The generated dark artwork creates a stunning high-contrast "museam piece" feel against the white background */}
                   <div className="bg-white p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] rounded-2xl relative mt-8">
                     <img 
                       src={generateArtworkDataUri(resultCode)} 
                       alt="Artwork" 
                       className="w-full max-w-sm rounded-xl transform transition-transform hover:scale-[1.03] duration-1000 object-cover" 
                     />
                   </div>
                </div>
                
                {/* Content Side */}
                <div className="w-full lg:w-7/12 p-8 md:p-14 lg:p-20 flex flex-col justify-center relative bg-[#FAF9F6]">
                  <div className="inline-flex items-center text-stone-400 text-sm tracking-[0.3em] font-mono mb-8 self-start border border-stone-200 px-4 py-1.5 rounded-full bg-white shadow-sm">
                    {resultCode}
                  </div>
                  
                  <h2 className="font-serif font-black text-4xl md:text-5xl lg:text-[3.5rem] text-stone-900 leading-tight mb-8">
                    {PROFILES[resultCode].title}
                  </h2>
                  
                  <p className="text-stone-600 leading-[2.2] text-[15px] md:text-[17px] mb-12 font-sans font-light">
                    {PROFILES[resultCode].portrait}
                  </p>
                  
                  <div className="pl-6 border-l-2 border-stone-300 mb-14 relative">
                    <div className="text-[10px] font-bold tracking-[0.25em] text-stone-400 mb-3 uppercase">时代的注脚</div>
                    <p className="text-stone-800 leading-[1.8] font-serif text-xl md:text-2xl italic tracking-wide">
                      “{PROFILES[resultCode].echo}”
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <button 
                      onClick={handleCopy} 
                      className="flex-1 flex items-center justify-center px-8 py-4 bg-stone-900 border border-stone-800 text-white rounded-full font-medium tracking-widest text-[#F4F1EB] hover:bg-stone-800 active:scale-95 transition-all shadow-lg shadow-stone-900/10"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} 
                      {copied ? '已收藏在剪贴板' : '复制结果'}
                    </button>
                    <button 
                      onClick={handleStart} 
                      className="flex-1 flex items-center justify-center px-8 py-4 bg-white border border-stone-300 text-stone-700 rounded-full font-medium tracking-widest hover:bg-stone-50 active:scale-95 transition-all shadow-sm"
                    >
                      重新翻阅
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
