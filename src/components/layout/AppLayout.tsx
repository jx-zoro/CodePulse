"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { EnvironmentManagerModal } from "../EnvironmentManagerModal";
import { SaveRequestModal } from "../SaveRequestModal";
import { CommandPaletteModal } from "../CommandPaletteModal";
import { RunnerModal } from "../RunnerModal";
import { OpenApiImportModal } from "../OpenApiImportModal";
import { AiCopilotDrawer } from "../AiCopilotDrawer";
import { SdkGeneratorModal } from "../SdkGeneratorModal";

export const CopilotContext = React.createContext({
  openCopilot: (context?: any) => {},
  openSdkGenerator: (request?: any) => {},
});

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [sdkGeneratorOpen, setSdkGeneratorOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [copilotContext, setCopilotContext] = useState<any>(null);

  const openSdkGenerator = (request?: any) => {
    if (request) setCurrentRequest(request);
    setSdkGeneratorOpen(true);
  };
  
  const openCopilot = (context?: any) => {
    if (context) setCopilotContext(context);
    setCopilotOpen(true);
  };

  return (
    <CopilotContext.Provider value={{ openCopilot, openSdkGenerator }}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
            {children}
          </main>
        </div>
        <EnvironmentManagerModal />
        <SaveRequestModal />
        <CommandPaletteModal />
        <RunnerModal />
        <OpenApiImportModal />
        <AiCopilotDrawer 
          isOpen={copilotOpen} 
          onClose={() => setCopilotOpen(false)} 
          initialContext={copilotContext} 
        />
        <SdkGeneratorModal 
          open={sdkGeneratorOpen} 
          onOpenChange={setSdkGeneratorOpen} 
          request={currentRequest} 
        />
      </div>
    </CopilotContext.Provider>
  );
}

