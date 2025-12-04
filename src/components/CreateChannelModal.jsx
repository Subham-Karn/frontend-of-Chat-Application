import { Plus, X, Loader2, Hash } from "lucide-react";

const CreateChannelModal = ({ 
  isOpen, 
  onClose, 
  channelData, 
  setChannelData, 
  onCreateChannel, 
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
      ></div>
      
      <div className="relative bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Channel</h2>
                <p className="text-sm text-gray-600">Start a new conversation</p>
              </div>
            </div>
            <button
              onClick={() => !isLoading && onClose()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Hash size={16} />
                  Channel Name *
                </span>
              </label>
              <input
                type="text"
                value={channelData.name}
                onChange={(e) =>
                  setChannelData({ ...channelData, name: e.target.value })
                }
                placeholder="e.g. project-discussion"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">This cannot be changed later</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={channelData.description}
                onChange={(e) =>
                  setChannelData({
                    ...channelData,
                    description: e.target.value,
                  })
                }
                placeholder="What is this channel about?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                disabled={isLoading}
              ></textarea>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Channel Guidelines</h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Keep channel names descriptive but short</li>
                <li>• Add a clear description for new members</li>
                <li>• Be respectful of all participants</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCreateChannel}
              disabled={isLoading || !channelData.name.trim()}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isLoading
                  ? "bg-gray-300 text-gray-500"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              } ${!channelData.name.trim() && "opacity-50 cursor-not-allowed"}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Channel"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;