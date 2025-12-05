import { Loader2, Plus, MessageSquare, Users, LogOut, Search, Hash, User, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createChannel, fetchChannels } from "../api";
import BrowseChannelsModal from "../components/BrowseChannelsModal";
import CreateChannelModal from "../components/CreateChannelModal";
import ChannelCard from "../components/ChannelCard";
import { useNavigate } from "react-router-dom";
import { connectSocket, getSocket, disconnectSocket } from "../socket";

const Chat = () => {
  const [isShowCreateChannel, setIsShowCreateChannel] = useState(false);
  const [isShowBrowseChannels, setIsShowBrowseChannels] = useState(false);
  const [channels, setChannels] = useState([]);
  const [channelData, setChannelData] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [channelLoading, setChannelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [joinedChannels, setJoinedChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        setChannelLoading(true);
        const res = await fetchChannels();
        let channelsData = [];
        if (Array.isArray(res?.data)) channelsData = res.data;
        else if (res?.data?.channels) channelsData = res.data.channels;
        else if (Array.isArray(res)) channelsData = res;
        else if (res?.channels) channelsData = res.channels;
        setChannels(channelsData || []);
      } catch (error) {
        setChannels([]);
      } finally {
        setChannelLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;
    const s = connectSocket(token, user.fullName || user.username || "User");

    s.on("connect", () => {});
    s.on("channel-messages", (msgs) => {
      setMessages(msgs || []);
    });
    s.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    s.on("channel-created", (ch) => {
      setChannels((prev) => [...prev, ch]);
    });
    s.on("connect_error", (err) => {
      if (err.message && err.message.toLowerCase().includes("auth")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        disconnectSocket();
        navigate("/login");
      }
    });

    return () => {
      s.off("connect");
      s.off("channel-messages");
      s.off("new-message");
      s.off("channel-created");
      s.off("connect_error");
    };
    // eslint-disable-next-line
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    disconnectSocket();
    navigate("/login");
  };

  const handleCreateChannel = async () => {
    const name = channelData.name.trim();
    if (!name) return;
    const payload = { channelName: name, description: channelData.description.trim() || "No description" };
    try {
      setIsLoading(true);
      const res = await createChannel(payload);
      alert(res?.data?.message || "Channel created successfully");
      const newChannelData = res?.data?.channel || res?.data || res;
      if (newChannelData) {
        setChannels((prev) => [...prev, newChannelData]);
        handleJoinChannel(newChannelData._id);
      }
      setChannelData({ name: "", description: "" });
      setIsShowCreateChannel(false);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message;
      alert(msg || "Failed to create channel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChannel = (channelId) => {
    setSelectedChannel(channelId);
    if (!joinedChannels.includes(channelId)) {
      setJoinedChannels((prev) => [...prev, channelId]);
    }
    const socket = getSocket();
    if (socket && channelId) {
      socket.emit("join-channel", { channelId });
    }
    setIsShowBrowseChannels(false);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChannel) return;
    const socket = getSocket();
    const payload = {
      channelId: selectedChannel,
      text: messageText.trim(),
      senderName: user?.fullName || user?.username || "Unknown",
    };
    if (socket) {
      socket.emit("send-message", payload);
      setMessageText("");
    }
  };

  const filteredChannels = channels.filter((channel) => {
    if (!channel) return false;
    const channelName = channel.channelName || channel.name || "";
    const description = channel.channel_description || channel.description || "";
    const search = searchQuery.toLowerCase();
    return channelName.toLowerCase().includes(search) || description.toLowerCase().includes(search);
  });

  const selectedChannelData = channels.find((ch) => ch && ch._id === selectedChannel);

  // Check if message is from current user
  const isCurrentUserMessage = (message) => {
    // Compare by sender ID if available, otherwise by sender name
    if (message.senderId) {
      return message.senderId === user?._id;
    }
    if (message.senderName) {
      return message.senderName === user?.fullName || message.senderName === user?.username;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
              <p className="text-sm text-gray-600">Connect and collaborate with your team</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden sm:block relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShowBrowseChannels(true)}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-sm font-medium rounded-lg transition-all shadow hover:shadow-md"
              >
                Browse All
              </button>

              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-linear-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block">
                  <div className="font-medium text-gray-900">{user?.fullName || "User"}</div>
                  <div className="text-xs text-gray-500">@{user?.email?.split('@')[0] || "username"}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Your Channels</h2>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {joinedChannels.length}
                </span>
              </div>
              <button
                onClick={() => setIsShowCreateChannel(true)}
                className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-sm font-medium rounded-lg transition-all shadow hover:shadow-md"
              >
                <Plus size={16} />
                New
              </button>
            </div>
          </div>

          <div className="p-4">
            {channelLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-yellow-500" />
              </div>
            ) : filteredChannels.length > 0 ? (
              <div className="space-y-3">
                {filteredChannels.slice(0, 3).map((ch) => (
                  <ChannelCard
                    key={ch._id}
                    channel={ch}
                    isSelected={selectedChannel === ch._id}
                    isJoined={joinedChannels.includes(ch._id)}
                    onJoin={() => handleJoinChannel(ch._id)}
                    onClick={() => handleJoinChannel(ch._id)}
                  />
                ))}
                <button
                  onClick={() => setIsShowBrowseChannels(true)}
                  className="w-full mt-2 px-4 py-3 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-lg transition-all shadow hover:shadow-md"
                >
                  Browse All Channels
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium">No channels found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? "Try a different search term" : "Get started by creating a channel"}
                </p>
                <div className="flex flex-col gap-3 mt-4 justify-center">
                  <button
                    onClick={() => setIsShowCreateChannel(true)}
                    className="px-4 py-2.5 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-lg transition-all"
                  >
                    Create Channel
                  </button>
                  <button
                    onClick={() => setIsShowBrowseChannels(true)}
                    className="px-4 py-2.5 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-lg transition-all"
                  >
                    Browse All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-180px)]">
          {selectedChannel && selectedChannelData ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow">
                    <Hash size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      #{selectedChannelData.channelName || selectedChannelData.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created by {selectedChannelData.createdBy?.fullName || "Unknown"}</span>
                      <span>•</span>
                      <span>{(selectedChannelData.members || []).length} members</span>
                      <span>•</span>
                      <span className="text-green-600 font-medium">Joined</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-linear-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <MessageSquare size={24} className="text-yellow-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Welcome to #{selectedChannelData.channelName || selectedChannelData.name}!
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">You've joined this channel. Start the conversation!</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Channel created on {selectedChannelData.createdAt ? new Date(selectedChannelData.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isCurrentUser = isCurrentUserMessage(message);
                      return (
                        <div
                          key={message._id || Math.random()}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                              isCurrentUser
                                ? 'bg-linear-to-r from-yellow-500 to-yellow-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-900 rounded-tl-none'
                            }`}
                          >
                            {!isCurrentUser && (
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                {message.senderName || "Unknown User"}
                              </div>
                            )}
                            <div className={`text-sm ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                              {message.text}
                            </div>
                            <div className={`text-xs mt-2 flex justify-end ${isCurrentUser ? 'text-yellow-100' : 'text-gray-500'}`}>
                              {message.createdAt 
                                ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Just now'
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm"
                    placeholder="Type your message here..."
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      messageText.trim()
                        ? 'bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-24 h-24 bg-linear-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare size={40} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a Channel</h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                Choose a channel from the list to start chatting with your team members.
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsShowCreateChannel(true)} 
                  className="px-6 py-3 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-lg transition-all shadow hover:shadow-md"
                >
                  Create Channel
                </button>
                <button 
                  onClick={() => setIsShowBrowseChannels(true)} 
                  className="px-6 py-3 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-lg transition-all shadow hover:shadow-md"
                >
                  Browse All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BrowseChannelsModal
        isOpen={isShowBrowseChannels}
        onClose={() => setIsShowBrowseChannels(false)}
        channels={channels}
        onJoinChannel={handleJoinChannel}
        joinedChannels={joinedChannels}
      />

      <CreateChannelModal
        isOpen={isShowCreateChannel}
        onClose={() => setIsShowCreateChannel(false)}
        channelData={channelData}
        setChannelData={setChannelData}
        onCreateChannel={handleCreateChannel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Chat;