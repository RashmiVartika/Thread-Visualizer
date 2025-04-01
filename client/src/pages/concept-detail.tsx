import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThreadVisualization } from "@/components/thread-visualization";
import { CodeExample } from "@/components/code-example";
import { ChevronLeft } from "lucide-react";
import { type Concept } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ConceptDetail() {
  const { id } = useParams();
  const wsRef = useRef<WebSocket>();
  const { toast } = useToast();
  const [threadCount, setThreadCount] = useState<number>(0);

  const { data: concept, isLoading } = useQuery<Concept>({
    queryKey: [`/api/concepts/${id}`],
  });

  useEffect(() => {
    if (concept) {
      setThreadCount(concept.threadConfig.defaultThreads);
    }
  }, [concept]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('Connecting to WebSocket:', wsUrl);

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket Connected');
      toast({
        title: "Connected",
        description: "Ready to start thread simulation",
      });
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to establish WebSocket connection",
      });
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = undefined;
      }
    };
  }, [toast]);

  if (isLoading || !concept || !wsRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  const handleStart = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "START_EXECUTION",
        numThreads: threadCount,
        conceptId: Number(id)
      }));
    } else {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "WebSocket is not connected. Please try refreshing the page.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{concept.title}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{concept.description}</p>
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Implementation Example</h3>
                <CodeExample code={concept.code} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Demonstration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Thread Configuration</h3>
                  <div className="flex items-center gap-4">
                    <Slider
                      defaultValue={[concept.threadConfig.defaultThreads]}
                      value={[threadCount]}
                      onValueChange={(value) => setThreadCount(value[0])}
                      min={concept.threadConfig.minThreads}
                      max={concept.threadConfig.maxThreads}
                      step={1}
                      className="w-64"
                    />
                    <span className="text-sm text-muted-foreground">
                      {threadCount} threads
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adjust the number of threads to see how it affects the execution pattern
                  </p>
                </div>
                <ThreadVisualization
                  websocket={wsRef.current}
                  numThreads={threadCount}
                  onStart={handleStart}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}