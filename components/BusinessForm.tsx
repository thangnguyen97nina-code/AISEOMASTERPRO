
import React, { useState } from 'react';
import { BusinessInfo } from '../types';

interface BusinessFormProps {
  onSubmit: (info: BusinessInfo) => void;
}

const BusinessForm: React.FC<BusinessFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<BusinessInfo>({
    industry: '',
    specialty: '',
    companyName: '',
    address: '',
    phone: '',
    website: '',
    facebook: '',
    zalo: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.industry || !formData.specialty || !formData.address || !formData.companyName || !formData.phone) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Thiết lập hồ sơ doanh nghiệp</h2>
        <p className="text-gray-500 mt-2">Cung cấp thông tin để AI học về doanh nghiệp của bạn trước khi viết bài.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Tên công ty / Thương hiệu <span className="text-red-500">*</span></label>
            <input 
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="VD: QT Solutions, Garage ABC..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Số điện thoại <span className="text-red-500">*</span></label>
            <input 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="VD: 090x xxx xxx"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Lĩnh vực / Ngành nghề <span className="text-red-500">*</span></label>
            <input 
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="VD: Độ xe ô tô, Spa, Bất động sản..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Chuyên môn đặc biệt <span className="text-red-500">*</span></label>
            <input 
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              placeholder="VD: Nâng cấp xe Vinfast, Trị mụn tận gốc..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Địa chỉ <span className="text-red-500">*</span></label>
          <input 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Số nhà, Tên đường, Quận/Huyện, Thành phố..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Website</label>
            <input 
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Facebook</label>
            <input 
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Link fanpage..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Zalo</label>
            <input 
              name="zalo"
              value={formData.zalo}
              onChange={handleChange}
              placeholder="Số điện thoại Zalo..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1"
        >
          Tiếp tục: Nhập từ khóa SEO
        </button>
      </form>
    </div>
  );
};

export default BusinessForm;
