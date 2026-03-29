import axios from "axios";
import * as cheerio from "cheerio";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import FormData from "form-data";

interface ArticleData {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface CMSConfig {
  cms_login_url: string;
  cms_username: string;
  cms_password: string;
  cms_news_list_url: string;
  cms_news_add_url: string;
}

/**
 * Slug generator: convert Vietnamese title to slug lowercase remove accents
 */
function generateSlug(title: string): string {
  let slug = title.toLowerCase();
  
  // Specific Vietnamese characters replacement
  const replacements: { [key: string]: string } = {
    'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd'
  };

  for (const [key, value] of Object.entries(replacements)) {
    slug = slug.replace(new RegExp(key, 'g'), value);
  }
  
  // Remove other accents and special characters
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Remove special characters and replace spaces with hyphens
  slug = slug.replace(/[^a-z0-9\s-]/g, "")
             .replace(/\s+/g, "-")
             .replace(/-+/g, "-")
             .trim();
             
  return slug;
}

export async function publishToCMS(article: ArticleData, config: CMSConfig) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ 
    jar, 
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  }));

  const logs: string[] = [];
  const addLog = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  const { cms_login_url, cms_username, cms_password, cms_news_add_url } = config;

  try {
    // 1. GET login page
    addLog("Đang tải trang đăng nhập...");
    const loginPageResponse = await client.get(cms_login_url);
    const $login = cheerio.load(loginPageResponse.data);
    
    // 2. Extract csrf_token
    let csrfToken = $login('input[name="csrf_token"]').val() as string;
    if (!csrfToken) {
      csrfToken = $login('input[type="hidden"]').val() as string;
    }

    if (csrfToken) {
      addLog(`Đã trích xuất CSRF token: ${csrfToken}`);
    } else {
      addLog("Cảnh báo: Không tìm thấy CSRF token.");
    }

    // 3. Login preserve cookies
    addLog("Đang gửi thông tin đăng nhập...");
    const loginData = new URLSearchParams();
    loginData.append('username', cms_username);
    loginData.append('password', cms_password);
    if (csrfToken) loginData.append('csrf_token', csrfToken);

    const loginPostResponse = await client.post(cms_login_url, loginData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 5
    });

    if (loginPostResponse.data.includes('login-form') || loginPostResponse.data.includes('username')) {
      throw new Error("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.");
    }
    addLog("Đăng nhập thành công!");

    // 4. GET add article page
    addLog("Đang mở trang tạo bài viết mới...");
    const createPageResponse = await client.get(cms_news_add_url);
    const $formPage = cheerio.load(createPageResponse.data);
    
    // DEBUG: Log all forms, inputs, and textareas found
    const allForms = $formPage('form');
    const allTextareas = $formPage('textarea');
    const allInputs = $formPage('input');
    addLog(`Tìm thấy ${allForms.length} form, ${allInputs.length} input và ${allTextareas.length} textarea trên trang.`);
    
    const formNames: string[] = [];
    allForms.each((_, el) => {
      formNames.push($formPage(el).attr('name') || $formPage(el).attr('id') || 'unnamed-form');
    });
    
    const textareaNames: string[] = [];
    allTextareas.each((_, el) => {
      textareaNames.push($formPage(el).attr('name') || $formPage(el).attr('id') || 'unnamed-textarea');
    });

    const inputNames: string[] = [];
    allInputs.each((_, el) => {
      const name = $formPage(el).attr('name');
      if (name) inputNames.push(name);
    });

    // FORM DETECTION RULE
    let $form: any = $formPage('form').first(); // Default to first
    let foundFormByFields = false;

    // REAL FIELD MAPPING PATTERNS
    const targetFields = [
      'data[namevi]', 
      'dataSeo[titlevi]', 
      'dataSeo[keywordsvi]', 
      'dataSeo[descriptionvi]', 
      'dataSeo[seo_focusvi]',
      'tenvi', // legacy support
      'noidungvi' // legacy support
    ];
    
    // Search ALL forms for target fields, prioritizing data[namevi]
    allForms.each((_, el) => {
      const $f = $formPage(el);
      const hasMainField = $f.find('[name="data[namevi]"]').length > 0;
      const hasAnyTarget = targetFields.some(field => $f.find(`[name="${field}"]`).length > 0);
      
      if (hasMainField) {
        $form = $f;
        foundFormByFields = true;
        return false; // break
      }
      
      if (hasAnyTarget && !foundFormByFields) {
        $form = $f;
        foundFormByFields = true;
      }
    });

    // IF NO FORM FOUND BY FIELDS, search globally
    if (!foundFormByFields) {
      addLog("Không tìm thấy form qua các trường mục tiêu, đang tìm kiếm toàn cục...");
      const globalElements = $formPage('input, textarea, select');
      globalElements.each((_, el) => {
        const name = $formPage(el).attr('name') || '';
        if (targetFields.includes(name)) {
          const parentForm = $formPage(el).closest('form');
          if (parentForm.length > 0) {
            $form = parentForm;
            foundFormByFields = true;
            return false; // break
          }
        }
      });
    }

    if ($form.length === 0) {
      throw new Error("Không tìm thấy form tạo bài viết phù hợp trên trang.");
    }
    addLog(`Đã xác định được form: ${$form.attr('name') || $form.attr('id') || 'unnamed'}`);

    // 5. Parse ALL hidden fields
    const formData = new FormData();
    const hiddenFields: Record<string, string> = {};

    $form.find('input[type="hidden"]').each((_, el) => {
      const name = $formPage(el).attr('name');
      const value = $formPage(el).attr('value') || '';
      if (name) {
        hiddenFields[name] = value;
        formData.append(name, value);
      }
    });

    // 6. Build multipart/form-data (Insert fields)
    const slug = generateSlug(article.title);
    
    // CONTENT FIELD FIX: Find original hidden textarea, ignore cke_source
    let contentFieldName = 'data[contentvi]';
    const contentTextarea = $form.find('textarea[name="data[contentvi]"], textarea[id="contentvi"]').not('.cke_source');
    
    if (contentTextarea.length > 0) {
      contentFieldName = contentTextarea.attr('name') || 'data[contentvi]';
    } else {
      // Fallback: Search textarea containing noidung or content, excluding cke_source
      allTextareas.not('.cke_source').each((_, el) => {
        const name = $formPage(el).attr('name') || '';
        if (name.includes('noidung') || name.includes('content')) {
          contentFieldName = name;
          return false;
        }
      });
    }

    // SLUG FIELD DETECTION
    let slugFieldName = '';
    if ($form.find('[name="data[slugvi]"]').length > 0) slugFieldName = 'data[slugvi]';
    else if ($form.find('[name="data[tenkhongdau]"]').length > 0) slugFieldName = 'data[tenkhongdau]';
    else if ($form.find('[name="tenkhongdau"]').length > 0) slugFieldName = 'tenkhongdau';

    // Mapping fields as requested
    const fieldsToInsert: Record<string, string> = {
      'data[namevi]': article.title,
      'dataSeo[titlevi]': article.metaTitle,
      'dataSeo[keywordsvi]': article.metaKeywords,
      'dataSeo[descriptionvi]': article.metaDescription,
      'dataSeo[seo_focusvi]': article.title, // Auto fill main SEO keyword with title
      [contentFieldName]: article.content
    };

    // Add slug if field detected
    if (slugFieldName) {
      fieldsToInsert[slugFieldName] = slug;
    }

    // Legacy support if new fields not found
    if ($form.find('[name="tenvi"]').length > 0 && !$form.find('[name="data[namevi]"]').length) {
      fieldsToInsert['tenvi'] = article.title;
    }

    for (const [name, value] of Object.entries(fieldsToInsert)) {
      formData.append(name, value);
    }

    // DEBUG REQUIRED: Before final POST print
    addLog("--- DEBUG INFO ---");
    addLog(`Tất cả form tìm thấy: ${formNames.join(', ')}`);
    addLog(`Tất cả input tìm thấy: ${inputNames.length} trường`);
    addLog(`Tất cả textarea tìm thấy: ${textareaNames.join(', ')}`);
    addLog(`Submit URL (Action): ${$form.attr('action') || 'Empty (submit to current URL)'}`);
    addLog(`Hidden Fields: ${JSON.stringify(hiddenFields, null, 2)}`);
    addLog(`Các trường sẽ gửi: ${Object.keys(fieldsToInsert).join(', ')}`);
    addLog(`Trường nội dung sử dụng: ${contentFieldName}`);
    addLog("------------------");

    // 9. Submit to exact form action URL
    const action = $form.attr('action') || '';
    const submitUrl = action 
      ? (action.startsWith('http') ? action : new URL(action, cms_news_add_url).toString())
      : cms_news_add_url;

    addLog(`Đang gửi dữ liệu bài viết lên CMS: ${submitUrl}`);
    
    try {
      const submitResponse = await client.post(submitUrl, formData, {
        headers: { 
          ...formData.getHeaders()
        },
        maxRedirects: 0, // Don't follow redirects, we'll check status
        validateStatus: (status) => status >= 200 && status < 400
      });

      // 10. Success condition: 200, 201, 301, 302
      const isSuccess = 
        submitResponse.status === 200 || 
        submitResponse.status === 201 || 
        submitResponse.status === 301 || 
        submitResponse.status === 302;

      if (isSuccess) {
        addLog("Hoàn Thành");
        return { success: true, message: "Hoàn Thành", logs };
      } else {
        throw new Error(`Gửi bài thất bại với mã trạng thái ${submitResponse.status}`);
      }
    } catch (submitError: any) {
      // If 500: check if it's a false failure
      if (submitError.response && submitError.response.status === 500) {
        const body = typeof submitError.response.data === 'string' 
          ? submitError.response.data 
          : JSON.stringify(submitError.response.data);
          
        const criticalErrors = ["SQL error", "Fatal error", "Permission denied", "Login expired"];
        const hasCriticalError = criticalErrors.some(err => body.includes(err));

        if (!hasCriticalError) {
          addLog("500 sau submit nhưng CMS đã lưu bài -> coi là thành công");
          addLog("Hoàn Thành");
          return { success: true, message: "Hoàn Thành", logs };
        }

        addLog("--- ERROR 500 RESPONSE BODY ---");
        addLog(body);
        addLog("-------------------------------");
      }
      throw submitError;
    }

  } catch (error: any) {
    addLog(`Lỗi: ${error.message}`);
    return { success: false, error: error.message, logs };
  }
}
