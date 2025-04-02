import { useState } from "react";
import { CloudLightning, CloudOff, MessageSquare, Send } from "react-feather";
import Button from "./Button";
import SessionSettings from "./SessionSettings";
import { motion, AnimatePresence } from "framer-motion";

function SessionStopped({ startSession, apiKey, sessionSettings, onSettingsChange }) {
  const [isActivating, setIsActivating] = useState(false);
  const isApiKeyEmpty = !apiKey || apiKey.trim() === "";

  function handleStartSession(e) {
    if (e) e.preventDefault();
    
    if (isActivating || isApiKeyEmpty) return;

    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <div className="w-full max-w-sm">
        <SessionSettings 
          onSettingsChange={onSettingsChange}
          initialSettings={sessionSettings}
        />
      </div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={handleStartSession}
          className={`w-full ${isActivating ? "bg-gray-600" : isApiKeyEmpty ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex items-center w-full gap-2 md:gap-4">
        <motion.input
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim()) {
              e.preventDefault();
              handleSendClientEvent();
            }
          }}
          type="text"
          placeholder="发送文本消息..."
          className="border border-gray-300 rounded-full p-2 md:p-4 text-sm md:text-base flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoFocus
        />

        <div className="flex gap-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: message.trim() ? 1.05 : 1 }}
            whileTap={{ scale: message.trim() ? 0.95 : 1 }}
          >
            <Button
              type="submit"
              icon={<Send height={16} />}
              className={`${message.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} px-3 md:px-4 py-2 md:py-3`}
              disabled={!message.trim()}
            >
              <span className="hidden sm:inline">发送</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={stopSession} 
              icon={<CloudOff height={16} />}
              className="bg-red-600 hover:bg-red-700 px-3 md:px-4 py-2 md:py-3"
            >
              <span className="hidden sm:inline">断开</span>
            </Button>
          </motion.div>
        </div>
      </form>
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
  apiKey,
  sessionSettings,
  onSettingsChange
}) {
  return (
    <div className="flex gap-2 h-full w-full">
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
              sessionSettings={sessionSettings}
              onSettingsChange={onSettingsChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
