import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, Send, AlertCircle } from "lucide-react";
import api from "../../api/axios";

function Messages() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const refreshAlerts = () => {
    window.dispatchEvent(new Event("page-alerts-refresh"));
  };

  const normalizeArray = (payload, key) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const resolveConversationAlert = useCallback(async (conversationId) => {
    try {
      await api.patch("/page-alerts/resolve", {
        pageKey: "messages",
        refId: conversationId,
      });
    } catch {
      try {
        await api.patch("/page-alerts/resolve", {
          pageKey: "messages",
        });
      } catch {
        // ignore
      }
    }

    refreshAlerts();
  }, []);

  const openConversation = useCallback(async (conversation) => {
    try {
      setErrorMessage("");
      setSelectedConversation(conversation);

      const res = await api.get(
        `/messages/conversations/${conversation.id}/messages`
      );

      setMessages(normalizeArray(res.data, "messages"));

      await resolveConversationAlert(conversation.id);

      setConversations((prev) =>
        prev.map((item) =>
          item.id === conversation.id
            ? {
                ...item,
                unreadCount: 0,
                hasUnread: false,
              }
            : item
        )
      );

      refreshAlerts();
    } catch (error) {
      console.error(error);

      setErrorMessage("Error while loading messages.");
    }
  }, [resolveConversationAlert]);

  const fetchConversations = useCallback(async () => {
    try {
      setErrorMessage("");

      const res = await api.get("/messages/conversations");
      const data = normalizeArray(res.data, "conversations");

      setConversations(data);

      const conversationId = searchParams.get("conversationId");

      if (conversationId && !selectedConversation) {
        const conversation = data.find((item) => item.id === conversationId);

        if (conversation) {
          openConversation(conversation);
        }
      }
    } catch (error) {
      console.error(error);

      setErrorMessage("Error while loading conversations.");

      setConversations([]);
    }
  }, [openConversation, searchParams, selectedConversation]);

  useEffect(() => {
    queueMicrotask(fetchConversations);
  }, [fetchConversations]);

  const sendMessage = async () => {
    if (!content.trim() || !selectedConversation) return;

    try {
      setErrorMessage("");

      const res = await api.post("/messages/messages", {
        conversationId: selectedConversation.id,
        content,
      });

      const sentMessage = res.data.data || res.data;

      setMessages((prev) => [...prev, sentMessage]);
      setContent("");

      fetchConversations();
      refreshAlerts();
    } catch (error) {
      console.error(error);

      setErrorMessage("Error while sending the message.");
    }
  };

  const getConversationName = (conversation) => {
    if (!conversation) return "Conversation";

    if (conversation.type === "BINOME" || conversation.binome) {
      const student1 = conversation.binome?.student1;
      const student2 = conversation.binome?.student2;

      const otherStudent =
        student1?.id === user.id || conversation.studentId === user.id
          ? student2
          : student1;

      if (otherStudent?.fullName) {
        return `Team - ${otherStudent.fullName}`;
      }

      if (student1?.fullName && student2?.fullName) {
        return `Team - ${student1.fullName} & ${student2.fullName}`;
      }

      return "Conversation team";
    }

    if (user.role === "COMPANY_SUPERVISOR") {
      if (conversation.application?.student) {
        return conversation.application.student.fullName;
      }

      if (conversation.application?.binome) {
        const s1 = conversation.application.binome.student1?.fullName;
        const s2 = conversation.application.binome.student2?.fullName;

        return [s1, s2].filter(Boolean).join(" & ") || "Team";
      }

      return conversation.student?.fullName || "Student";
    }

    return (
      conversation.supervisor?.fullName ||
      conversation.application?.subject?.supervisor?.fullName ||
      "Supervisor"
    );
  };

  const getConversationSubtitle = (conversation) => {
    if (!conversation) return "";

    if (conversation.type === "BINOME" || conversation.binome) {
      return "Team conversation";
    }

    return conversation.application?.subject?.title || "Conversation";
  };

  const hasUnread = (conversation) => {
    return Boolean(conversation.unreadCount || conversation.hasUnread);
  };

  return (
    <div className="flex h-[calc(100vh-9.25rem)] max-h-[calc(100vh-9.25rem)] min-h-0 overflow-hidden rounded-2xl border border-[#cfe1e8] bg-white shadow-sm">
      <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-[#cfe1e8] bg-slate-50">
        <div className="shrink-0 border-b border-[#cfe1e8] bg-white px-6 py-5">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
            Communication
          </p>
          <h1 className="mt-1 inline-flex items-center gap-2 text-2xl font-black text-slate-950">
            <MessageSquare className="h-6 w-6 text-cyan-700" strokeWidth={2.5} />
            Messages
          </h1>
        </div>

        {errorMessage && (
          <div className="m-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <MessageSquare className="h-10 w-10 text-slate-300" strokeWidth={2} />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                No conversation
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => openConversation(conversation)}
                className={`conversation-list-item relative w-full border-b border-[#e2edf2] px-6 py-5 text-left transition ${
                  selectedConversation?.id === conversation.id
                    ? "is-selected bg-cyan-50"
                    : "hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-slate-950">
                      {getConversationName(conversation)}
                    </h2>

                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      {getConversationSubtitle(conversation)}
                    </p>
                  </div>

                  {hasUnread(conversation) && (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />
                  )}
                </div>

                {conversation.messages?.[0] && (
                  <p className="mt-3 line-clamp-1 text-xs text-slate-400">
                    {conversation.messages[0].sender?.fullName}:{" "}
                    {conversation.messages[0].content}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex h-full min-w-0 flex-1 flex-col">
        {!selectedConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-white text-center">
            <MessageSquare className="h-14 w-14 text-slate-200" strokeWidth={1.75} />
            <p className="mt-4 text-base font-semibold text-slate-500">
              Select a conversation
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Pick a conversation on the left to start chatting.
            </p>
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-[#cfe1e8] bg-white px-6 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                {getConversationName(selectedConversation)}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {getConversationSubtitle(selectedConversation)}
              </p>
            </div>

            <div
              ref={messagesRef}
              className="min-h-0 flex-1 overflow-y-auto bg-[#f3f8fb] p-6"
            >
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  const senderId = msg.senderId || msg.sender?.id;
                  const previousMessage = messages[index - 1];
                  const previousSenderId =
                    previousMessage?.senderId || previousMessage?.sender?.id;

                  const isMine = String(senderId) === String(user.id);
                  const isNewSenderGroup =
                    String(senderId) !== String(previousSenderId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      {isNewSenderGroup && !isMine && (
                        <p className="mb-1 ml-2 text-xs font-bold text-slate-500">
                          {msg.sender?.fullName || "User"}
                        </p>
                      )}

                      <div
                        className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isMine
                            ? "bg-cyan-700 text-white"
                            : "border border-[#cfe1e8] bg-white text-slate-900"
                        }`}
                      >
                        <p className="leading-6">{msg.content}</p>

                        <p
                          className={`mt-2 text-[11px] ${
                            isMine ? "text-cyan-100" : "text-slate-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-[#cfe1e8] bg-white p-4">
              <div className="flex gap-2">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Write a message..."
                  className="flex-1 rounded-xl border border-[#cfe1e8] px-4 py-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />

                <button
                  onClick={sendMessage}
                  disabled={!content.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send className="h-4 w-4" strokeWidth={2.5} />
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Messages;
