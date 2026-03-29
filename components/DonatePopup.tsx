
import React, { useState } from 'react';

interface DonatePopupProps {
  onUnlock: (code: string) => void;
}

const DonatePopup: React.FC<DonatePopupProps> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const CORRECT_CODE = "XLBOTF97";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === CORRECT_CODE) {
      onUnlock(code.trim());
    } else {
      alert("Sai mã rồi 😅 Nhập lại đi!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-bounceIn">
        <div className="text-6xl mb-4">🍦</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Bạn Cần Donate Để Tiếp Tục Sử Dụng
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          AI cũng cần "kem" để hoạt động bạn ơi! 😅 <br/>
          Hãy ủng hộ nhà phát hành một ly kem để mở khóa giới hạn nhé.
        </p>

        <div className="space-y-4">
          <a 
            href="http://zalo.me/0352700570" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200"
          >
            👉 Liên hệ để Donate (Zalo)
          </a>

          <form onSubmit={handleSubmit} className="pt-4 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
              Đã có mã? Nhập vào đây:
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã để tiếp tục..."
                className="flex-grow px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all font-mono"
              />
              <button 
                type="submit"
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
              >
                Mở khóa
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-tighter">
          QT Solutions - Master SEO AI v2.0
        </p>
      </div>
    </div>
  );
};

export default DonatePopup;
