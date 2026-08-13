"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { MessageSquare, Send, User, Bot, Trash2, Check, AlertCircle } from "lucide-react";

export default function ChatsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const data = await fetchApi("/chats");
      setConversations(data);
      if (data.length > 0 && !selectedPhone) {
        setSelectedPhone(data[0].phone);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (phone: string) => {
    try {
      const data = await fetchApi(`/chats/${phone}`);
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      loadMessages(selectedPhone);
      const interval = setInterval(() => loadMessages(selectedPhone), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPhone) return;

    const text = replyText;
    setReplyText("");
    setSending(true);

    try {
      await fetchApi(`/chats/${selectedPhone}`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      await loadMessages(selectedPhone);
    } catch (e: any) {
      alert(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedPhone) return;
    if (!confirm("Are you sure you want to clear this conversation?")) return;

    try {
      await fetchApi(`/chats/${selectedPhone}`, { method: "DELETE" });
      setMessages([]);
      loadConversations();
      setSelectedPhone(null);
    } catch (e) {
      alert("Failed to clear chat");
    }
  };

  const formatPhone = (phone: string) => phone.replace(/@.*$/, "");

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-emerald-400" /> Live WhatsApp Inbox
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          View incoming customer messages and send manual replies in real-time.
        </p>
      </div>

      {/* Main Inbox Container */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex shadow-2xl">
        {/* Sidebar Contacts List */}
        <div className="w-1/3 min-w-[260px] border-r border-zinc-800 bg-zinc-900/40 flex flex-col">
          <div className="p-4 border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400 tracking-wider">
            Conversations
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-6 text-center text-zinc-500 text-sm">No incoming messages yet.</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.phone}
                  onClick={() => setSelectedPhone(conv.phone)}
                  className={`w-full text-left p-4 border-b border-zinc-800/50 transition-all ${
                    selectedPhone === conv.phone
                      ? "bg-blue-600/15 border-l-4 border-l-blue-500 pl-3"
                      : "hover:bg-zinc-900 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="font-semibold text-zinc-200 text-sm">{formatPhone(conv.phone)}</div>
                  <div className="text-xs text-zinc-500 mt-1 truncate flex items-center gap-1">
                    {conv.isFromMe && <Check className="w-3 h-3 text-emerald-400" />}
                    {conv.content}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {selectedPhone ? (
            <>
              {/* Chat Top Header */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{formatPhone(selectedPhone)}</h3>
                    <span className="text-[11px] text-zinc-500">WhatsApp Contact</span>
                  </div>
                </div>

                <button
                  onClick={handleClearChat}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-900/40 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              </div>

              {/* Chat Message Bubble List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                  const isFailed = msg.status === "FAILED";
                  return (
                    <div key={msg.id} className={`flex ${msg.isFromMe ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[75%] ${msg.isFromMe ? "flex-row-reverse" : "flex-row"} items-end gap-2.5`}>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                            msg.isFromMe ? (isFailed ? "bg-red-900 text-red-100" : "bg-blue-600 text-white") : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {msg.isFromMe ? (isFailed ? <AlertCircle className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />) : <User className="w-3.5 h-3.5" />}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                            msg.isFromMe
                              ? isFailed
                                ? "bg-red-950 border border-red-900/60 text-red-200 rounded-br-none"
                                : "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-950/50"
                              : "bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-bl-none"
                          }`}
                        >
                          <div>{msg.content}</div>
                          {isFailed && msg.error && (
                            <div className="mt-2 text-xs text-red-300 bg-red-900/40 p-1.5 rounded border border-red-800/50">
                              Error: {msg.error}
                            </div>
                          )}
                          <div className={`text-[10px] mt-1.5 text-right ${msg.isFromMe ? "text-blue-100/70" : "text-zinc-500"}`}>
                            {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric" }).format(new Date(msg.createdAt))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Reply Form */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply to send via WhatsApp..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-3">
              <MessageSquare className="w-12 h-12 text-zinc-700" />
              <p className="text-sm">Select a conversation from the left to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
