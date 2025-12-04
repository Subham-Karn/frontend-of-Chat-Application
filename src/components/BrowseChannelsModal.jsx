import { Search, Users, User, Hash, X, Calendar, MessageSquare } from "lucide-react";
import { useState } from "react";

const BrowseChannelsModal = ({ 
  isOpen, 
  onClose, 
  channels, 
  onJoinChannel,
  joinedChannels = []
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredChannels = channels.filter(channel => {
    if (!channel) return false;
    
    const channelName = channel.channelName || channel.name || "";
    const description = channel.channel_description || channel.description || "";
    const search = searchQuery.toLowerCase();
    
    return (
      channelName.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });

  const isJoined = (channelId) => joinedChannels.includes(channelId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500 rounded-lg shadow">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Browse All Channels</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Discover and join channels to start conversations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {filteredChannels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredChannels.map((channel) => {
                if (!channel) return null;
                
                const channelName = channel.channelName || channel.name || "Unnamed";
                const description = channel.channel_description || channel.description || "No description";
                const createdBy = channel.createdBy || {};
                const members = channel.members || [];
                const joined = isJoined(channel._id);
                const createdAt = channel.createdAt ? new Date(channel.createdAt) : null;

                return (
                  <div
                    key={channel._id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-yellow-300 group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Channel Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                        joined 
                          ? 'bg-linear-to-br from-yellow-500 to-yellow-600 text-white' 
                          : 'bg-linear-to-br from-yellow-100 to-yellow-200 text-yellow-700'
                      }`}>
                        <Hash size={22} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Channel Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 truncate text-lg">
                                #{channelName}
                              </h3>
                              {joined && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Joined
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Users size={14} />
                                <span>{members.length} members</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar size={14} />
                                <span>{createdAt ? createdAt.toLocaleDateString() : "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                          {description}
                        </p>
                        
                        {/* Creator Info and Join Button */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-linear-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-sm">
                              <User size={14} className="text-gray-700" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">
                                {createdBy.fullName || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Creator
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => onJoinChannel(channel._id)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                              joined
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow hover:shadow-md"
                            }`}
                          >
                            {joined ? '✓ Joined' : 'Join Channel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-linear-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare size={36} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {searchQuery ? "No matching channels found" : "No channels available"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {searchQuery 
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Be the first to create a channel and start the conversation!"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{filteredChannels.length}</span> of{" "}
              <span className="font-semibold text-gray-800">{channels.length}</span> channels
              {searchQuery && " match your search"}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  onClose();
                }}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseChannelsModal;