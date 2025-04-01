import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

interface CodeExampleProps {
  code: string;
}

export function CodeExample({ code }: CodeExampleProps) {
  const { theme } = useTheme();

  return (
    <Card className="p-4">
      <SyntaxHighlighter
        language="java"
        style={theme === "dark" ? vscDarkPlus : vs}
        showLineNumbers
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.9rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </Card>
  );
}
