import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import ConceptDetail from "@/pages/concept-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/concept/:id" component={ConceptDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;