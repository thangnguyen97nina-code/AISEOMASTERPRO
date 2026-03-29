
import { GoogleGenAI } from "@google/genai";
import { BusinessInfo, SEOResult } from "../types";

export const generateSEOContent = async (
  business: BusinessInfo,
  topic: string
): Promise<SEOResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const systemInstruction = `Bạn là một chuyên gia Marketing và Chuyên gia SEO Google số 1 tại Việt Nam.
Nhiệm vụ: Viết bài Content chuẩn SEO chuyên sâu, giải quyết triệt để nỗi lo khách hàng.
Văn phong: Chuyên nghiệp, súc tích, font Verdana, size 16px, line-height 1.5.

Thông tin doanh nghiệp:
- Tên công ty: ${business.companyName || 'N/A'}
- Ngành nghề: ${business.industry}
- Chuyên môn: ${business.specialty}
- Địa chỉ: ${business.address}
- Điện thoại: ${business.phone || 'N/A'}
- Website: ${business.website}
- Facebook: ${business.facebook}
- Zalo: ${business.zalo}

YÊU CẦU TRÌNH BÀY HTML (CỰC KỲ QUAN TRỌNG):
1. Tiêu đề chính H2 căn giữa: <h2 style="text-align: center;"><span style="color:#e74c3c;"><span style="font-size:18px;"><span style="line-height:1.5;"><span style="font-family:Verdana,Geneva,sans-serif;"><strong>[TIÊU ĐỀ]</strong></span></span></span></span></h2>
2. Toàn bộ các đoạn văn bản P PHẢI bọc trong cấu trúc: <p><span style="font-family:Verdana,Geneva,sans-serif;"><span style="line-height:1.5;"><span style="font-size:16px;">[NỘI DUNG]</span></span></span></p>
3. Blockquote: <blockquote style="background-color: #f0f8ff; border-left: 5px solid #1e90ff; margin: 20px 0; padding: 15px 20px; font-style: italic;">...</blockquote>
4. Các khung nổi bật: <div style="background-color: #f0f8ff; padding: 25px; border-left: 4px solid #1e90ff; margin: 30px 0; border-radius: 8px;">...</div>
5. Bảng so sánh Table: border="2" style="width:100%; border-collapse: collapse; margin: 25px 0;"
6. KHÔNG dùng bất kỳ ICON nào.

QUY TRÌNH PHẢN HỒI (BẮT BUỘC):
Bạn phải gửi phần METADATA trước, sau đó mới đến nội dung bài viết HTML để đảm bảo thông tin không bị mất nếu quá giới hạn token.
Định dạng:
---METADATA_START---
SEO Title: [Nội dung]
SEO Description: [Nội dung]
SEO Keywords: [Nội dung]
---METADATA_END---
[BẮT ĐẦU NỘI DUNG BÀI VIẾT HTML TẠI ĐÂY]`;

  const prompt = `Hãy viết bài Content chuẩn SEO cho chủ đề: [${topic}].

Yêu cầu chi tiết bài viết:
1. ĐỘ DÀI: Khoảng 2000 từ. Viết cực kỳ chi tiết, phân tích sâu chuyên môn "${business.specialty}" của doanh nghiệp.
2. CẤU TRÚC: Phải có mở đầu, các mục H2 (căn giữa), H3, bảng so sánh, danh sách ưu điểm, và thông tin liên hệ ở cuối.
3. TIÊU CHÍ SEO:
   - Bôi đen (thẻ strong) từ khóa chính ít nhất 10 lần.
   - Sử dụng thẻ <a> cho các liên kết giả định đến website ${business.website}.
   - Chèn thẻ <p style="text-align:center"><img alt="..." height="..." src="..." width="..." /></p> ở các đoạn chuyển tiếp.
4. TÍNH HOÀN THIỆN: Viết liên tục cho đến khi xong phần liên hệ cuối cùng. Đảm bảo mã HTML hợp lệ, không để thừa các thẻ chưa đóng.

Lưu ý: Metadata phải nằm ở ĐẦU phản hồi.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4000 }, // Giảm thinking budget để dành chỗ cho text content
        maxOutputTokens: 8192,
        temperature: 0.6 // Giảm nhiệt độ để nội dung ổn định hơn
      },
    });

    const rawText = response.text || '';

    let htmlPart = rawText;
    let metadata = {
      title: 'N/A',
      description: 'N/A',
      keywords: 'N/A'
    };

    // Parsing Metadata at the START
    const metaStartTag = "---METADATA_START---";
    const metaEndTag = "---METADATA_END---";
    
    if (rawText.includes(metaStartTag)) {
      const parts = rawText.split(metaEndTag);
      const metaContent = parts[0].replace(metaStartTag, "").trim();
      htmlPart = parts[1] ? parts[1].trim() : parts[0];

      const titleMatch = metaContent.match(/SEO Title:\s*(.*)/i);
      const descMatch = metaContent.match(/SEO Description:\s*(.*)/i);
      const keyMatch = metaContent.match(/SEO Keywords:\s*(.*)/i);

      metadata = {
        title: titleMatch ? titleMatch[1].trim() : 'N/A',
        description: descMatch ? descMatch[1].trim() : 'N/A',
        keywords: keyMatch ? keyMatch[1].trim() : 'N/A'
      };
    }

    // Clean up any remaining markdown backticks
    htmlPart = htmlPart.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

    // Fix potential unclosed tags if the model cut off
    if (htmlPart && !htmlPart.endsWith('</span></p>') && htmlPart.includes('<p>')) {
      // Very basic closure attempt for truncated content
      if (htmlPart.includes('<span') && !htmlPart.endsWith('</span>')) htmlPart += '</span>';
      if (htmlPart.includes('<p') && !htmlPart.endsWith('</p>')) htmlPart += '</p>';
    }

    return {
      htmlContent: htmlPart,
      metadata
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
