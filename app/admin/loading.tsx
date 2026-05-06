export default function AdminLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* Outer Hexagon/Pulse Effect */}
        <div className="absolute h-24 w-24 rounded-full border border-zinc-800 animate-ping opacity-20"></div>
        <div className="absolute h-32 w-32 rounded-full border border-zinc-900 animate-pulse"></div>

        {/* The Core Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Main Ring */}
          <div className="h-16 w-16 animate-spin rounded-full border-2 border-zinc-800 border-t-emerald-500 duration-700"></div>
          
          {/* Inner Counter-Clockwise Ring */}
          <div className="absolute h-10 w-10 animate-[spin_1.5s_linear_infinite] rounded-full border border-zinc-800 border-b-blue-500 [animation-direction:reverse]"></div>
          
          {/* Center Point */}
          <div className="absolute h-1 w-1 bg-white rounded-full"></div>
        </div>

        {/* Status Text Block */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">
            Command Center
          </p>
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-zinc-800"></span>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
              Verifying Security Protocols
            </p>
            <span className="h-[1px] w-8 bg-zinc-800"></span>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <div className="flex flex-col gap-1">
          <div className="h-1 w-32 bg-zinc-900 overflow-hidden relative">
            {/* 
               Using a standard Tailwind animation if defined in your config, 
               or an arbitrary translate animation 
            */}
            <div className="absolute inset-0 bg-emerald-500/50 animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
          <p className="text-[8px] font-mono text-zinc-700 uppercase">System: Juggernaut_v2.06</p>
        </div>
      </div>
    </div>
  );
}