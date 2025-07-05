'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';

interface Message {
  id: string;
  content: string;
  sender: {
    firstName: string;
    lastName: string;
    role: string;
  };
  timestamp: string;
}

interface ChatProps {
  ticketId: string;
  messages: Message[];
  onNewMessage: (message: Message) => void;
}

export default function LiveChat({ ticketId, messages, onNewMessage }: ChatProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      ticketId,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      // In a real implementation, this would send via WebSocket
      // For now, we'll simulate it with a timeout
      const simulatedMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: {
          firstName: user?.firstName || 'You',
          lastName: user?.lastName || '',
          role: user?.role || 'CUSTOMER'
        },
        timestamp: new Date().toISOString()
      };

      onNewMessage(simulatedMessage);
      setNewMessage('');

      // Simulate admin response after 2 seconds
      setTimeout(() => {
        const adminResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Thank you for your message. Our team is reviewing your request and will respond shortly.',
          sender: {
            firstName: 'Support',
            lastName: 'Team',
            role: 'ADMIN'
          },
          timestamp: new Date().toISOString()
        };
        onNewMessage(adminResponse);
      }, 2000);

    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-96">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Chat Support</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender.role === 'ADMIN' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender.role === 'ADMIN'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-semibold">
                    {message.sender.firstName} {message.sender.lastName}
                  </span>
                  <span className="text-xs opacity-75">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-semibold">Support is typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
