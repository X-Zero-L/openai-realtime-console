import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "/assets/openai-logomark.svg";

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined';

export default function Auth({ onAuthenticated }) {
  const [apiKey, setApiKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  
  // 组件挂载后从 localStorage 获取 apiKey
  useEffect(() => {
    if (isBrowser) {
      const savedApiKey = localStorage.getItem("apiKey") || "";
      setApiKey(savedApiKey);
      
      // 如果有保存的密钥，自动尝试验证
      if (savedApiKey) {
        validateApiKey(savedApiKey);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    validateApiKey(apiKey);
  };

  const validateApiKey = async (key) => {
    if (!key || key.trim() === "") {
      setError("请输入API密钥");
      return;
    }
    
    setIsVerifying(true);
    setError("");
    
    try {
      const response = await fetch("/verify", {
        headers: {
          Authorization: `Bearer ${key}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "验证失败");
        setIsVerifying(false);
        return;
      }
      
      // 验证成功，保存到 localStorage
      if (isBrowser) {
        localStorage.setItem("apiKey", key);
      }
      
      // 通知父组件验证成功
      onAuthenticated(key);
      setIsVerifying(false);
    } catch (error) {
      setError("验证过程中发生错误");
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-3 md:p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 md:p-8"
      >
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <motion.img 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            src={logo} 
            alt="OpenAI Logo" 
            className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4" 
          />
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-bold text-gray-800"
          >
            OpenAI 实时控制台
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm md:text-base text-gray-600 text-center mt-2"
          >
            请输入您的 API 密钥以访问应用
          </motion.p>
        </div>
        
        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit} 
          className="space-y-4"
        >
          <div>
            <label htmlFor="apiKey" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              API 密钥
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="输入您的 API 密钥"
              disabled={isVerifying}
            />
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-red-500 text-xs md:text-sm bg-red-50 p-2 md:p-3 rounded-md border border-red-200"
            >
              {error}
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isVerifying || !apiKey}
            className={`w-full flex justify-center py-2 md:py-3 px-3 md:px-4 border border-transparent rounded-md shadow-sm text-white font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
              isVerifying || !apiKey ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isVerifying ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                验证中...
              </span>
            ) : (
              "验证并进入应用"
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
} 