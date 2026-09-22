"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Code2, Copy, CheckCircle2 } from "lucide-react";
import Editor from "@monaco-editor/react";

export function SdkGeneratorModal({ open, onOpenChange, request }: { open: boolean, onOpenChange: (open: boolean) => void, request: any }) {
  const [target, setTarget] = useState<"typescript" | "python" | "go">("typescript");
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    if (!request) return "// No request selected";
    
    if (target === "typescript") {
      return `import axios from 'axios';

export async function executeRequest() {
  const config = {
    method: '${request.method || "GET"}',
    url: '${request.url || "https://api.example.com"}',
    headers: ${JSON.stringify(request.headers || {}, null, 2)},
    data: ${request.body ? `'${request.body.replace(/\n/g, "\\n")}'` : "null"}
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}`;
    }

    if (target === "python") {
      return `import requests
import json

def execute_request():
    url = "${request.url || "https://api.example.com"}"
    headers = ${JSON.stringify(request.headers || {}, null, 4)}
    
    try:
        response = requests.request(
            "${request.method || "GET"}",
            url,
            headers=headers,
            data=${request.body ? `'''${request.body}'''` : "None"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        raise`;
    }

    if (target === "go") {
      return `package main

import (
\t"fmt"
\t"io/ioutil"
\t"net/http"
\t"strings"
)

func executeRequest() {
\turl := "${request.url || "https://api.example.com"}"
\tmethod := "${request.method || "GET"}"
\t
\tpayload := strings.NewReader(\`${request.body || ""}\`)

\tclient := &http.Client{}
\treq, err := http.NewRequest(method, url, payload)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\t
\treq.Header.Add("Content-Type", "application/json")

\tres, err := client.Do(req)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tdefer res.Body.Close()

\tbody, err := ioutil.ReadAll(res.Body)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tfmt.Println(string(body))
}`;
    }

    return "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Generate Client Code
          </DialogTitle>
          <DialogDescription>
            Export this request as a native SDK client or HTTP request code. Secrets are omitted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 my-2 border-b pb-2">
          <Button variant={target === "typescript" ? "default" : "outline"} size="sm" onClick={() => setTarget("typescript")}>TypeScript / Node</Button>
          <Button variant={target === "python" ? "default" : "outline"} size="sm" onClick={() => setTarget("python")}>Python</Button>
          <Button variant={target === "go" ? "default" : "outline"} size="sm" onClick={() => setTarget("go")}>Go</Button>
        </div>

        <div className="h-[350px] border rounded-md overflow-hidden relative">
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute top-2 right-2 z-10 h-8 w-8"
            onClick={handleCopy}
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Editor
            height="100%"
            defaultLanguage={target === "typescript" ? "typescript" : target}
            theme="vs-dark"
            value={generateCode()}
            options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download Source
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
