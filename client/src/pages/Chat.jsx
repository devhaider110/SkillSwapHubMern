import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { getOrCreateConversation, uploadChatMedia } from '../services/api';
import {
  ArrowLeft, Download, FileText, Loader2, Mic, MicOff,
  MoreVertical, Paperclip, Phone, PhoneOff, Send, Smile, User, Video,
  VideoOff, X
} from 'lucide-react';

const EMOJIS = [
  '😀','😂','😍','🥰','😘','😊','😎','🤔','😭','😢','😡','🤗','🥳','🤩','😴','😇',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','🔥','✨','⭐','👍','👎','👏','🙏',
  '🎉','💯','🙌','🤝','👀','💪','🌹','🥺','😅','🤣','😏','🤔','😌','😉','🫶','❤️‍🔥'
];

const formatBytes = (bytes = 0) => {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

const CallOverlay = ({ socket, user, otherUser, online, incomingCall, setIncomingCall, callRequest, clearCallRequest }) => {
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const callRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const cleanup = () => {
    if (peerRef.current) peerRef.current.close();
    peerRef.current = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    callRef.current = null;
    pendingCandidatesRef.current = [];
    setCall(null);
    setCallStatus('');
    setMuted(false);
    setCameraOff(false);
  };

  useEffect(() => {
    if (!socket) return undefined;

    const onIncoming = (data) => {
      if (callRef.current) {
        socket.emit('reject-call', { toUserId: data.fromUserId, callId: data.callId });
        return;
      }
      setIncomingCall(data);
    };

    const onAccepted = async ({ answer, callId }) => {
      if (!peerRef.current || callRef.current?.callId !== callId) return;
      try {
        await peerRef.current.setRemoteDescription(answer);
        setCallStatus('Connected');
        for (const candidate of pendingCandidatesRef.current.splice(0)) {
          await peerRef.current.addIceCandidate(candidate);
        }
      } catch (error) {
        console.error('Failed to set call answer:', error);
      }
    };

    const onIce = async ({ candidate, callId }) => {
      if (!candidate || callRef.current?.callId !== callId) return;
      if (!peerRef.current?.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }
      try {
        await peerRef.current.addIceCandidate(candidate);
      } catch (error) {
        console.warn('ICE candidate error:', error);
      }
    };

    const onRejected = ({ callId }) => {
      if (callRef.current?.callId !== callId) return;
      setCallStatus('Call declined');
      setTimeout(cleanup, 900);
    };

    const onEnded = ({ callId }) => {
      if (callRef.current?.callId !== callId) return;
      cleanup();
    };

    const onFailed = ({ message }) => {
      if (callRef.current) {
        setCallStatus(message || 'Call failed');
        setTimeout(cleanup, 1200);
      }
    };

    socket.on('incoming-call', onIncoming);
    socket.on('call-accepted', onAccepted);
    socket.on('ice-candidate', onIce);
    socket.on('call-rejected', onRejected);
    socket.on('call-ended', onEnded);
    socket.on('call-error', onFailed);

    return () => {
      socket.off('incoming-call', onIncoming);
      socket.off('call-accepted', onAccepted);
      socket.off('ice-candidate', onIce);
      socket.off('call-rejected', onRejected);
      socket.off('call-ended', onEnded);
      socket.off('call-error', onFailed);
    };
  }, [socket, setIncomingCall]);

  useEffect(() => () => cleanup(), []);

  useEffect(() => {
    if (!callRequest) return;
    startCall(callRequest);
    clearCallRequest();
  }, [callRequest]);

  const createPeer = (callData, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };
    peer.onicecandidate = (event) => {
      if (event.candidate && callData?.toUserId) {
        socket.emit('ice-candidate', {
          toUserId: callData.toUserId,
          candidate: event.candidate,
          callId: callData.callId,
        });
      }
    };
    peer.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(peer.connectionState)) {
        setCallStatus('Connection lost');
      }
    };
    peerRef.current = peer;
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return peer;
  };

  const getMedia = async (type) => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
    } catch (error) {
      console.error('Media permission error:', error);
      throw new Error('Microphone/camera permission is required for calls.');
    }
  };

  const startCall = async (type) => {
    if (!socket || !otherUser?._id || !online) return;
    try {
      const stream = await getMedia(type);
      const callId = crypto.randomUUID();
      const callData = { callId, callType: type, toUserId: otherUser._id };
      callRef.current = callData;
      setCall({ ...callData, direction: 'outgoing' });
      setCallStatus('Calling…');
      const peer = createPeer(callData, stream);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('call-user', { ...callData, offer });
    } catch (error) {
      setCallStatus(error.message);
      setTimeout(cleanup, 1500);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || !socket) return;
    try {
      const stream = await getMedia(incomingCall.callType);
      const callData = {
        callId: incomingCall.callId,
        callType: incomingCall.callType,
        toUserId: incomingCall.fromUserId,
      };
      callRef.current = callData;
      setCall({ ...callData, direction: 'incoming', callerName: incomingCall.fromName });
      setCallStatus('Connecting…');
      const peer = createPeer(callData, stream);
      await peer.setRemoteDescription(incomingCall.offer);
      for (const candidate of pendingCandidatesRef.current.splice(0)) {
        await peer.addIceCandidate(candidate);
      }
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('accept-call', {
        toUserId: incomingCall.fromUserId,
        answer,
        callId: incomingCall.callId,
      });
      setIncomingCall(null);
      setCallStatus('Connected');
    } catch (error) {
      console.error('Accept call error:', error);
      socket.emit('reject-call', { toUserId: incomingCall.fromUserId, callId: incomingCall.callId });
      setIncomingCall(null);
      cleanup();
    }
  };

  const rejectIncoming = () => {
    if (incomingCall && socket) {
      socket.emit('reject-call', {
        toUserId: incomingCall.fromUserId,
        callId: incomingCall.callId,
      });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (callRef.current && socket) {
      socket.emit('end-call', {
        toUserId: callRef.current.toUserId,
        callId: callRef.current.callId,
      });
    }
    cleanup();
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraOff(!track.enabled);
  };

  return (
    <>
      {incomingCall && !call && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 text-center bg-white shadow-2xl rounded-3xl dark:bg-slate-800">
            <img
              src={incomingCall.fromProfilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(incomingCall.fromName || 'User')}&background=6366f1&color=fff&size=96`}
              className="object-cover w-24 h-24 mx-auto rounded-full"
              alt="Caller"
            />
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{incomingCall.fromName || 'Someone'}</h3>
            <p className="mt-1 text-sm text-slate-500">Incoming {incomingCall.callType === 'video' ? 'video' : 'audio'} call</p>
            <div className="flex gap-3 mt-6">
              <button onClick={rejectIncoming} className="flex-1 py-3 font-semibold text-white bg-red-500 rounded-xl">Decline</button>
              <button onClick={acceptCall} className="flex-1 py-3 font-semibold text-white rounded-xl bg-emerald-500">Accept</button>
            </div>
          </div>
        </div>
      )}

      {call && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div>
              <p className="font-semibold">{call.direction === 'incoming' ? call.callerName : otherUser?.name}</p>
              <p className="text-xs text-slate-400">{call.callType === 'video' ? 'Video call' : 'Audio call'} · {callStatus}</p>
            </div>
            <button onClick={endCall} className="p-2 rounded-full hover:bg-white/10"><X /></button>
          </div>
          <div className="relative flex items-center justify-center flex-1 overflow-hidden">
            {call.callType === 'video' ? (
              <>
                <video ref={remoteVideoRef} autoPlay playsInline className="object-contain w-full h-full" />
                <video ref={localVideoRef} autoPlay muted playsInline className="absolute object-cover bg-black border shadow-xl right-4 bottom-4 w-36 sm:w-48 rounded-2xl border-white/20 aspect-video" />
              </>
            ) : (
              <div className="text-center text-white">
                <img
                  src={otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=6366f1&color=fff&size=160`}
                  className="object-cover mx-auto rounded-full w-36 h-36"
                  alt=""
                />
                <p className="mt-4 text-lg font-semibold">{otherUser?.name || 'User'}</p>
                <audio ref={remoteVideoRef} autoPlay />
                <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 p-6">
            <button onClick={toggleMute} className="p-4 text-white rounded-full bg-white/10 hover:bg-white/20">{muted ? <MicOff /> : <Mic />}</button>
            {call.callType === 'video' && <button onClick={toggleCamera} className="p-4 text-white rounded-full bg-white/10 hover:bg-white/20">{cameraOff ? <VideoOff /> : <Video />}</button>}
            <button onClick={endCall} className="p-4 text-white bg-red-600 rounded-full hover:bg-red-700"><PhoneOff /></button>
          </div>
        </div>
      )}

      {!call && !incomingCall && null}

    </>
  );
};

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
    conversations, currentConversation, setCurrentConversation, messages, loading,
    fetchConversations, fetchMessages, sendMessage, markRead, typingUsers, onlineUsers,
  } = useChat();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callRequest, setCallRequest] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!currentConversation) return undefined;
    fetchMessages(currentConversation._id);
    markRead(currentConversation._id);
    socket?.emit('join-conversation', currentConversation._id);
    return () => socket?.emit('leave-conversation', currentConversation._id);
  }, [currentConversation, socket]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getOtherUser = (conv) => conv?.participants?.find((p) => p._id !== user?._id);
  const otherUser = getOtherUser(currentConversation);
  const isUserOnline = (id) => onlineUsers?.includes(id);
  const online = isUserOnline(otherUser?._id);

  const handleSend = () => {
    if (!input.trim() || !currentConversation) return;
    sendMessage(currentConversation._id, input.trim(), 'text');
    setInput('');
    setIsTyping(false);
    setShowEmoji(false);
    socket?.emit('stop-typing', { conversationId: currentConversation._id });
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    if (!currentConversation || !socket) return;
    if (!isTyping && value) {
      setIsTyping(true);
      socket.emit('typing', { conversationId: currentConversation._id });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', { conversationId: currentConversation._id });
    }, 1000);
  };

  const appendEmoji = (emoji) => setInput((value) => `${value}${emoji}`);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !currentConversation) return;
    if (file.size > 100 * 1024 * 1024) {
      alert('Maximum file size is 100 MB.');
      return;
    }
    try {
      setUploading(true);
      const response = await uploadChatMedia(file);
      const data = response?.data;
      if (!data?.fileUrl) throw new Error('Upload failed');
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file';
      const label = type === 'image' ? '📷 Image' : type === 'video' ? '🎬 Video' : type === 'audio' ? '🎵 Audio' : `📎 ${file.name}`;
      sendMessage(currentConversation._id, label, type, data.fileUrl, data.fileName || file.name, data.fileSize || file.size);
    } catch (error) {
      console.error('Chat upload error:', error);
      alert(error.response?.data?.message || error.message || 'Could not upload file.');
    } finally {
      setUploading(false);
    }
  };

  const startVoiceRecording = async () => {
    if (recording || !currentConversation) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      alert('Voice recording is not supported by this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((mime) => MediaRecorder.isTypeSupported(mime));
      const recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size) recordedChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (!blob.size) return;
        try {
          setUploading(true);
          const extension = (recorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
          const file = new File([blob], `voice-${Date.now()}.${extension}`, { type: blob.type || 'audio/webm' });
          const response = await uploadChatMedia(file);
          const data = response?.data;
          sendMessage(currentConversation._id, '🎤 Voice message', 'voice', data.fileUrl, file.name, file.size);
        } catch (error) {
          console.error('Voice upload error:', error);
          alert(error.response?.data?.message || 'Could not send voice message.');
        } finally {
          setUploading(false);
        }
      };
      recorder.start();
      setRecording(true);
    } catch (error) {
      alert('Microphone permission is required to record a voice message.');
    }
  };

  const stopVoiceRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const triggerCall = (type) => setCallRequest(type);

  const renderMessage = (msg) => {
    if (msg.type === 'image' && msg.fileUrl) {
      return <a href={msg.fileUrl} target="_blank" rel="noreferrer"><img src={msg.fileUrl} alt={msg.fileName || 'Shared image'} className="object-contain max-w-full max-h-72 rounded-xl" /></a>;
    }
    if (msg.type === 'video' && msg.fileUrl) {
      return <video src={msg.fileUrl} controls playsInline className="max-w-full max-h-72 rounded-xl" />;
    }
    if ((msg.type === 'audio' || msg.type === 'voice') && msg.fileUrl) {
      return <div className="min-w-[230px]"><audio src={msg.fileUrl} controls className="w-full" /><p className="mt-1 text-xs opacity-80">{msg.type === 'voice' ? 'Voice message' : msg.fileName}</p></div>;
    }
    if (msg.type === 'file' && msg.fileUrl) {
      return <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 min-w-[220px] hover:underline"><FileText className="w-8 h-8" /><span className="min-w-0"><span className="block font-medium truncate">{msg.fileName || 'Download file'}</span><span className="text-xs opacity-70">{formatBytes(msg.fileSize)} · Open / download</span></span><Download className="w-4 h-4 ml-auto" /></a>;
    }
    return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <div className="flex h-screen pt-16 bg-slate-50 dark:bg-slate-900">
      <div className={`${showSidebar ? 'w-full sm:w-80' : 'hidden sm:block sm:w-80'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700"><h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2></div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? <div className="p-4 text-center text-slate-500 dark:text-slate-400">No conversations yet. Start a new chat!</div> : conversations.map((conv) => {
            const other = getOtherUser(conv); const isOnline = isUserOnline(other?._id);
            return <div key={conv._id} onClick={() => { setCurrentConversation(conv); setShowSidebar(false); }} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${currentConversation?._id === conv._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
              <div className="relative"><img src={other?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=6366f1&color=fff&size=40`} alt={other?.name} className="object-cover w-12 h-12 rounded-full" />{isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-emerald-500 dark:border-slate-800" />}</div>
              <div className="flex-1 min-w-0"><p className="font-semibold text-slate-800 dark:text-white">{other?.name}</p><p className="text-sm truncate text-slate-500 dark:text-slate-400">{conv.lastMessage || 'No messages yet'}</p></div>
              {conv.unreadCount > 0 && <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-indigo-600 rounded-full">{conv.unreadCount}</span>}
            </div>;
          })}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!showSidebar ? 'block' : 'hidden sm:flex'}`}>
        {currentConversation ? <>
          <div className="flex items-center justify-between p-4 bg-white border-b dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowSidebar(true)} className="sm:hidden text-slate-600 dark:text-slate-300"><ArrowLeft className="w-6 h-6" /></button>
              <img src={otherUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=6366f1&color=fff&size=40`} alt={otherUser?.name} className="object-cover w-10 h-10 rounded-full" />
              <div><p className="font-semibold text-slate-800 dark:text-white">{otherUser?.name}</p><p className={`text-xs ${online ? 'text-emerald-500' : 'text-slate-400'}`}>{online ? 'Online' : 'Offline'}</p></div>
            </div>
            <div className="relative flex gap-1">
              <button disabled={!online} onClick={() => triggerCall('audio')} title="Audio call" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"><Phone className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
              <button disabled={!online} onClick={() => triggerCall('video')} title="Video call" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"><Video className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
              <button onClick={() => setShowMenu((v) => !v)} title="Chat options" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
              {showMenu && <div className="absolute right-0 z-20 w-48 overflow-hidden bg-white border shadow-xl top-11 rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <button onClick={() => { fetchMessages(currentConversation._id); setShowMenu(false); }} className="w-full px-4 py-3 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Refresh messages</button>
                {otherUser?.username && <button onClick={() => { window.location.href = `/profile/${otherUser.username}`; }} className="w-full px-4 py-3 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">View profile</button>}
                <button onClick={() => { setCurrentConversation(null); setShowMenu(false); }} className="w-full px-4 py-3 text-sm text-left text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700">Close chat</button>
              </div>}
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {loading && <div className="flex justify-center py-2"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /></div>}
            {messages.map((msg, idx) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMine = senderId === user?._id;
              const prevMsg = messages[idx - 1];
              const prevSenderId = prevMsg?.sender?._id || prevMsg?.sender;
              const showAvatar = !prevMsg || prevSenderId !== senderId;
              return <div key={msg._id || `${msg.createdAt}-${idx}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && showAvatar && <img src={msg.sender?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'User')}&background=6366f1&color=fff&size=32`} alt={msg.sender?.name} className="self-end object-cover w-8 h-8 mr-2 rounded-full" />}
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/50 dark:border-slate-600/50'}`}>
                  {renderMessage(msg)}
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}><span className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>{isMine && <span className="text-[10px]">{msg.readBy?.some((id) => String(id) === String(user._id)) ? '✓✓' : '✓'}</span>}</div>
                </div>
              </div>;
            })}
            {typingUsers[currentConversation?._id] && <div className="flex justify-start"><div className="bg-white dark:bg-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm"><div className="flex gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:200ms]" /><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:400ms]" /></div></div></div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="relative p-3 bg-white border-t dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            {showEmoji && <div className="absolute bottom-16 left-3 z-20 w-80 max-w-[calc(100vw-24px)] p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"><div className="grid grid-cols-8 gap-1 overflow-y-auto max-h-52">{EMOJIS.map((emoji, i) => <button key={`${emoji}-${i}`} onClick={() => appendEmoji(emoji)} className="text-xl p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{emoji}</button>)}</div></div>}
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt" onChange={handleFile} />
              <button disabled={uploading} onClick={() => fileInputRef.current?.click()} title="Attach file, photo, video or audio" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"><Paperclip className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
              <button onClick={() => setShowEmoji((v) => !v)} title="Emoji" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><Smile className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
              <input type="text" value={input} onChange={handleTyping} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 min-w-0 px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              {input.trim() ? <button onClick={handleSend} className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"><Send className="w-4 h-4" /></button> : <button disabled={uploading} onClick={recording ? stopVoiceRecording : startVoiceRecording} title={recording ? 'Stop recording' : 'Voice message'} className={`p-2.5 rounded-xl ${recording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200'} disabled:opacity-40`}>{recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</button>}
              {uploading && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
            </div>
            {recording && <p className="mt-1 ml-10 text-xs text-red-500">Recording… click the microphone again to send.</p>}
          </div>
        </> : <div className="flex items-center justify-center flex-1 text-slate-500 dark:text-slate-400"><div className="text-center"><User className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" /><p className="text-lg font-semibold">No conversation selected</p><p className="text-sm">Select a conversation from the sidebar</p></div></div>}
      </div>

      {socket && currentConversation && <CallOverlay socket={socket} user={user} otherUser={otherUser} online={online} incomingCall={incomingCall} setIncomingCall={setIncomingCall} callRequest={callRequest} clearCallRequest={() => setCallRequest(null)} />}
    </div>
  );
};

export default Chat;