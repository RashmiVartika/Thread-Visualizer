import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ThreadData } from "@shared/schema";
import { motion } from "framer-motion";
import { AlertCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThreadVisualizationProps {
  websocket: WebSocket;
  numThreads: number;
  onStart: () => void;
}

export function ThreadVisualization({ websocket, numThreads, onStart }: ThreadVisualizationProps) {
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [isDeadlocked, setIsDeadlocked] = useState(false);

  useEffect(() => {
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "THREAD_UPDATE") {
        setThreads(message.threads);
        // Check for deadlock condition
        const blockedThreads = message.threads.filter((t: ThreadData) => t.state === "BLOCKED");
        setIsDeadlocked(blockedThreads.length === message.threads.length);
      }
    };

    return () => {
      setThreads([]);
      setIsDeadlocked(false);
    };
  }, [websocket]);

  const getStateColor = (state: string) => {
    switch (state) {
      case "RUNNABLE": return "bg-green-500";
      case "BLOCKED": return "bg-red-500";
      case "WAITING": return "bg-yellow-500";
      case "TERMINATED": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };

  const getThreadRole = (thread: ThreadData) => {
    if (thread.role === "PRODUCER") {
      return <span className="text-xs font-medium text-blue-500 ml-2">(Producer)</span>;
    } else if (thread.role === "CONSUMER") {
      return <span className="text-xs font-medium text-purple-500 ml-2">(Consumer)</span>;
    }
    return null;
  };

  const allTerminated = threads.length > 0 && threads.every(t => t.state === "TERMINATED");

  return (
    <div className="space-y-4">
      {isDeadlocked && (
        <div className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900 rounded-md mb-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium">Deadlock detected! All threads are blocked.</span>
        </div>
      )}

      {threads.map((thread) => (
        <motion.div
          key={thread.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-medium">{thread.name}</span>
                {getThreadRole(thread)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs text-white ${getStateColor(thread.state)}`}>
                {thread.state}
              </span>
            </div>
            <Progress value={thread.progress} className="h-2" />
            {thread.state === "BLOCKED" && (
              <p className="text-sm text-red-500 mt-2">
                Waiting for resources... (potential starvation)
              </p>
            )}
          </Card>
        </motion.div>
      ))}

      {(threads.length === 0 || allTerminated) && (
        <Button
          onClick={onStart}
          className="w-full"
          variant="default"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          {threads.length === 0 ? "Start Execution" : "Restart Execution"}
        </Button>
      )}

      {allTerminated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-green-100 dark:bg-green-900 rounded-md"
        >
          <span className="text-sm font-medium">All threads have completed execution.</span>
        </motion.div>
      )}
    </div>
  );
}