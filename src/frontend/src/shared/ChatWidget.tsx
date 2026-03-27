import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { useSendMessage, useTripMessages } from "../hooks/useQueries";

interface Props {
  tripId: bigint | null;
}

export default function ChatWidget({ tripId }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { data: messages = [] } = useTripMessages(tripId);
  const sendMessage = useSendMessage();

  const handleSend = () => {
    if (!text.trim() || tripId === null) return;
    sendMessage.mutate({ tripId, message: text.trim() });
    setText("");
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {open && (
        <div
          className="mb-3 w-72 bg-card rounded-2xl shadow-modal overflow-hidden"
          data-ocid="chat.panel"
        >
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm">Chat del Viaje</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              data-ocid="chat.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div
                className="text-center text-xs text-muted-foreground py-8"
                data-ocid="chat.empty_state"
              >
                No hay mensajes aún
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id.toString()}
                  className="bg-muted rounded-xl px-3 py-2"
                >
                  <p className="text-xs text-foreground">{m.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border p-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe un mensaje..."
              className="flex-1 text-xs border border-border rounded-xl px-3 py-2 outline-none bg-background"
              data-ocid="chat.input"
            />
            <button
              type="button"
              onClick={handleSend}
              className="bg-primary text-primary-foreground rounded-xl p-2"
              data-ocid="chat.submit_button"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-modal flex items-center justify-center"
        data-ocid="chat.open_modal_button"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
