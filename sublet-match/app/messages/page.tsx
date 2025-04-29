"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Building, ChevronLeft, LogOut, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    },
    listing: "Spacious 1BR in Downtown",
    lastMessage: "Hi, I'm interested in your apartment in New York. Is it still available for the dates listed?",
    lastMessageTime: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    user: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
    },
    listing: "Spacious 1BR in Downtown",
    lastMessage: "Hello, I was wondering if the price is negotiable for a longer stay?",
    lastMessageTime: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    user: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=40&width=40&text=EW",
    },
    listing: "Spacious 1BR in Downtown",
    lastMessage: "Is parking included with the apartment?",
    lastMessageTime: "3 days ago",
    unread: false,
  },
]

// Mock data for messages in a conversation
const mockMessages = [
  {
    id: 1,
    sender: "Sarah Johnson",
    senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
    content: "Hi, I'm interested in your apartment in New York. Is it still available for the dates listed?",
    timestamp: "2 hours ago",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    senderAvatar: "/placeholder.svg?height=40&width=40&text=You",
    content: "Yes, it's still available for the entire period from June 1 to August 31.",
    timestamp: "1 hour ago",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Sarah Johnson",
    senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
    content:
      "Great! I'm looking for a place for the summer while I'm interning in the city. Does the apartment have air conditioning?",
    timestamp: "1 hour ago",
    isOwn: false,
  },
  {
    id: 4,
    sender: "You",
    senderAvatar: "/placeholder.svg?height=40&width=40&text=You",
    content:
      "Yes, it has central air conditioning and heating. The building also has a rooftop terrace that you can use during the summer.",
    timestamp: "45 minutes ago",
    isOwn: true,
  },
  {
    id: 5,
    sender: "Sarah Johnson",
    senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
    content: "That sounds perfect! Is it possible to schedule a virtual tour sometime this week?",
    timestamp: "30 minutes ago",
    isOwn: false,
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      // In a real app, we would send the message to the server
      setNewMessage("")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6 text-primary" />
            <span>SubletMatch</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-80 border-r md:block">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h2 className="font-semibold">Messages</h2>
            </div>
            <ScrollArea className="flex-1">
              {mockConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 ${
                    selectedConversation.id === conversation.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={conversation.user.avatar || "/placeholder.svg"}
                          alt={conversation.user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {conversation.unread && (
                        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{conversation.user.name}</h3>
                        <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">Re: {conversation.listing}</p>
                      <p className="text-sm truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </aside>
        <main className="flex-1 flex flex-col">
          <div className="border-b p-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img
                  src={selectedConversation.user.avatar || "/placeholder.svg"}
                  alt={selectedConversation.user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{selectedConversation.user.name}</h3>
                <p className="text-xs text-muted-foreground">Re: {selectedConversation.listing}</p>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${message.isOwn ? "flex-row-reverse" : ""}`}>
                    <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={message.senderAvatar || "/placeholder.svg"}
                        alt={message.sender}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
