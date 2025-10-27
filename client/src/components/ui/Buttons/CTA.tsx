import { ArrowRight, Play } from "lucide-react";

{
  /* CTA Buttons */
}
<div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
  <button className="group px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-lg transition-all hover:scale-105 flex items-center gap-2 shadow-2xl shadow-green-500/30">
    Start Free Trial
    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </button>

  <button className="group px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2">
    <Play className="w-5 h-5" />
    Watch Demo
  </button>
</div>;
