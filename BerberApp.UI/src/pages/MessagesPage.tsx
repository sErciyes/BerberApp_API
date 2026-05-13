import { useEffect, useMemo, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { MessageCircle, Send } from "lucide-react";
import { createChatConnection } from "../api/chatHub";
import { getConversations, getMessages, markConversationAsRead } from "../api/chatApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import { useAuth } from "../context/AuthContext";
import { getToken, isTokenExpired } from "../utils/tokenStorage";
import type { ChatMessage, Conversation } from "../types/chat";

export function MessagesPage() {
  const { isAdmin, isBarber, signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hubReady, setHubReady] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  const title = isAdmin ? "Admin Mesajlari" : isBarber ? "Berber Mesajlari" : "Mesajlar";
  const selectedTitle = selectedConversation
    ? isAdmin
      ? `${selectedConversation.userFullName} - ${selectedConversation.barberFullName}`
      : isBarber
        ? selectedConversation.userFullName
      : selectedConversation.barberFullName
    : "Konusma sec";

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    getConversations()
      .then((response) => {
        const items = response.data ?? [];
        setError("");
        setConversations(items);
        setSelectedConversation(items[0] ?? null);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );

    getMessages(selectedConversation.id)
      .then((response) => {
        setError("");
        setMessages(response.data ?? []);
        return markConversationAsRead(selectedConversation.id);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [selectedConversation]);

  function addMessage(message: ChatMessage) {
    const activeConversationId = selectedConversationRef.current?.id;

    if (activeConversationId === message.conversationId) {
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [...current, message];
      });
    }

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== message.conversationId) {
          return conversation;
        }

        const unreadCount =
          activeConversationId === message.conversationId || message.isMine
            ? 0
            : conversation.unreadCount + 1;

        return {
          ...conversation,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          unreadCount
        };
      })
    );
  }

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setError("Mesajlasma icin once giris yapmalisin.");
      return;
    }

    if (isTokenExpired(token)) {
      signOut();
      setError("Oturum suresi dolmus. Lutfen tekrar giris yap.");
      return;
    }

    const connection = createChatConnection();
    connectionRef.current = connection;

    connection.on("ReceiveMessage", (message: ChatMessage) => {
      setError("");
      addMessage(message);
    });

    connection.onreconnected(() => {
      const activeConversationId = selectedConversationRef.current?.id;

      if (!activeConversationId) {
        return Promise.resolve();
      }

      return connection
        .invoke("JoinConversation", activeConversationId)
        .then(() => setError(""))
        .catch(() => setError("Konusma odasina baglanilamadi."));
    });

    connection
      .start()
      .then(() => {
        setError("");
        setHubReady(true);
      })
      .catch(() => setError("SignalR baglantisi kurulamadi. Oturum suresi dolduysa tekrar giris yap."));

    return () => {
      setHubReady(false);
      connection.stop();
    };
  }, []);

  useEffect(() => {
    const connection = connectionRef.current;

    if (!selectedConversation || !connection || !hubReady) {
      return;
    }

    const join = () =>
      connection
        .invoke("JoinConversation", selectedConversation.id)
        .then(() => setError(""))
        .catch(() => setError("Konusma odasina baglanilamadi."));

    join();
  }, [selectedConversation, hubReady]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedConversation || !content.trim()) {
      return;
    }

    try {
      const sentMessage = await connectionRef.current?.invoke<ChatMessage>("SendMessage", selectedConversation.id, content.trim());

      if (sentMessage) {
        setError("");
        addMessage(sentMessage);
      }

      setContent("");
    } catch {
      setError("Mesaj gonderilemedi.");
    }
  }

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt));
  }, [conversations]);

  return (
    <div className="center-page">
      <div className="page-heading row-heading">
        <div>
          <h1>{title}</h1>
          <p>{isAdmin ? "Kullanicilarin berber konusmalarini takip et." : isBarber ? "Kullanicilardan gelen mesajlari yanitla." : "Berberlerle anlik olarak yazis."}</p>
        </div>
      </div>

      {error && (
        <Notice type="error" onClose={() => setError("")}>
          {error}
        </Notice>
      )}
      {loading && <Notice>Konusmalar yukleniyor.</Notice>}

      <div className="chat-shell">
        <aside className="conversation-list">
          {sortedConversations.length === 0 && (
            <div className="empty-chat">
              <MessageCircle size={24} />
              <span>Henuz konusma yok.</span>
            </div>
          )}
          {sortedConversations.map((conversation) => {
            const secondaryLabel = isAdmin
              ? `${conversation.barberFullName} - ${conversation.barberSpecialty || "Genel hizmet"}`
              : isBarber
                ? conversation.barberSpecialty || "Genel hizmet"
                : `${conversation.barberFullName} - ${conversation.barberSpecialty || "Genel hizmet"}`;

            return (
              <button
                className={selectedConversation?.id === conversation.id ? "conversation-item active" : "conversation-item"}
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversation(conversation)}
              >
                <strong>{isAdmin || isBarber ? conversation.userFullName : conversation.barberFullName}</strong>
                <span>{secondaryLabel}</span>
                <small>{conversation.lastMessage || "Konusma baslatildi"}</small>
                {conversation.unreadCount > 0 && <em>{conversation.unreadCount}</em>}
              </button>
            );
          })}
        </aside>

        <section className="chat-panel">
          <header className="chat-header">
            <div>
              <span className="muted">Aktif konusma</span>
              <strong>{selectedTitle}</strong>
            </div>
          </header>

          <div className="message-list">
            {!selectedConversation && (
              <div className="empty-chat">
                <MessageCircle size={28} />
                <span>Mesajlari gormek icin konusma sec.</span>
              </div>
            )}
            {messages.map((message) => (
              <article className={message.isMine ? "message-bubble mine" : "message-bubble"} key={message.id}>
                <span>{message.senderFullName}</span>
                <p>{message.content}</p>
                <small>{new Date(message.createdAt).toLocaleString("tr-TR")}</small>
              </article>
            ))}
          </div>

          <form className="message-form" onSubmit={handleSend}>
            <input
              aria-label="Mesaj"
              placeholder={selectedConversation ? "Mesaj yaz..." : "Once konusma sec"}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={!selectedConversation}
            />
            <Button type="submit" disabled={!selectedConversation || !content.trim()}>
              <Send size={17} />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
