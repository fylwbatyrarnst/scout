import React, { useState } from "react";

const faqReplies = [
  {
    q: "إزاي أنضم للعشيرة؟",
    a: "تقدر تضغط على زرار (انضم إلينا) في أعلى الصفحة وتملأ بياناتك، وهنتواصل معاك فوراً!",
  },
  {
    q: "إيه هي لجان العشيرة؟",
    a: "عندنا 4 لجان نوعية: لجنة الميديا، لجنة السكرتارية، لجنة الخدمة العامة، ولجنة الصندوق والعهدة.",
  },
  {
    q: "مقر العشيرة فين في الكلية؟",
    a: "مقر عشيرة الجوالة موجود في مبنى رعاية الشباب - كلية العلوم جامعة عين شمس.",
  },
];

export default function BadenPowellBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "أهلاً بيك 👋 أنا بادن باول، اسألني عن كلية العلوم أو عشيرة الجوالة!" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { from: "user", text };
    let reply =
      "سؤال جميل! تقدر تتواصل معانا على sciencerover@gmail.com أو تسجل بياناتك في (انضم إلينا) وهنرد على كل استفساراتك.";

    if (text.includes("انضم") || text.includes("اشتراك") || text.includes("تسجيل")) {
      reply = faqReplies[0].a;
    } else if (text.includes("لجان") || text.includes("لجنة")) {
      reply = faqReplies[1].a;
    } else if (text.includes("مكان") || text.includes("مقر") || text.includes("فين")) {
      reply = faqReplies[2].a;
    }

    setMessages((prev) => [...prev, userMsg, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      <button className="chatbot-toggler" onClick={() => setOpen(!open)} title="اسأل بادن باول">
        <i className={`bi ${open ? "bi-x-lg" : "bi-chat-dots-fill"}`}></i>
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="bg-black text-warning p-3 d-flex justify-content-between align-items-center border-bottom border-warning border-opacity-25">
            <span className="fw-bold">⚜️ مساعد بادن باول</span>
            <button className="btn btn-sm btn-close btn-close-white" onClick={() => setOpen(false)}></button>
          </div>

          <div className="p-3" style={{ height: "250px", overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 p-2 rounded-3 small ${
                  m.from === "bot"
                    ? "bg-dark text-light border border-secondary border-opacity-25"
                    : "bg-warning text-dark fw-bold text-start"
                }`}
              >
                {m.text}
              </div>
            ))}

            <div className="d-flex flex-wrap gap-1 mt-2">
              {faqReplies.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(item.q)}
                  className="btn btn-outline-gold btn-sm rounded-pill"
                  style={{ fontSize: "0.75rem" }}
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          <form
            className="p-2 border-top border-secondary border-opacity-25 d-flex gap-1 bg-black"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white border-secondary"
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn btn-gold btn-sm">
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
