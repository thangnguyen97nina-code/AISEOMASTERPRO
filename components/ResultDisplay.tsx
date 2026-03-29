
import React, { useState, useEffect } from 'react';
import { SEOResult } from '../types';

interface ResultDisplayProps {
  result: SEOResult;
  onReset: () => void;
  onContinue: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset, onContinue }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'metadata'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Publish Status Banner */}
      {result.publishStatus && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border flex items-center space-x-4 ${result.publishStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.publishStatus.success ? 'bg-green-200' : 'bg-red-200'}`}>
              {result.publishStatus.success ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold">{result.publishStatus.success ? "HOÀN THÀNH" : "ĐĂNG BÀI THẤT BẠI"}</p>
              <p className="text-sm opacity-90">{result.publishStatus.message || result.publishStatus.error}</p>
            </div>
          </div>

          {result.publishStatus.logs && result.publishStatus.logs.length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Nhật ký đăng bài (Publishing Log)
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {result.publishStatus.logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-gray-600">[{index + 1}]</span>
                    <span className={log.startsWith('Lỗi') ? 'text-red-400' : (log.startsWith('Cảnh báo') ? 'text-yellow-400' : 'text-green-400')}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="border-b px-4 py-2 bg-gray-50 flex flex-wrap gap-2 sticky top-0 z-10">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Xem trước
          </button>
          <button 
            onClick={() => setActiveTab('html')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'html' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Mã HTML
          </button>
          <button 
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'metadata' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            SEO Metadata
          </button>
          
          <div className="ml-auto flex items-center">
             <button 
              onClick={() => handleCopy(activeTab === 'html' ? result.htmlContent : (activeTab === 'metadata' ? `Title: ${result.metadata.title}\nDescription: ${result.metadata.description}\nKeywords: ${result.metadata.keywords}` : result.htmlContent))}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
            >
              {copied ? '✓ Đã chép' : '⧉ Sao chép'}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto bg-white min-h-[400px]">
          {activeTab === 'preview' && (
            <div className="max-w-none bg-white text-gray-900">
              {result.htmlContent ? (
                <div 
                  className="content-preview"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                  dangerouslySetInnerHTML={{ __html: result.htmlContent }} 
                />
              ) : (
                <div className="flex items-center justify-center py-20 text-gray-400 italic">
                  Không có nội dung để hiển thị.
                </div>
              )}
            </div>
          )}

          {activeTab === 'html' && (
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl text-sm font-mono whitespace-pre-wrap break-all overflow-x-auto">
              {result.htmlContent || "Chưa có mã HTML."}
            </pre>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">SEO Title</h3>
                <p className="text-gray-800 font-semibold text-lg">{result.metadata.title}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">SEO Description</h3>
                <p className="text-gray-700 leading-relaxed">{result.metadata.description}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">SEO Keywords</h3>
                <p className="text-gray-700">{result.metadata.keywords}</p>
              </div>
              {result.metadata.title === 'N/A' && (
                <p className="text-xs text-amber-600 italic">Lưu ý: Metadata có thể không hiển thị nếu AI bị ngắt quãng do quá giới hạn nội dung.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onReset}
            className="flex-1 md:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
          >
            ← Viết bài mới
          </button>
          <button 
            onClick={onContinue}
            className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100"
          >
            TIẾP TỤC
          </button>
        </div>
        <p className="text-sm text-gray-400 italic text-center md:text-right">
          Gợi ý: Nếu nội dung bị ngắt quãng, bạn có thể thử yêu cầu bài viết ngắn hơn một chút.
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;
