import { useEffect, useRef, useState } from "react";
import logo from "/assets/openai-logomark.svg";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import { motion } from "framer-motion";
import Auth from "../pages/Auth";

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined';

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  // 组件挂载后从 localStorage 获取 apiKey
  useEffect(() => {
    if (isBrowser) {
      const savedApiKey = localStorage.getItem("apiKey") || "";
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // 处理身份验证成功
  const handleAuthenticated = (key) => {
    setApiKey(key);
    setIsAuthenticated(true);
  };

  async function startSession() {
    setAuthError("");
    
    if (!apiKey) {
      setAuthError("API密钥无效");
      return;
    }
    
    try {
      // 获取 OpenAI Realtime API 的会话令牌
      const tokenResponse = await fetch("/token", {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        setAuthError(errorData.error || "验证失败");
        return;
      }
      
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // 创建对等连接
      const pc = new RTCPeerConnection();

      // 设置远程模型的音频播放
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

      // 添加本地麦克风音频轨道
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // 设置数据通道用于发送和接收事件
      const dc = pc.createDataChannel("oai-events");
      setDataChannel(dc);

      // 使用会话描述协议 (SDP) 启动会话
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;
    } catch (error) {
      console.error("会话启动错误:", error);
      setAuthError("会话启动失败");
    }
  }

  // 停止当前会话，清理对等连接和数据通道
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    peerConnection.current.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  // 向模型发送消息
  function sendClientEvent(message) {
    if (dataChannel) {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();

      // send event before setting timestamp since the backend peer doesn't expect this field
      dataChannel.send(JSON.stringify(message));

      // if guard just in case the timestamp exists by miracle
      if (!message.timestamp) {
        message.timestamp = timestamp;
      }
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "发送消息失败 - 无可用数据通道",
        message,
      );
    }
  }

  // 向模型发送文本消息
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // 当新的数据通道创建时，附加事件监听器
  useEffect(() => {
    if (dataChannel) {
      // 将新的服务器事件添加到列表中
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }

        setEvents((prev) => [event, ...prev]);
      });

      // 当数据通道打开时设置会话为活动状态
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  // 注销功能
  function handleLogout() {
    if (isSessionActive) {
      stopSession();
    }
    
    // 清除身份验证状态
    setIsAuthenticated(false);
    setApiKey("");
    
    // 可选：从 localStorage 中移除 API 密钥
    if (isBrowser) {
      localStorage.removeItem("apiKey");
    }
  }

  // 如果未经身份验证，显示身份验证页面
  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  // 已经过身份验证，显示主应用
  return (
    <>
      <motion.nav 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className="absolute top-0 left-0 right-0 h-16 flex items-center bg-white shadow-sm z-10"
      >
        <div className="flex items-center justify-between w-full mx-4 pb-2 border-0 border-b border-solid border-gray-200">
          <div className="flex items-center gap-4">
            <motion.img 
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{ width: "28px" }} 
              src={logo} 
            />
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-bold text-gray-800 text-sm md:text-base"
            >
              OpenAI 实时控制台
            </motion.h1>
          </div>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={handleLogout}
            className="px-3 py-1 text-xs md:text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
          >
            退出登录
          </motion.button>
        </div>
      </motion.nav>
      <main className="absolute top-16 left-0 right-0 bottom-0 bg-gray-50">
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 right-0 bottom-0 flex"
        >
          <section className="absolute top-0 left-0 right-0 bottom-32 px-2 md:px-4 py-4 overflow-y-auto">
            <EventLog events={events} />
          </section>
          <section className="absolute h-32 left-0 right-0 bottom-0 p-2 md:p-4 bg-white border-t border-gray-200 shadow-sm">
            {authError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs md:text-sm mb-2 bg-red-50 p-2 rounded-md border border-red-200"
              >
                {authError}
              </motion.div>
            )}
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              events={events}
              isSessionActive={isSessionActive}
              apiKey={apiKey}
            />
          </section>
        </motion.section>
      </main>
    </>
  );
}
