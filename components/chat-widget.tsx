"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const quickReplies = [
  "What services do you offer?",
  "How can I book an appointment?",
  "What are your consultation fees?",
  "Do you offer online consultations?",
]

const responses: Record<string, string> = {
  "What services do you offer?": "I offer a range of services including weight management, metabolic health optimization, gut health improvement, prenatal nutrition, heart health, and sports nutrition. Each plan is personalized to your unique needs!",
  "How can I book an appointment?": "You can book an appointment by clicking the 'Book Consultation' button on this website, or send me a message with your preferred date and time!",
  "What are your consultation fees?": "My consultation fees vary based on the type of service. Initial consultations start at $150. Contact me for a detailed pricing guide!",
  "Do you offer online consultations?": "Yes! I offer both in-person and online consultations via video call. Online sessions are perfect for clients who prefer the convenience of meeting from home.",
}

interface Message {
  id: number
  text: string
  isUser: boolean
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi there! How can I help you today?", isUser: false },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleQuickReply = (reply: string) => {
    const userMessage: Message = { id: Date.now(), text: reply, isUser: true }
    const botResponse: Message = {
      id: Date.now() + 1,
      text: responses[reply] || "Thanks for your message! I'll get back to you soon.",
      isUser: false,
    }
    setMessages((prev) => [...prev, userMessage, botResponse])
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    const userMessage: Message = { id: Date.now(), text: inputValue, isUser: true }
    const botResponse: Message = {
      id: Date.now() + 1,
      text: "Thanks for reaching out! I'll respond to your message shortly. In the meantime, feel free to explore my services or book a consultation.",
      isUser: false,
    }
    setMessages((prev) => [...prev, userMessage, botResponse])
    setInputValue("")
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-primary-foreground">Chat Support</p>
                  <p className="text-xs text-primary-foreground/70">Usually replies instantly</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      message.isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.slice(0, 2).map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 text-xs rounded-full border border-border hover:bg-secondary transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="rounded-full"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  className="rounded-full shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
