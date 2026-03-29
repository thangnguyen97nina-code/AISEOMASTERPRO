
import React, { useState, useEffect, useRef } from 'react';
import { SEOResult, CMSProfile, QueueItem, AppStep } from '../types';
import { generateSEOContent } from '../services/geminiService';
import CMSConfigPanel from './CMSConfigPanel';
import ResultDisplay from './ResultDisplay';

interface SEOContentGeneratorProps {
  step: AppStep;
  setStep: (step: AppStep) => void;
  onStart: () => void;
  onComplete: () => void;
}

const SEOContentGenerator: React.FC<SEOContentGeneratorProps> = ({ 
  step,
  setStep,
  onStart,
  onComplete 
}) => {
  const [topicsText, setTopicsText] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<CMSProfile | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<SEOResult | null>(null);
  const processingRef = useRef(false);

  const startBatch = async (shouldPublish: boolean) => {
    const lines = topicsText.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    if (lines.length === 0) {
      alert("Vui lòng nhập ít nhất một tiêu đề bài viết.");
      return;
    }

    if (shouldPublish && !selectedProfile) {
      alert("Vui lòng chọn hoặc cấu hình website trước khi đăng bài tự động.");
      return;
    }

    const newQueue: QueueItem[] = lines.map((topic, index) => ({
      id: `${Date.now()}-${index}`,
      topic,
      status: 'waiting'
    }));

    setQueue(newQueue);
    setIsProcessing(true);
    setStep(AppStep.PROCESSING);
    onStart();
    
    processQueue(newQueue, shouldPublish);
  };

  const processQueue = async (items: QueueItem[], shouldPublish: boolean) => {
    if (processingRef.current) return;
    processingRef.current = true;

    const updatedQueue = [...items];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      
      // Update status to generating
      item.status = 'generating';
      setQueue([...updatedQueue]);

      try {
        if (!selectedProfile) throw new Error("No profile selected");

        // 1. Generate Content
        const result = await generateSEOContent(selectedProfile.businessInfo, item.topic);
        result.id = item.id;
        result.topic = item.topic;
        
        item.result = result;
        
        // 2. Publish if requested
        if (shouldPublish) {
          item.status = 'publishing';
          setQueue([...updatedQueue]);

          try {
            const publishResponse = await fetch("/api/publish-news", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                article: {
                  title: result.metadata.title,
                  content: result.htmlContent,
                  metaTitle: result.metadata.title,
                  metaDescription: result.metadata.description,
                  metaKeywords: result.metadata.keywords
                },
                config: selectedProfile.config
              })
            });
            
            const publishData = await publishResponse.json();
            item.result.publishStatus = publishData;
            
            if (publishData.success) {
              item.status = 'completed';
            } else {
              item.status = 'failed';
              item.error = publishData.error || "Lỗi đăng bài";
            }
          } catch (publishErr: any) {
            item.status = 'failed';
            item.error = "Lỗi kết nối server khi đăng bài";
          }
        } else {
          item.status = 'completed';
        }
      } catch (err: any) {
        console.error(err);
        item.status = 'failed';
        item.error = "Lỗi tạo nội dung AI";
      }

      setQueue([...updatedQueue]);
    }

    setIsProcessing(false);
    processingRef.current = false;
    onComplete();
  };

  const handleViewResult = (result: SEOResult) => {
    setCurrentResult(result);
  };

  const handleBackToInput = () => {
    setCurrentResult(null);
  };

  if (currentResult) {
    return (
      <ResultDisplay 
        result={currentResult} 
        onReset={() => setStep(AppStep.CONFIG)} 
        onContinue={handleBackToInput}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CMSConfigPanel onProfileChange={setSelectedProfile} />

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4">
            ✓ ĐÃ SẴN SÀNG {selectedProfile && `(WEBSITE: ${selectedProfile.name.toUpperCase()})`}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Nhập danh sách tiêu đề bài viết</h2>
          <p className="text-gray-500 mt-2 text-sm">Nhập mỗi tiêu đề trên một dòng. Hệ thống sẽ tự động viết và đăng bài theo thứ tự.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Danh sách tiêu đề (Mỗi dòng 1 tiêu đề) <span className="text-red-500">*</span></label>
            <textarea 
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              placeholder="VD:&#10;Cách độ màn hình Android cho Vinfast VF3&#10;Top 5 phụ kiện ô tô nên lắp năm 2026&#10;Kinh nghiệm bảo dưỡng xe mùa mưa"
              rows={6}
              disabled={isProcessing}
              className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-base font-medium resize-none"
            />
          </div>

          {!isProcessing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => startBatch(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Chỉ tạo bài viết (Batch)</span>
              </button>
              <button 
                onClick={() => startBatch(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Viết + Đăng website (Batch)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {queue.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-fadeIn">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Tiến độ xử lý ({queue.filter(i => i.status === 'completed').length}/{queue.length})
          </h3>
          
          <div className="space-y-3">
            {queue.map((item, idx) => (
              <div key={item.id} className={`p-4 rounded-xl border flex items-center justify-between ${
                item.status === 'generating' || item.status === 'publishing' ? 'bg-blue-50 border-blue-200' :
                item.status === 'completed' ? 'bg-green-50 border-green-200' :
                item.status === 'failed' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}.</span>
                  <div className="truncate">
                    <p className="font-bold text-gray-800 truncate">{item.topic}</p>
                    <p className="text-xs text-gray-500">
                      {item.status === 'waiting' && 'Đang chờ...'}
                      {item.status === 'generating' && 'AI đang viết bài...'}
                      {item.status === 'publishing' && 'Đang đăng lên CMS...'}
                      {item.status === 'completed' && 'Hoàn thành'}
                      {item.status === 'failed' && `Lỗi: ${item.error}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 shrink-0">
                  {(item.status === 'generating' || item.status === 'publishing') && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {item.status === 'completed' && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <button 
                        onClick={() => item.result && handleViewResult(item.result)}
                        className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-100 transition-all font-bold"
                      >
                        Xem bài
                      </button>
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOContentGenerator;
