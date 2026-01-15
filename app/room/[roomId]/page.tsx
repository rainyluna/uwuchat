"use client"

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface ChatMessage {
    id: string
    sender: string
    text: string
    timestamp: number
    roomId: string
    type?: string
}

export default function RoomPage() {
    const params = useParams()
    const roomId = params.roomId as string

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputValue, setInputValue] = useState("")
    const [username, setUsername] = useState("")
    const [isConnected, setIsConnected] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const storedUsername = localStorage.getItem("username")
        if (storedUsername) {
            setUsername(storedUsername)
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])
    useEffect(() => {
        if (!roomId) return
        fetch(`/api/rooms/${roomId}/messages`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data)
                }
            })
            .catch(err => console.error("Failed to fetch messages:", err))
        const eventSource = new EventSource(`/api/rooms/${roomId}/stream`)

        eventSource.onopen = () => {
            console.log("SSE connected")
            setIsConnected(true)
        }

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'connected') {
                    console.log("Connected to room:", data.roomId)
                    return
                }
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev
                    return [...prev, data]
                })
            } catch (err) {
                console.error("Failed to parse message:", err)
            }
        }

        eventSource.onerror = (err) => {
            console.error("SSE error:", err)
            setIsConnected(false)
        }

        return () => {
            eventSource.close()
            setIsConnected(false)
        }
    }, [roomId])

    const sendMessage = async () => {
        if (!inputValue.trim() || !username) return

        try {
            await fetch(`/api/rooms/${roomId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender: username,
                    text: inputValue.trim()
                })
            })
            setInputValue("")
        } catch (err) {
            console.error("Failed to send message:", err)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="background-home h-screen w-screen flex flex-col text-white">
            {/* Header */}
            <div className="flex flex-col p-4 background-mirror z-10 shrink-0">
                <h1 className="text-xl font-bold text-center font-mono">
                    Room: {roomId} - {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </h1>
                <p className="text-sm text-center opacity-50 font-mono">Chatting as: {username || "Anonymous"}</p>
            </div>

            {/* Messages Area */}
            <div className="background-mirror flex-1 overflow-y-auto p-4 flex flex-col gap-2 z-10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="self-center text-white/50 font-mono">
                        No messages yet. Say hi! (◡‿◡✿)
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`max-w-[80%] ${msg.sender === username ? 'self-end' : 'self-start'}`}
                    >
                        <div className="text-sm opacity-50 mb-1 font-mono">
                            {msg.sender === username ? 'you' : msg.sender}
                        </div>
                        <div className={`backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10 ${msg.sender === username
                            ? 'bg-purple-500/40 rounded-tr-sm'
                            : 'bg-black/40 rounded-tl-sm'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 background-mirror z-10 shrink-0">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        placeholder="Message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-black/40 border-none outline-none rounded-full px-4 py-2 text-white placeholder-white/50 focus:ring-1 focus:ring-white/30 transition-all font-mono"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim()}
                        className="px-6 py-2 rounded-full bg-purple-500/60 hover:bg-purple-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

