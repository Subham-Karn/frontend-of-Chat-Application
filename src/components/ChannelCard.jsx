import { Hash, Users, User, Calendar, MessageSquare } from "lucide-react";

const ChannelCard = ({ 
  channel, 
  isSelected, 
  isJoined, 
  onJoin, 
  onClick 
}) => {
  if (!channel) return null;
  
  const channelName = channel.channelName || channel.name || "Unnamed";
  const description = channel.channel_description || channel.description || "No description";
  const createdBy = channel.createdBy || {};
  const members = channel.members || [];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-yellow-500 bg-yellow-50 shadow-sm' 
          : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isSelected 
            ? 'bg-yellow-500 text-white' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          <Hash size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {channelName}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {description}
              </p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {channel.createdAt ? new Date(channel.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users size={14} />
                <span>{members.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={10} className="text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {createdBy.fullName || "Unknown"}
                </span>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isJoined
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isJoined ? 'Joined' : 'Join'}
            </button>
          </div>
          
          {channel.lastMessage && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare size={12} />
                <span className="truncate">{channel.lastMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;