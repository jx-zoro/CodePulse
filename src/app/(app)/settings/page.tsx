"use client";

import { useState } from "react";
import { User, Settings as SettingsIcon, Shield, Bell, Palette, Database, HardDrive, Key, LogOut, CheckCircle2, Globe, Eye, EyeOff, AlertTriangle, MonitorSmartphone, Activity, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { useEnvironmentStore } from "@/lib/store/useEnvironmentStore";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { data: session } = useSession();
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const { environments, activeEnvironmentId, setActiveEnvironment, addEnvironment } = useEnvironmentStore();
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activeEnv = environments.find(e => e.id === activeEnvironmentId);

  const [aiTestState, setAiTestState] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  const tabs = [
    { id: "general", name: "General", icon: SettingsIcon },
    { id: "environments", name: "Environments", icon: Globe },
    { id: "ai", name: "AI / Copilot", icon: SparklesIcon },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "account", name: "Account", icon: User },
  ];

  const testConnection = () => {
    setAiTestState("testing");
    setTimeout(() => {
      setAiTestState("success");
      setTimeout(() => setAiTestState("idle"), 3000);
    }, 1500);
  };

  const toggleSecret = (id: string) => setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex h-full w-full max-w-6xl mx-auto flex-col md:flex-row gap-8 pb-12">
      
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 shrink-0 space-y-1">
        <h2 className="font-bold text-2xl tracking-tight mb-6 px-2">Settings</h2>
        <nav className="flex flex-col gap-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
          
          <div className="h-px bg-border my-4 mx-2"></div>
          
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 space-y-6">
        
        {/* GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">General Settings</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage workspace identity, appearance, and regional preferences.</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Workspace</CardTitle>
                <CardDescription>Configuration for the currently selected workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Workspace Name</label>
                  <Input defaultValue={activeWorkspace?.name || "Default Workspace"} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Workspace URL Slug</label>
                  <Input defaultValue={activeWorkspace?.slug || "default"} disabled />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-between">
                <Button>Save changes</Button>
                <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => { if(confirm("Are you sure you want to permanently delete this workspace and all associated data?")) { /* delete logic */ } }}>Delete Workspace</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-transparent rounded-lg bg-background hover:bg-muted focus:border-primary transition-all shadow-sm">
                    <div className="w-full h-20 bg-background border rounded-md overflow-hidden flex flex-col">
                      <div className="h-4 bg-muted border-b"></div>
                      <div className="flex-1 p-2 flex gap-2">
                        <div className="w-4 h-full bg-muted rounded-sm"></div>
                        <div className="flex-1 bg-muted/50 rounded-sm"></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-primary rounded-lg bg-slate-950 text-slate-50 transition-all shadow-sm">
                    <div className="w-full h-20 bg-slate-950 border border-slate-800 rounded-md overflow-hidden flex flex-col">
                      <div className="h-4 bg-slate-900 border-b border-slate-800"></div>
                      <div className="flex-1 p-2 flex gap-2">
                        <div className="w-4 h-full bg-slate-900 rounded-sm"></div>
                        <div className="flex-1 bg-slate-800 rounded-sm"></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">Dark (Active)</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 border-2 border-transparent rounded-lg bg-background hover:bg-muted focus:border-primary transition-all shadow-sm">
                    <div className="w-full h-20 bg-gradient-to-br from-background to-slate-950 border rounded-md overflow-hidden flex flex-col">
                      <div className="h-4 bg-muted/50 border-b"></div>
                      <div className="flex-1 p-2 flex gap-2">
                        <div className="w-4 h-full bg-muted/50 rounded-sm"></div>
                        <div className="flex-1 bg-muted/30 rounded-sm"></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timezone & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ENVIRONMENTS */}
        {activeTab === "environments" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Environment Configuration</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage global variables and secrets for API execution.</p>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Environment: {activeEnv?.name || "None"}</CardTitle>
                    <CardDescription>Variables injected during execution via {"{{var}}"} syntax.</CardDescription>
                  </div>
                  <select 
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={activeEnvironmentId || ""}
                    onChange={e => setActiveEnvironment(e.target.value)}
                  >
                    {environments.map(env => (
                      <option key={env.id} value={env.id}>{env.name}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md divide-y overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                    <div className="col-span-4">Variable Key</div>
                    <div className="col-span-6">Value</div>
                    <div className="col-span-2 text-right">Visibility</div>
                  </div>
                  {activeEnv ? activeEnv.variables.map((v, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-3 items-center">
                      <div className="col-span-4 font-mono text-sm">{v.key}</div>
                      <div className="col-span-6">
                        <Input 
                          type={(v as any).isSecret && !showSecret[`${activeEnv.id}-${i}`] ? "password" : "text"} 
                          value={v.value} 
                          className="font-mono text-xs h-8"
                          readOnly
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        {(v as any).isSecret && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSecret(`${activeEnv.id}-${i}`)}>
                            {showSecret[`${activeEnv.id}-${i}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                        {!(v as any).isSecret && <span className="text-xs text-muted-foreground pr-2">Plaintext</span>}
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground">No active environment selected.</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full border-dashed">Add Variable</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* AI & COPILOT */}
        {activeTab === "ai" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">CodePulse AI Copilot</h3>
              <p className="text-sm text-muted-foreground mt-1">Configure your LLM provider for API intelligence and documentation generation.</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Provider & Model Settings</CardTitle>
                <CardDescription>
                  CodePulse currently inherits secrets exclusively from server-side environment variables to ensure zero client-side credential leakage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider</label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm opacity-70 cursor-not-allowed" disabled>
                      <option>OpenAI (Configured via env)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language Model</label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm opacity-70 cursor-not-allowed" disabled>
                      <option>gpt-4-turbo</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success"></div>
                      <span className="font-semibold text-sm">Connection Status: Ready</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={testConnection} disabled={aiTestState !== "idle"}>
                      {aiTestState === "testing" ? "Testing..." : aiTestState === "success" ? <><CheckCircle2 className="h-4 w-4 mr-1 text-success"/> OK</> : "Test Connection"}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between border-t pt-2 mt-2">
                    <span>API Key securely loaded from backend memory.</span>
                    <span>Usage: Normal</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground mt-1">Control how and when CodePulse alerts you to anomalies.</p>
            </div>
            
            <Card>
              <CardContent className="p-0 divide-y">
                
                <div className="p-6 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> API Failure Alerts</h4>
                    <p className="text-sm text-muted-foreground mt-1">Triggered when any endpoint experiences a 5xx error or sudden timeout.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-6 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-blue-500" /> Regression Alerts</h4>
                    <p className="text-sm text-muted-foreground mt-1">Triggered when the APIRegressionEngine detects latency spikes or success rate drops.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-6 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-destructive" /> Security Alerts</h4>
                    <p className="text-sm text-muted-foreground mt-1">Triggered when sensitive tokens leak in URLs or authorization headers are missing.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Platform Security</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage active sessions and account access controls.</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Devices currently logged into your CodePulse account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 flex items-center justify-between bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-4">
                    <MonitorSmartphone className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-semibold text-sm">Windows • Chrome</div>
                      <div className="text-xs text-muted-foreground">Current Session • Active Now</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">THIS DEVICE</span>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full">Sign Out of All Other Devices</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* ACCOUNT */}
        {activeTab === "account" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Account Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage your identity and authentication credentials.</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold uppercase border-2 border-primary/20">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                  </div>
                  <Button variant="outline" size="sm">Upload Avatar</Button>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input defaultValue={session?.user?.name || ""} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input type="email" defaultValue={session?.user?.email || ""} disabled />
                  <p className="text-[10px] text-muted-foreground">Email addresses are permanently tied to your authentication provider.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Update Profile</Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Delete Account</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and all associated workspace data.</p>
                  </div>
                  <Button variant="destructive" onClick={() => { if(confirm("Are you sure you want to PERMANENTLY delete your account? This action cannot be undone.")) { /* delete logic */ } }}>Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return <Sparkles {...props} />
}



