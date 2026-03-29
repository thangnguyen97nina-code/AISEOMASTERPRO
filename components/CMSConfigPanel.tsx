import React, { useState, useEffect } from 'react';
import { CMSProfile, CMSConfig, BusinessInfo, SEOConfig, AIPromptConfig } from '../types';

interface CMSConfigPanelProps {
  onProfileChange: (profile: CMSProfile | null) => void;
}

const DEFAULT_CMS_CONFIG: CMSConfig = {
  cms_login_url: '',
  cms_username: '',
  cms_password: '',
  cms_news_list_url: '',
  cms_news_add_url: '',
};

const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  industry: '',
  specialty: '',
  companyName: '',
  address: '',
  phone: '',
  website: '',
  facebook: '',
  zalo: '',
};

const DEFAULT_SEO_CONFIG: SEOConfig = {
  mainKeywordGroup: '',
  writingTone: 'Chuyên nghiệp, tin cậy',
  ctaStyle: 'Kêu gọi hành động trực tiếp',
  authorStyle: 'Chuyên gia trong ngành',
};

const DEFAULT_AI_CONFIG: AIPromptConfig = {
  customInstruction: '',
};

const CMSConfigPanel: React.FC<CMSConfigPanelProps> = ({ onProfileChange }) => {
  const [profiles, setProfiles] = useState<CMSProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'cms' | 'business' | 'seo' | 'ai'>('cms');
  
  const [profileName, setProfileName] = useState('');
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(DEFAULT_CMS_CONFIG);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [seoConfig, setSeoConfig] = useState<SEOConfig>(DEFAULT_SEO_CONFIG);
  const [aiConfig, setAiConfig] = useState<AIPromptConfig>(DEFAULT_AI_CONFIG);

  // Load profiles from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('cms_profiles');
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(parsed);
        if (parsed.length > 0) {
          const firstProfile = parsed[0];
          setSelectedProfileId(firstProfile.id);
          loadProfileData(firstProfile);
          onProfileChange(firstProfile);
        }
      } catch (e) {
        console.error("Failed to parse profiles", e);
      }
    }
  }, []);

  const loadProfileData = (profile: CMSProfile) => {
    setProfileName(profile.name);
    setCmsConfig(profile.config || DEFAULT_CMS_CONFIG);
    setBusinessInfo(profile.businessInfo || DEFAULT_BUSINESS_INFO);
    setSeoConfig(profile.seoConfig || DEFAULT_SEO_CONFIG);
    setAiConfig(profile.aiPromptConfig || DEFAULT_AI_CONFIG);
  };

  const handleProfileSelect = (id: string) => {
    setSelectedProfileId(id);
    const profile = profiles.find(p => p.id === id) || null;
    if (profile) {
      loadProfileData(profile);
      onProfileChange(profile);
    } else {
      onProfileChange(null);
    }
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      alert('Vui lòng nhập tên website');
      return;
    }

    const newProfile: CMSProfile = {
      id: selectedProfileId || Date.now().toString(),
      name: profileName,
      config: cmsConfig,
      businessInfo,
      seoConfig,
      aiPromptConfig: aiConfig,
    };

    let updatedProfiles: CMSProfile[];
    if (selectedProfileId && profiles.some(p => p.id === selectedProfileId)) {
      updatedProfiles = profiles.map(p => p.id === selectedProfileId ? newProfile : p);
    } else {
      updatedProfiles = [...profiles, newProfile];
    }

    setProfiles(updatedProfiles);
    localStorage.setItem('cms_profiles', JSON.stringify(updatedProfiles));
    setSelectedProfileId(newProfile.id);
    onProfileChange(newProfile);
    setIsEditing(false);
    alert('Đã lưu cấu hình website thành công!');
  };

  const handleAddNew = () => {
    setSelectedProfileId('');
    setProfileName('');
    setCmsConfig(DEFAULT_CMS_CONFIG);
    setBusinessInfo(DEFAULT_BUSINESS_INFO);
    setSeoConfig(DEFAULT_SEO_CONFIG);
    setAiConfig(DEFAULT_AI_CONFIG);
    setIsEditing(true);
    setActiveTab('cms');
    onProfileChange(null);
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) {
      const updated = profiles.filter(p => p.id !== id);
      setProfiles(updated);
      localStorage.setItem('cms_profiles', JSON.stringify(updated));
      if (selectedProfileId === id) {
        setSelectedProfileId('');
        onProfileChange(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
      <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Cấu hình website
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
        >
          {isEditing ? 'Đóng' : (profiles.length > 0 ? 'Chỉnh sửa' : 'Thêm mới')}
        </button>
      </div>

      <div className="p-6">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <select 
                value={selectedProfileId}
                onChange={(e) => handleProfileSelect(e.target.value)}
                className="flex-grow px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              >
                <option value="">-- Chọn website profile --</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button 
                onClick={handleAddNew}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-all border border-green-200"
              >
                + Thêm
              </button>
            </div>
            {selectedProfileId && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="text-gray-500">Website:</span>
                  <span className="font-medium text-gray-800 truncate">{profiles.find(p => p.id === selectedProfileId)?.config?.cms_login_url || 'N/A'}</span>
                  <span className="text-gray-500">Lĩnh vực:</span>
                  <span className="font-medium text-gray-800">{profiles.find(p => p.id === selectedProfileId)?.businessInfo?.industry || 'N/A'}</span>
                  <span className="text-gray-500">Tài khoản:</span>
                  <span className="font-medium text-gray-800">{profiles.find(p => p.id === selectedProfileId)?.config?.cms_username || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tên Profile Website</label>
              <input 
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="VD: Website Bất Động Sản A"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none font-medium"
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('cms')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'cms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                CMS Config
              </button>
              <button 
                onClick={() => setActiveTab('business')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'business' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Business Info
              </button>
              <button 
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'seo' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                SEO Config
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'ai' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                AI Prompt
              </button>
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'cms' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Link đăng nhập quản trị</label>
                    <input 
                      type="text"
                      value={cmsConfig.cms_login_url}
                      onChange={(e) => setCmsConfig({...cmsConfig, cms_login_url: e.target.value})}
                      placeholder="https://domain.com/admin/user/login"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Link tạo bài viết mới</label>
                    <input 
                      type="text"
                      value={cmsConfig.cms_news_add_url}
                      onChange={(e) => setCmsConfig({...cmsConfig, cms_news_add_url: e.target.value})}
                      placeholder="https://domain.com/admin/news/add/tin-tuc"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Tài khoản quản trị</label>
                    <input 
                      type="text"
                      value={cmsConfig.cms_username}
                      onChange={(e) => setCmsConfig({...cmsConfig, cms_username: e.target.value})}
                      placeholder="Username"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Mật khẩu quản trị</label>
                    <input 
                      type="password"
                      value={cmsConfig.cms_password}
                      onChange={(e) => setCmsConfig({...cmsConfig, cms_password: e.target.value})}
                      placeholder="Password"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Link danh sách tin tức</label>
                    <input 
                      type="text"
                      value={cmsConfig.cms_news_list_url}
                      onChange={(e) => setCmsConfig({...cmsConfig, cms_news_list_url: e.target.value})}
                      placeholder="https://domain.com/admin/news/man/tin-tuc"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Lĩnh vực kinh doanh</label>
                    <input 
                      type="text"
                      value={businessInfo.industry}
                      onChange={(e) => setBusinessInfo({...businessInfo, industry: e.target.value})}
                      placeholder="VD: Bất động sản, Spa, Garage..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Tên công ty/thương hiệu</label>
                    <input 
                      type="text"
                      value={businessInfo.companyName}
                      onChange={(e) => setBusinessInfo({...businessInfo, companyName: e.target.value})}
                      placeholder="VD: Công ty TNHH QT Solution"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ</label>
                    <input 
                      type="text"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                      placeholder="Số 123, Đường ABC..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại</label>
                    <input 
                      type="text"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                      placeholder="090x xxx xxx"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Zalo</label>
                    <input 
                      type="text"
                      value={businessInfo.zalo}
                      onChange={(e) => setBusinessInfo({...businessInfo, zalo: e.target.value})}
                      placeholder="Link Zalo hoặc SĐT"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
                    <input 
                      type="text"
                      value={businessInfo.website}
                      onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
                      placeholder="https://domain.com"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Facebook Fanpage</label>
                    <input 
                      type="text"
                      value={businessInfo.facebook}
                      onChange={(e) => setBusinessInfo({...businessInfo, facebook: e.target.value})}
                      placeholder="https://facebook.com/page"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nhóm từ khóa chính</label>
                    <input 
                      type="text"
                      value={seoConfig.mainKeywordGroup}
                      onChange={(e) => setSeoConfig({...seoConfig, mainKeywordGroup: e.target.value})}
                      placeholder="VD: sửa xe ô tô, spa trị mụn..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Giọng văn viết bài</label>
                    <select 
                      value={seoConfig.writingTone}
                      onChange={(e) => setSeoConfig({...seoConfig, writingTone: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    >
                      <option value="Chuyên nghiệp, tin cậy">Chuyên nghiệp, tin cậy</option>
                      <option value="Thân thiện, gần gũi">Thân thiện, gần gũi</option>
                      <option value="Hào hứng, thuyết phục">Hào hứng, thuyết phục</option>
                      <option value="Kỹ thuật, chi tiết">Kỹ thuật, chi tiết</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phong cách CTA</label>
                    <select 
                      value={seoConfig.ctaStyle}
                      onChange={(e) => setSeoConfig({...seoConfig, ctaStyle: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    >
                      <option value="Kêu gọi hành động trực tiếp">Kêu gọi hành động trực tiếp</option>
                      <option value="Tư vấn miễn phí">Tư vấn miễn phí</option>
                      <option value="Ưu đãi giới hạn">Ưu đãi giới hạn</option>
                      <option value="Để lại thông tin">Để lại thông tin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phong cách tác giả mặc định</label>
                    <input 
                      type="text"
                      value={seoConfig.authorStyle}
                      onChange={(e) => setSeoConfig({...seoConfig, authorStyle: e.target.value})}
                      placeholder="VD: Chuyên gia kỹ thuật, Đội ngũ biên tập..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Chỉ dẫn AI tùy chỉnh (Prompt)</label>
                    <textarea 
                      value={aiConfig.customInstruction}
                      onChange={(e) => setAiConfig({...aiConfig, customInstruction: e.target.value})}
                      placeholder="VD: Tập trung vào các thuật ngữ chuyên ngành ô tô. Luôn nhấn mạnh vào sự an toàn và bảo hành..."
                      rows={8}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-none"
                    />
                    <p className="text-[10px] text-gray-400 italic">Chỉ dẫn này sẽ được gửi kèm cho AI khi viết bài cho website này.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button 
                onClick={handleSaveProfile}
                className="flex-grow bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                Lưu Profile Website
              </button>
              {selectedProfileId && (
                <button 
                  onClick={() => handleDeleteProfile(selectedProfileId)}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-200"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSConfigPanel;
