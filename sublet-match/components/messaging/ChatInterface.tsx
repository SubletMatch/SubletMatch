import { Message } from "@/lib/services/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
  otherUser: {
    id: string;
    username: string;
  };
}

export function ChatInterface({
  messages,
  onSendMessage,
  currentUserId,
  otherUser,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`/avatars/${otherUser.id}.png`} />
              <AvatarFallback>
                {otherUser.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{otherUser.username}</h3>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`/avatars/${otherUser.id}.png`} />
            <AvatarFallback>
              {otherUser.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{otherUser.username}</h3>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex w-full ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-3 shadow-md border text-sm break-words
                    ${
                      isCurrentUser
                        ? "bg-black text-white border-black rounded-br-none"
                        : "bg-gray-100 text-black border-gray-300 rounded-bl-none"
                    }`}
                  style={{
                    marginLeft: isCurrentUser ? "auto" : 0,
                    marginRight: isCurrentUser ? 0 : "auto",
                  }}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block text-right">
                    {formatDistanceToNow(new Date(message.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
