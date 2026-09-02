import { Link } from "react-router-dom";
import { MessageCircle, CheckCheck, Send, Paperclip, Smile, Mic, MoreHorizontal, Phone, Video, ArrowRight, Zap } from "lucide-react";

const ChatPreview = () => {
  const messages = [
    {
      id: 1,
      sender: "Ali",
      text: "Did you understand React Hooks?",
      time: "10:30 AM",
      isOwn: false,
      read: true,
    },
    {
      id: 2,
      sender: "You",
      text: "Yes 😄 Can you explain Spring Boot tomorrow?",
      time: "10:32 AM",
      isOwn: true,
      read: true,
    },
    {
      id: 3,
      sender: "Ali",
      text: "Sure 👍 I'll share a PDF too.",
      time: "10:33 AM",
      isOwn: false,
      read: true,
    },
    {
      id: 4,
      sender: "Ali",
      text: "📎 SpringBoot_Notes.pdf",
      time: "10:34 AM",
      isOwn: false,
      read: false,
      isFile: true,
    },
  ];

  return (
    <section className="py-12 bg-white md:py-20 dark:bg-slate-900">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>💬 Real-Time Chat</span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            Chat • Share • Learn Together
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Real-time messaging with typing indicators, read receipts, and file sharing.
          </p>
        </div>

        {/* Chat Window */}
        <div className="overflow-hidden border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl border-slate-200/50 dark:border-slate-700/50">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50/30 to-emerald-50/30 dark:from-indigo-900/10 dark:to-emerald-900/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                  A
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-emerald-500 dark:border-slate-800"></span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Ali Khan</h3>
                <p className="flex items-center gap-1 text-xs text-emerald-500">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
              <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <Video className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
              <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 min-h-[280px] max-h-[320px] overflow-y-auto bg-gradient-to-b from-slate-50/30 to-transparent dark:from-slate-900/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    msg.isOwn
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/50 dark:border-slate-600/50"
                  }`}
                >
                  {msg.isFile ? (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-white/20">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">SpringBoot_Notes.pdf</p>
                        <p className="text-xs opacity-70">2.4 MB</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={`text-[10px] ${msg.isOwn ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"}`}>
                      {msg.time}
                    </span>
                    {msg.isOwn && (
                      <CheckCheck className={`w-3 h-3 ${msg.read ? "text-emerald-300" : "text-indigo-300"}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-slate-200/50 dark:border-slate-600/50">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce animation-delay-200"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce animation-delay-400"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2 p-3 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
            <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <Paperclip className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
            <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <Smile className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 transition-all bg-white border rounded-xl border-slate-200/50 dark:border-slate-700/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button className="p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <Mic className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
            <button className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="px-3 py-1.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5" /> Emojis
          </span>
          <span className="px-3 py-1.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> Read Receipts
          </span>
          <span className="px-3 py-1.5 text-xs rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5" /> File Sharing
          </span>
          <span className="px-3 py-1.5 text-xs rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center gap-1">
            <Mic className="w-3.5 h-3.5" /> Voice Notes
          </span>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            Open Full Chat
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ChatPreview;