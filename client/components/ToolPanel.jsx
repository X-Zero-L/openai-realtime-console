import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const functionDescription = `
当用户请求颜色方案时调用此函数。
`;

const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "display_color_palette",
        description: functionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            theme: {
              type: "string",
              description: "颜色方案的主题描述。",
            },
            colors: {
              type: "array",
              description: "基于主题的五个十六进制颜色代码数组。",
              items: {
                type: "string",
                description: "十六进制颜色代码",
              },
            },
          },
          required: ["theme", "colors"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

function FunctionCallOutput({ functionCallOutput }) {
  const { theme, colors } = JSON.parse(functionCallOutput.arguments);

  const colorBoxes = colors.map((color, index) => (
    <motion.div
      key={color}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="w-full h-16 rounded-md flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: color }}
    >
      <p className="text-sm font-bold text-black bg-white/80 backdrop-blur-sm rounded-md p-2 border border-gray-300 shadow-sm">
        {color}
      </p>
    </motion.div>
  ));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-3 mt-4"
    >
      <p className="font-medium">主题: <span className="text-blue-600">{theme}</span></p>
      {colorBoxes}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <pre className="text-xs bg-gray-50 rounded-md p-3 overflow-x-auto border border-gray-200 mt-2">
          {JSON.stringify(functionCallOutput, null, 2)}
        </pre>
      </motion.div>
    </motion.div>
  );
}

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setFunctionAdded(true);
    }

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output) => {
        if (
          output.type === "function_call" &&
          output.name === "display_color_palette"
        ) {
          setFunctionCallOutput(output);
          setTimeout(() => {
            sendClientEvent({
              type: "response.create",
              response: {
                instructions: `
                请询问用户对颜色方案的反馈 - 不要重复颜色，只需询问他们是否喜欢这些颜色。
              `,
              },
            });
          }, 500);
        }
      });
    }
  }, [events]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full bg-white rounded-md p-4 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">颜色方案工具</h2>
        <AnimatePresence mode="wait">
          {isSessionActive ? (
            functionCallOutput ? (
              <FunctionCallOutput key="output" functionCallOutput={functionCallOutput} />
            ) : (
              <motion.p 
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-600 mt-4 text-center p-4 bg-gray-50 rounded-md border border-gray-200"
              >
                请询问AI生成一个颜色方案...
              </motion.p>
            )
          ) : (
            <motion.p 
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500 mt-4 text-center p-4 bg-gray-50 rounded-md border border-dashed border-gray-300"
            >
              请先启动会话以使用此工具...
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
