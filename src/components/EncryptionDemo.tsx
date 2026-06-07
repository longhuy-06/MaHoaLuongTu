import React, { useState } from 'react';
import { encryptMessage, decryptMessage } from '../lib/crypto';
import { Lock, Unlock, Key, ArrowRight } from 'lucide-react';

interface Props {
  aesKey: string;
}

export default function EncryptionDemo({ aesKey }: Props) {
  const [plaintext, setPlaintext] = useState('BẢN TIN MẬT: Cuộc gọi sẽ diễn ra vào lúc 00:00.');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  const handleEncrypt = () => {
    if (!aesKey) {
      alert("No secure key available! Please run simulation without Eve.");
      return;
    }
    const cipher = encryptMessage(plaintext, aesKey);
    setCiphertext(cipher);
    setDecryptedText(''); // Reset on new encryption
  };

  const handleDecrypt = () => {
    if (!aesKey) return;
    const plain = decryptMessage(ciphertext, aesKey);
    setDecryptedText(plain);
  };

  if (!aesKey) {
    return (
      <div className="border border-emerald-900/50 border-dashed bg-slate-900/50 p-12 text-center text-emerald-700 font-mono flex flex-col items-center justify-center mx-auto">
        <Key className="w-12 h-12 mb-4 opacity-50 text-emerald-800" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">HỆ THỐNG BỊ HẠN CHẾ: CHƯA CÓ KHÓA BẢO MẬT</h3>
        <p className="text-xs">Vui lòng chạy chuỗi Phân phối khóa lượng tử thành công (không có Eve) để thiết lập phiên AES.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <div className="border border-emerald-900/50 bg-slate-900/50 rounded-lg p-6 flex flex-col">
        
        <h2 className="text-xl font-bold text-emerald-500 mb-6 flex items-center gap-2 uppercase tracking-tighter">
          <Key className="w-6 h-6" />
          ỨNG DỤNG MÃ HÓA AES-256
        </h2>

        <div className="mb-6">
          <label className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest block mb-1">KHÓA BÍ MẬT CHUNG SHA-256 (TỪ LƯỢNG TỬ)</label>
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-3 rounded text-sm font-bold text-emerald-300 break-all">
            {aesKey}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Encryption Side */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] opacity-80 font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-700 mb-1">
              TIN NHẮN CẦN MÃ HÓA
            </h3>
            <textarea 
              value={plaintext}
              onChange={e => setPlaintext(e.target.value)}
              className="bg-slate-950 border border-emerald-900/50 rounded-none p-3 text-emerald-400 font-mono text-sm h-32 focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="Nhập nội dung bảo mật..."
            />
            <button 
              onClick={handleEncrypt}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 px-4 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors mt-2"
            >
              MÃ HÓA
            </button>
          </div>

          <ArrowRight className="text-emerald-900 hidden md:block mx-2" size={32} />

          {/* Decryption Side */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] opacity-80 font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-700 mb-1">
               BẢN MÃ (CIPHERTEXT)
            </h3>
            <textarea 
              value={ciphertext}
              readOnly
              className="bg-slate-950 border border-emerald-900/30 p-3 text-slate-500 font-mono text-[10px] h-32 outline-none resize-none break-all"
              placeholder="Bản mã sẽ hiển thị tại đây..."
            />
            <button 
              onClick={handleDecrypt}
              disabled={!ciphertext}
              className="border border-emerald-600 text-emerald-500 hover:bg-emerald-900/30 font-bold py-2 px-4 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent mt-2"
            >
              GIẢI MÃ
            </button>
          </div>
        </div>

        {decryptedText && (
          <div className="mt-6 pt-6 border-t border-emerald-900/50 animate-in fade-in slide-in-from-top-4">
            <label className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest block mb-1">KẾT QUẢ GIẢI MÃ (PLAINTEXT)</label>
            <div className="bg-slate-950 border border-emerald-900/30 p-4 text-emerald-400 font-mono text-sm break-all">
              {decryptedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
