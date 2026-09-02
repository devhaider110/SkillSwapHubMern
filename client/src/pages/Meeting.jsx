import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMeetingDetails, updateSessionStatus } from '../services/api';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Maximize, Minimize, Users } from 'lucide-react';

const Meeting = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await getMeetingDetails(id);
        setMeetingUrl(res.data.meetingUrl);
        setSession(res.data.session);
      } catch (err) {
        setError('Failed to load meeting details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  const handleLeave = async () => {
    // End session if live
    if (session?.status === 'live') {
      try {
        await updateSessionStatus(id, 'completed');
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    }
    navigate('/sessions');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading meeting...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center text-rose-400">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate('/sessions')}
            className="px-4 py-2 mt-4 text-white bg-indigo-600 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Meeting Header */}
      <div className="flex items-center justify-between p-3 text-white bg-slate-800">
        <div>
          <h2 className="text-lg font-semibold">{session?.title || 'Learning Session'}</h2>
          <p className="text-sm text-slate-400">{session?.skill} • {session?.teacher?.name} ↔ {session?.learner?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs ${session?.status === 'live' ? 'bg-emerald-500' : 'bg-yellow-500'}`}>
            {session?.status === 'live' ? '🔴 Live' : 'Scheduled'}
          </span>
        </div>
      </div>

      {/* Jitsi Iframe */}
      <div className="relative flex-1 bg-black">
        {meetingUrl && (
          <iframe
            ref={iframeRef}
            src={`${meetingUrl}#config.startWithAudioMuted=${isMuted}&config.startWithVideoMuted=${isVideoOff}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full border-0"
            title="Video Meeting"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 p-4 bg-slate-800">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full ${isMuted ? 'bg-rose-600' : 'bg-slate-600'} hover:bg-slate-500 transition`}
        >
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-3 rounded-full ${isVideoOff ? 'bg-rose-600' : 'bg-slate-600'} hover:bg-slate-500 transition`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-3 transition rounded-full bg-slate-600 hover:bg-slate-500"
        >
          {isFullscreen ? <Minimize className="w-6 h-6 text-white" /> : <Maximize className="w-6 h-6 text-white" />}
        </button>
        <button
          onClick={handleLeave}
          className="p-3 transition rounded-full bg-rose-600 hover:bg-rose-700"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-1 ml-4 text-sm text-slate-400">
          <Users className="w-4 h-4" />
          <span>2</span>
        </div>
      </div>
    </div>
  );
};

export default Meeting;