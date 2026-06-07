import React, { useState } from 'react';
import { runBB84Simulation, convertBitsToAESKey } from '../lib/bb84';
import { deriveAESKey } from '../lib/crypto';
import { SimulationResult } from '../types';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Props {
  onSimulationComplete: (key: string) => void;
}

export default function BB84Simulation({ onSimulationComplete }: Props) {
  const [numBits, setNumBits] = useState(20);
  const [eveEnabled, setEveEnabled] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    // Simulate delay for cool effect
    setTimeout(async () => {
      const res = runBB84Simulation(numBits, eveEnabled);
      setResult(res);
      
      let derivedKey = null;
      if (!res.eavesdropperDetected && res.aliceKey.length > 0) {
        const rawKey = convertBitsToAESKey(res.aliceKey);
        derivedKey = deriveAESKey(rawKey);
        onSimulationComplete(derivedKey);
      } else {
        onSimulationComplete('');
      }

      // Save to Supabase
      try {
        await supabase.from('simulation_sessions').insert([{
          bit_length: numBits,
          eve_present: eveEnabled,
          qber: res.qber,
          is_safe: !res.eavesdropperDetected,
          aes_key: derivedKey || null
        }]);
        window.dispatchEvent(new Event('history-updated'));
      } catch (err) {
        console.warn("Failed to write to database", err);
      }

      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full flex-grow">
      {/* Configuration Panel */}
      <div className="border border-emerald-900/50 bg-slate-900/50 p-4 flex flex-col">
        <h2 className="text-[10px] text-emerald-800 uppercase tracking-widest font-bold mb-4 font-mono">
          CẤU HÌNH HỆ THỐNG
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex flex-col gap-1 w-full md:w-48">
            <label className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest block">SỐ LƯỢNG BIT (PHOTON)</label>
            <input 
              type="number" 
              value={numBits} 
              onChange={(e) => setNumBits(Number(e.target.value))}
              min={10} max={100}
              className="bg-slate-950 border border-emerald-900/50 rounded-none p-2 text-emerald-400 font-mono outline-none focus:border-emerald-500 text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest block">TRẠNG THÁI NGHE LÉN (EVE)</label>
            <button 
              onClick={() => setEveEnabled(!eveEnabled)}
              className={cn(
                "w-full px-4 py-2 font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs",
                eveEnabled 
                  ? "bg-red-950/20 border border-red-900/50 text-red-500" 
                  : "border border-emerald-600 text-emerald-500 hover:bg-emerald-900/30"
              )}
            >
              {eveEnabled ? "ĐÃ BẬT NGHE LÉN (EVE)" : "EVE ĐANG TẮT"}
            </button>
          </div>
          
          <button 
            onClick={handleSimulate}
            disabled={isSimulating}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-2 uppercase tracking-wider transition-none disabled:opacity-50 h-[38px] text-xs flex-grow ml-auto mt-4 md:mt-0"
          >
            {isSimulating ? 'ĐANG MÔ PHỎNG...' : 'TẠO CHUỖI LƯỢNG TỬ MỚI'}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="flex flex-col gap-4 animate-in fade-in flex-grow">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Alice Side (Sifted) */}
            <div className="col-span-4 border border-emerald-900/50 bg-slate-900/50 p-4">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mb-1 block">KHÓA SÀNG LỌC CỦA ALICE</span>
              <p className="font-mono text-emerald-300 break-all text-sm">{result.aliceKey.join('') || 'N/A'}</p>
            </div>
            
            {/* Metadata Middle */}
            <div className="col-span-4 border border-emerald-900/50 bg-slate-900/80 p-4 flex flex-col justify-center items-center">
              <div className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold mb-2 text-center">TRẠNG THÁI TOÀN VẸN</div>
              {result.eavesdropperDetected ? (
                <div className="px-3 py-1 bg-red-950/30 border border-red-500/50 text-red-500 rounded text-xs font-bold animate-pulse text-center w-full mb-2">
                  PHÁT HIỆN LỖI (QBER: {(result.qber * 100).toFixed(1)}%)
                </div>
              ) : (
                <div className="px-3 py-1 bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 rounded text-xs font-bold text-center w-full mb-2">
                  AN TOÀN (QBER: {(result.qber * 100).toFixed(1)}%)
                </div>
              )}
              <div className="text-[10px] text-slate-400 pt-2 border-t border-emerald-900/30 w-full mt-2">
                <div className="flex justify-between"><span>QBER = 0%:</span> <span className="text-emerald-400 font-bold">Chắc chắn an toàn kể cả khi có Eve</span></div>
                <div className="flex justify-between mt-1"><span>0 &lt; QBER &lt; 11%:</span> <span className="text-emerald-500">An toàn</span></div>
                <div className="flex justify-between mt-1"><span>QBER &ge; 11%:</span> <span className="text-red-500">Có khả năng nghe lén</span></div>
              </div>
            </div>

            {/* Bob Side (Sifted) */}
            <div className="col-span-4 border border-emerald-900/50 bg-slate-900/50 p-4">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mb-1 block">KHÓA SÀNG LỌC CỦA BOB</span>
              <p className="font-mono text-emerald-300 break-all text-sm">{result.bobKey.join('') || 'N/A'}</p>
            </div>
          </div>

          {/* Setup the Table */}
          <div className="border border-emerald-900/50 bg-slate-900/80 p-4 overflow-y-auto block min-h-[300px]">
            <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mb-4">NHẬT KÝ ĐO LƯỜNG PHOTON</div>
            <table className="w-full text-xs text-left font-mono min-w-[600px]">
              <thead className="text-[10px] text-emerald-700 border-b border-emerald-900/50 uppercase">
                <tr>
                  <th className="py-2 text-center w-12">STT</th>
                  <th className="py-2 text-center text-emerald-500 font-normal">A:BIT</th>
                  <th className="py-2 text-center text-emerald-500 font-normal">A:CƠ SỞ</th>
                  <th className="py-2 text-center text-emerald-300 font-normal border-r border-emerald-900/30 w-16">PHOTON</th>
                  
                  {eveEnabled && (
                    <>
                      <th className="py-2 text-center text-red-500 font-normal">E:CƠ SỞ</th>
                      <th className="py-2 text-center text-red-500 font-normal">E:BIT</th>
                      <th className="py-2 text-center text-red-400 font-normal border-r border-emerald-900/30 w-16">PHOTON</th>
                    </>
                  )}
                  
                  <th className="py-2 text-center text-emerald-500 font-normal">B:CƠ SỞ</th>
                  <th className="py-2 text-center text-emerald-500 font-normal">B:BIT</th>
                  <th className="py-2 text-center border-l border-emerald-900/30">KẾT QUẢ</th>
                </tr>
              </thead>
              <tbody>
                {result.steps.map((step) => (
                  <tr key={step.index} className="border-b border-emerald-900/30 bg-slate-950">
                    <td className="py-2 text-center text-slate-500">{String(step.index).padStart(3, '0')}</td>
                    <td className="py-2 text-center text-emerald-400">{step.aliceBit}</td>
                    <td className="py-2 text-center text-emerald-400">{step.aliceBasis}</td>
                    <td className="py-2 text-center font-bold text-emerald-300 border-r border-emerald-900/30 text-base">
                      {step.alicePhoton}
                    </td>

                    {eveEnabled && (
                      <>
                        <td className="py-2 text-center text-red-400">{step.eveBasis}</td>
                        <td className="py-2 text-center text-red-400">{step.eveBit}</td>
                        <td className="py-2 text-center font-bold text-red-300 border-r border-emerald-900/30 text-base">
                          {step.evePhoton}
                        </td>
                      </>
                    )}

                    <td className="py-2 text-center text-emerald-400">{step.bobBasis}</td>
                    <td className="py-2 text-center text-emerald-400">{step.bobBit}</td>
                    
                    <td className="py-2 text-center border-l border-emerald-900/30 font-bold">
                      {!step.basisMatch ? (
                         <span className="text-slate-600 line-through">LOẠI BỎ</span>
                      ) : step.isError ? (
                         <span className="text-red-500 bg-red-950/30 px-2 block">LỖI_BIT</span>
                      ) : (
                         <span className="text-emerald-500 bg-emerald-900/30 px-2 block">HỢP LỆ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
