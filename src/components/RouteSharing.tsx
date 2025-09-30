import { useState } from 'react';
import { Users, Share2, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface RouteSharingProps {
  routeId: string;
  routeName: string;
  participants: string[];
  onParticipantsUpdate: () => void;
}

export const RouteSharing: React.FC<RouteSharingProps> = ({ 
  routeId, 
  routeName, 
  participants, 
  onParticipantsUpdate 
}: RouteSharingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  const shareUrl = `${window.location.origin}/join/${routeId}`;
  const isOwner = participants.length > 0 && participants[0] === user?.id;
  const isParticipant = user && participants.includes(user.id);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleJoinRoute = async () => {
    if (!user || !joinCode.trim()) return;

    setIsJoining(true);
    setError('');

    try {
      await api.joinRoute(joinCode.trim(), user.id);
      onParticipantsUpdate();
      setJoinCode('');
      setIsOpen(false);
    } catch (error: any) {
      setError(error.message || 'Failed to join route');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoute = async () => {
    if (!user) return;

    setIsLeaving(true);
    setError('');

    try {
      await api.leaveRoute(routeId, user.id);
      onParticipantsUpdate();
      setIsOpen(false);
    } catch (error: any) {
      setError(error.message || 'Failed to leave route');
    } finally {
      setIsLeaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors flex items-center text-sm"
      >
        <Share2 className="h-4 w-4 mr-1" />
        Share Route
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Share Route
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">{routeName}</h3>
            <p className="text-sm text-gray-600">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Share Link */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Share Link</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs flex items-center"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Join Route */}
          {!isParticipant && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Join Route</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter route ID"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                />
                <button
                  onClick={handleJoinRoute}
                  disabled={!joinCode.trim() || isJoining}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          )}

          {/* Leave Route */}
          {isParticipant && !isOwner && (
            <div className="bg-red-50 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Leave Route</h4>
              <button
                onClick={handleLeaveRoute}
                disabled={isLeaving}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                {isLeaving ? 'Leaving...' : 'Leave Route'}
              </button>
            </div>
          )}

          {/* Participants List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Participants</h4>
            <div className="space-y-1">
              {participants.map((participantId, index) => (
                <div key={participantId} className="flex items-center space-x-2 text-sm">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">
                    {participantId === user?.id ? 'You' : `Guest User ${participantId.slice(-4)}`}
                    {index === 0 && ' (Owner)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-xs">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
