import { ArrowUp, ArrowDown } from "react-feather";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Event({ event, timestamp }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isClient = event.event_id && !event.event_id.startsWith("event_");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1 md:gap-2 p-1.5 md:p-3 rounded-md bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div
        className="flex items-center gap-1.5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          {isClient ? (
            <ArrowDown className="text-blue-500 w-3.5 h-3.5 md:w-5 md:h-5" />
          ) : (
            <ArrowUp className="text-green-500 w-3.5 h-3.5 md:w-5 md:h-5" />
          )}
        </motion.div>
        <div className="text-xs md:text-sm text-gray-600 font-medium truncate max-w-full">
          {isClient ? "客户端:" : "服务端:"}
          &nbsp;{event.type} | {timestamp}
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-600 bg-gray-50 p-2 md:p-3 rounded-md overflow-x-auto border border-gray-200"
          >
            <pre className="text-[9px] md:text-xs whitespace-pre-wrap break-all">{JSON.stringify(event, null, 2)}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EventLog({ events }) {
  const eventsToDisplay = [];
  let deltaEvents = {};

  events.forEach((event) => {
    if (event.type.endsWith("delta")) {
      if (deltaEvents[event.type]) {
        // for now just log a single event per render pass
        return;
      } else {
        deltaEvents[event.type] = event;
      }
    }

    eventsToDisplay.push(
      <Event key={event.event_id} event={event} timestamp={event.timestamp} />,
    );
  });

  return (
    <div className="flex flex-col gap-1.5 md:gap-3 pb-2 h-full overflow-y-auto overscroll-contain">
      {events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center p-4 font-medium text-xs md:text-base"
        >
          等待事件中...
        </motion.div>
      ) : (
        eventsToDisplay
      )}
    </div>
  );
}
