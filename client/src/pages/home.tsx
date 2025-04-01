import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Code2, Lock, Type } from "lucide-react";
import { type Concept } from "@shared/schema";

const getConceptIcon = (title: string) => {
  switch (title.toLowerCase()) {
    case "synchronization":
      return <Lock className="h-6 w-6" />;
    case "deadlock":
      return <Type className="h-6 w-6" />;
    default:
      return <Code2 className="h-6 w-6" />;
  }
};

export default function Home() {
  const { data: concepts, isLoading } = useQuery<Concept[]>({
    queryKey: ["/api/concepts"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Multithreading Concepts</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Learn Java Multithreading
          </h2>
          <p className="text-muted-foreground">
            Explore key multithreading concepts through interactive visualizations and real-time examples.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concepts?.map((concept, index) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/concept/${concept.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {getConceptIcon(concept.title)}
                      <CardTitle>{concept.title}</CardTitle>
                    </div>
                    <CardDescription>{concept.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{concept.threadConfig.defaultThreads} threads</span>
                      <span>•</span>
                      <span>Interactive demo</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}