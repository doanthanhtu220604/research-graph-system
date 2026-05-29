/* ============================================================
   TRANSLATION - Toggle translation for abstract content
   ============================================================ */

async function toggleTranslation(btn, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (btn.classList.contains('loading')) return;

    const originalText = container.getAttribute('data-original');

    if (container.getAttribute('data-translated') === 'true') {
        container.innerText = originalText;
        container.setAttribute('data-translated', 'false');
        btn.innerHTML = '<i class="fas fa-language"></i> Dịch tóm tắt';
        return;
    }

    try {
        btn.classList.add('loading');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang dịch...';

        const isVi = detectVN(originalText);
        const langPair = isVi ? 'vi|en' : 'en|vi';

        const result = await translateText(originalText, langPair);

        if (result && result.success) {
            container.innerText = result.text;
            container.setAttribute('data-translated', 'true');
            btn.innerHTML = '<i class="fas fa-undo"></i> Xem bản gốc';
        } else {
            const msg = (result && result.message) ? result.message : 'Không thể dịch nội dung này vào lúc này.';
            alert(msg);
            btn.innerHTML = '<i class="fas fa-language"></i> Dịch tóm tắt';
        }
    } catch (error) {
        console.error('Translation error:', error);
        alert('Có lỗi xảy ra khi gọi API dịch.');
        btn.innerHTML = '<i class="fas fa-language"></i> Dịch tóm tắt';
    } finally {
        btn.classList.remove('loading');
    }
}

function detectVN(text) {
    const vnWords = ['và', 'của', 'là', 'trong', 'cho', 'với', 'các', 'những', 'được', 'về', 'một', 'đã', 'có'];
    const words = text.toLowerCase().split(/\s+/);
    return words.some(w => vnWords.includes(w));
}

async function translateText(text, langPair) {
    try {
        const target = langPair.split('|')[1]; // 'vi' hoặc 'en'
        const response = await fetch(`${API_BASE}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                target_lang: target === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'
            })
        });
        const data = await response.json();

        if (data && data.status === 'ok' && data.translatedText) {
            return { success: true, text: data.translatedText };
        }
        return { success: false, message: data.message };
    } catch (err) {
        console.error('Translate API error:', err);
        return { success: false, message: 'Lỗi kết nối đến máy chủ dịch thuật.' };
    }
}
