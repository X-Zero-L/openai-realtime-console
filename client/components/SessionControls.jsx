import { useState } from "react";
import { CloudLightning, CloudOff, MessageSquare, Send } from "react-feather";
import Button from "./Button";
import { motion, AnimatePresence } from "framer-motion";

function SessionStopped({ startSession, apiKey }) {
  const [isActivating, setIsActivating] = useState(false);
  const isApiKeyEmpty = !apiKey || apiKey.trim() === "";

  function handleStartSession(e) {
    if (e) e.preventDefault();
    
    if (isActivating || isApiKeyEmpty) return;

    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: isApiKeyEmpty ? 1 : 1.05 }}
        whileTap={{ scale: isApiKeyEmpty ? 1 : 0.95 }}
      >
        <Button
          onClick={handleStartSession}
          className={isActivating ? "bg-gray-600" : isApiKeyEmpty ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
          icon={<CloudLightning height={16} />}
          disabled={isApiKeyEmpty}
          type="button"
        >
          {isActivating ? "正在启动会话..." : "启动会话"}
        </Button>
      </motion.div>
    </div>
  );
}

function SessionActive({ stopSession, sendTextMessage }) {
  const [message, setMessage] = useState("");

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (message.trim()) {
      handleSendClientEvent();
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      <form onSubmit={handleSubmit} className="flex items-center w-full gap-4">
        <motion.input
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim()) {
              e.preventDefault();
              handleSendClientEvent();
            }
          }}
          type="text"
          placeholder="发送文本消息..."
          className="border border-gray-300 rounded-full p-4 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: message.trim() ? 1.05 : 1 }}
          whileTap={{ scale: message.trim() ? 0.95 : 1 }}
        >
          <Button
            type="submit"
            icon={<Send height={16} />}
            className={`${message.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"}`}
            disabled={!message.trim()}
          >
            发送
          </Button>
        </motion.div>
      </form>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={stopSession} 
          icon={<CloudOff height={16} />}
          className="bg-red-600 hover:bg-red-700"
        >
          断开连接
        </Button>
      </motion.div>
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  sendClientEvent,
  sendTextMessage,
  serverEvents,
  isSessionActive,
  apiKey
}) {
  return (
    <div className="flex gap-4 border-t-2 border-gray-100 h-full rounded-md">
      <AnimatePresence mode="wait">
        {isSessionActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SessionActive
              stopSession={stopSession}
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              serverEvents={serverEvents}
            />
          </motion.div>
        ) : (
          <motion.div
            key="stopped"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SessionStopped 
              startSession={startSession} 
              apiKey={apiKey}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
