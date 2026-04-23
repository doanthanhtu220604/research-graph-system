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

  function appendMessage(role, text, graph = null) {
    if (!els.messages) return;

    const wrap = document.createElement("div");
    wrap.className = `chat-msg-wrap chat-msg-${role}`;

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${role}`;
    
    // Header icon cho giống thiết kế
    const iconHtml = role === 'bot' 
        ? `<div style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; background:#f59e0b; color:white; margin-right:12px; flex-shrink:0;"><i class="fas fa-robot"></i></div>` 
        : `<div style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; background:#ef4444; color:white; margin-right:12px; flex-shrink:0;"><i class="fas fa-user"></i></div>`;
        
    bubble.innerHTML = `<div style="display:flex; align-items:flex-start;">
        ${iconHtml}
        <div style="flex:1;">${formatText(text)}</div>
    </div>`;

    wrap.appendChild(bubble);

    // Xử lý Graph
    if (graph && graph.nodes && graph.edges) {
        const graphContainer = document.createElement("div");
        graphContainer.className = "chat-graph-container";
        graphContainer.style.height = "350px";
        graphContainer.style.width = "calc(100% - 44px)"; // Trừ đi width của icon
        graphContainer.style.marginLeft = "44px";
        graphContainer.style.marginTop = "12px";
        graphContainer.style.borderRadius = "12px";
        graphContainer.style.background = "linear-gradient(to bottom, #f8fafc, #ffffff)";
        graphContainer.style.border = "1px solid var(--border-color)";
        graphContainer.style.boxShadow = "inset 0 2px 10px rgba(0,0,0,0.02)";
        graphContainer.style.position = "relative";
        
        wrap.appendChild(graphContainer);
        
        setTimeout(() => {
            const data = {
                nodes: new vis.DataSet(graph.nodes.map(n => ({
                    id: n.id,
                    label: n.label,
                    color: {
                        background: n.color,
                        border: n.color,
                        highlight: { background: n.color, border: '#fff' }
                    },
                    shape: n.shape || 'dot',
                    size: n.size || 15,
                    font: { face: 'Inter', size: 12, color: '#334155' },
                    borderWidth: 2,
                    shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', size: 5 }
                }))),
                edges: new vis.DataSet(graph.edges.map(e => ({
                    from: e.from,
                    to: e.to,
                    label: e.label,
                    font: { size: 10, align: 'middle', color: '#94a3b8', strokeWidth: 0 },
                    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                    color: { color: 'rgba(0,0,0,0.15)' },
                    smooth: { type: 'continuous' }
                })))
            };
            
            const options = {
                physics: { 
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: { gravitationalConstant: -30, centralGravity: 0.005, springLength: 100 }
                },
                interaction: { dragNodes: true, zoomView: true, dragView: true, tooltipDelay: 200 }
            };
            
            new vis.Network(graphContainer, data, options);
        }, 100);
    }

    // Timestamp
    const ts = document.createElement("div");
    ts.className = "chat-timestamp";
    ts.textContent = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    ts.style.marginLeft = "44px";
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
      .replace(/\[([^\]]+)\]\((.+?)\)(?!\))/g, function(match, linkText, url) {
        if (url.startsWith('javascript:')) {
          let jsCode = url.replace('javascript:', '');
          return `<a href="javascript:void(0)" onclick="${jsCode}; return false;" style="color: var(--accent-blue); text-decoration: none; font-weight: 600;">${linkText}</a>`;
        }
        return `<a href="${url}" target="_blank" style="color: var(--accent-blue); text-decoration: none; font-weight: 600;">${linkText}</a>`;
      })
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
    history.forEach((msg) => appendMessage(msg.role, msg.text, msg.graph));
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
      appendMessage("bot", answer, data.graph);
      history.push({ role: "bot", text: answer, graph: data.graph });
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
