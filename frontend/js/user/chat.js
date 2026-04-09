/**
 * Chat Module — Trợ lý Nghiên cứu CNTT
 * Full-page Q&A chatbot interface.
 * History is session-only (sessionStorage).
 */

(function () {
  "use strict";

  // ─── Constants ──────────────────────────────────────────────────────────────
  const API_URL = "/api/chat/ask";
  const STORAGE_KEY = "chatHistory_full_v1";

  const QUICK_QUESTIONS = [
    "Có bao nhiêu giảng viên?",
    "Top giảng viên nhiều công trình nhất",
    "Thống kê tổng quan hệ thống",
    "Giảng viên nào nghiên cứu AI?",
    "Các công trình năm nay",
    "Đề tài nghiên cứu gần đây",
  ];

  // ─── State ──────────────────────────────────────────────────────────────────
  let isLoading = false;
  let history = []; // { role: 'user'|'bot', text: '...' }

  // ─── DOM Elements ───────────────────────────────────────────────────────────
  let els = {};

  // ─── Render helpers ──────────────────────────────────────────────────────────
  function renderQuickQuestions() {
    if (!els.quickList) return;
    els.quickList.innerHTML = "";
    QUICK_QUESTIONS.forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "chat-quick-btn";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        sendMessage(q);
        if (els.quickWrap) els.quickWrap.style.display = "none";
      });
      els.quickList.appendChild(btn);
    });
  }

  function appendMessage(role, text) {
    if (!els.messages) return;

    const wrap = document.createElement("div");
    wrap.className = `chat-msg-wrap chat-msg-${role}`;

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${role}`;
    bubble.innerHTML = formatText(text);

    wrap.appendChild(bubble);

    // Timestamp
    const ts = document.createElement("div");
    ts.className = "chat-timestamp";
    ts.textContent = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    wrap.appendChild(ts);

    els.messages.appendChild(wrap);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function showTypingIndicator() {
    if (!els.messages || document.getElementById("chat-typing")) return;

    const wrap = document.createElement("div");
    wrap.className = "chat-msg-wrap chat-msg-bot";
    wrap.id = "chat-typing";
    wrap.innerHTML = `
      <div class="chat-bubble chat-bubble-bot chat-typing-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    els.messages.appendChild(wrap);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById("chat-typing");
    if (el) el.remove();
  }

  /** Convert markdown-lite to HTML safely */
  function formatText(text) {
    let t = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    return t;
  }

  // ─── Session Storage ─────────────────────────────────────────────────────────
  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (_) {}
  }

  function loadHistory() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) history = JSON.parse(saved);
    } catch (_) {
      history = [];
    }
  }

  function restoreHistory() {
    history.forEach((msg) => appendMessage(msg.role, msg.text));
    if (els.messages) els.messages.scrollTop = els.messages.scrollHeight;
  }

  // ─── Core logic ──────────────────────────────────────────────────────────────
  async function sendMessage(text) {
    text = (text || "").trim();
    if (!text || isLoading) return;

    // Hide quick questions
    if (els.quickWrap) els.quickWrap.style.display = "none";

    appendMessage("user", text);
    history.push({ role: "user", text });
    saveHistory();

    clearInput();
    isLoading = true;
    setSendState(false);
    showTypingIndicator();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      const answer = data.answer || "Xin lỗi, tôi không thể trả lời lúc này.";
      removeTypingIndicator();
      appendMessage("bot", answer);
      history.push({ role: "bot", text: answer });
      saveHistory();
    } catch (err) {
      removeTypingIndicator();
      appendMessage("bot", "⚠️ Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      isLoading = false;
      setSendState(true);
    }
  }

  function clearInput() {
    if (!els.input) return;
    els.input.value = "";
    els.input.style.height = "auto";
  }

  function setSendState(enabled) {
    if (!els.sendBtn) return;
    els.sendBtn.disabled = !enabled;
  }

  function clearChat() {
    history = [];
    saveHistory();
    if (els.messages) els.messages.innerHTML = "";
    appendWelcome();
    if (els.quickWrap) els.quickWrap.style.display = "";
  }

  function appendWelcome() {
    appendMessage(
      "bot",
      "Xin chào! 👋 Tôi là **Trợ lý Nghiên cứu Khoa CNTT**.\n\nTôi có thể giúp bạn tìm kiếm thông tin về **giảng viên**, **công trình**, **đề tài** và **thống kê** tổng quan bằng ngôn ngữ tự nhiên.\n\nBạn muốn tìm kiếm thông tin gì hôm nay?"
    );
  }

  function autoResize(textarea) {
    textarea.style.height = "auto";
    const maxH = 150;
    textarea.style.height = Math.min(textarea.scrollHeight, maxH) + "px";
  }

  // ─── Init ────────────────────────────────────────────────────────────────────
  function init() {
    // Only init if we are on the chat page
    els.messages = document.getElementById("chat-messages");
    if (!els.messages) return;

    els.input = document.getElementById("chat-input");
    els.sendBtn = document.getElementById("chat-send-btn");
    els.clearBtn = document.getElementById("chat-clear-btn");
    els.quickWrap = document.getElementById("chat-quick-wrap");
    els.quickList = document.getElementById("chat-quick-list");

    loadHistory();

    if (history.length > 0) {
      restoreHistory();
      if (els.quickWrap) els.quickWrap.style.display = "none";
    } else {
      appendWelcome();
      renderQuickQuestions();
    }

    // Events
    if (els.clearBtn) els.clearBtn.addEventListener("click", clearChat);

    if (els.sendBtn && els.input) {
      els.sendBtn.addEventListener("click", () => sendMessage(els.input.value));
      els.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage(els.input.value);
        }
      });
      els.input.addEventListener("input", () => autoResize(els.input));
      els.input.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
