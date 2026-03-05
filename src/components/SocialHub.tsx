import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, MessageSquare, Users, Send, UserPlus, Check, UserPlus2 } from 'lucide-react';
import { InviteFriends } from './InviteFriends';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

interface ChatUser {
  id: number;
  name: string;
  email: string;
  status?: string;
}

interface Message {
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

export function SocialHub({ currentUser }: { currentUser: any }) {
  const { token } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [friends, setFriends] = useState<ChatUser[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [friendTyping, setFriendTyping] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentUser || !token) return;

    // Connect to WebSocket
    socketRef.current = io();
    socketRef.current.emit('join', currentUser.id);

    socketRef.current.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('user_typing', (data: { sender_id: number }) => {
      if (selectedFriend && data.sender_id === selectedFriend.id) {
        setFriendTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setFriendTyping(false), 3000);
      }
    });

    // Fetch users and friends
    fetchUsers();
    fetchFriends();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser, selectedFriend, token]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !selectedFriend) return;
    
    socketRef.current.emit('typing', {
      sender_id: currentUser.id,
      receiver_id: selectedFriend.id
    });
  };

  useEffect(() => {
    if (selectedFriend && token) {
      fetchMessages(selectedFriend.id);
    }
  }, [selectedFriend, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const data = await safeFetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(data.filter((u: any) => u.id !== currentUser.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriends = async () => {
    try {
      const data = await safeFetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFriends(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (friendId: number) => {
    try {
      const data = await safeFetch(`/api/messages/${friendId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addFriend = async (friendId: number) => {
    try {
      await safeFetch('/api/friends', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friend_id: friendId })
      });
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedFriend || !socketRef.current) return;

    const msg = {
      sender_id: currentUser.id,
      receiver_id: selectedFriend.id,
      content: newMessage,
      created_at: new Date().toISOString()
    };

    socketRef.current.emit('send_message', msg);
    setNewMessage('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[600px]">
      <InviteFriends isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <div className="clean-card p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-black flex items-center gap-2 text-white tracking-tight">
            <Users size={20} className="text-accent" />
            Investor Network
          </h4>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="p-2 bg-logo-gradient text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/10"
            title="Invite Friends"
          >
            <UserPlus2 size={18} />
          </button>
        </div>
          <div className="space-y-2 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white">
                    {u.name[0]}
                  </div>
                  <span className="text-xs font-bold text-white/60">{u.name}</span>
                </div>
                {friends.some(f => f.id === u.id) ? (
                  <Check size={14} className="text-accent" />
                ) : (
                  <button onClick={() => addFriend(u.id)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <UserPlus size={14} className="text-white/20" />
                  </button>
                )}
              </div>
            ))}
          </div>

        <div className="flex-1 flex flex-col min-h-0">
          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Your Connections</h4>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {friends.map(f => (
              <button 
                key={f.id} 
                onClick={() => setSelectedFriend(f)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${selectedFriend?.id === f.id ? 'bg-logo-gradient text-white border-transparent shadow-lg shadow-blue-500/10' : 'hover:bg-white/5 border-transparent text-white/60'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedFriend?.id === f.id ? 'bg-white/20' : 'bg-white/10'}`}>
                  {f.name[0]}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">{f.name}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${selectedFriend?.id === f.id ? 'text-white/40' : 'text-white/20'}`}>Online</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-2 clean-card p-0 flex flex-col overflow-hidden">
        {selectedFriend ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
              <div className="w-12 h-12 rounded-2xl bg-logo-gradient flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/10">
                {selectedFriend.name[0]}
              </div>
              <div>
                <div className="font-black text-white tracking-tight">{selectedFriend.name}</div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Active Now</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${m.sender_id === currentUser.id ? 'bg-logo-gradient text-white shadow-lg shadow-blue-500/10 rounded-tr-none' : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'}`}>
                    {m.content}
                    <div className={`text-[8px] font-black uppercase tracking-widest mt-2 ${m.sender_id === currentUser.id ? 'text-white/40' : 'text-white/20'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {friendTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 px-4 py-2 rounded-full flex gap-1 items-center">
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
              <input 
                type="text" 
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder={`Secure message to ${selectedFriend.name}...`}
                className="flex-1 input-field"
              />
              <button 
                onClick={sendMessage} 
                className="p-4 bg-logo-gradient text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-white/10 mb-8">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-4">Institutional Network Hub</h3>
            <p className="text-sm font-medium text-white/40 max-w-sm leading-relaxed">
              Select a connection from your network to initiate secure institutional communication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
