'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import { useAppStore } from '@/store/appStore';
import {
  CheckCircle2, Circle, Zap, RefreshCw, ExternalLink,
  Video, Calendar, MessageSquare, Users, Globe, Mail,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  connectedAt?: string;
  enabled: boolean;
}

const STORAGE_KEY = 'ff_integrations';

const INITIAL_INTEGRATIONS: Omit<Integration, 'connectedAt' | 'enabled'>[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Automatically sync your meetings and get Fireflies notes added to calendar events.',
    category: 'Calendar',
    icon: <Calendar className="w-6 h-6 text-red-500" />,
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Record and transcribe Google Meet sessions automatically with the AI Notetaker.',
    category: 'Video',
    icon: <Video className="w-6 h-6 text-green-500" />,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Invite the Fireflies bot to Zoom calls for automatic transcription and summaries.',
    category: 'Video',
    icon: <Video className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 'ms-teams',
    name: 'Microsoft Teams',
    description: 'Connect Fireflies to Microsoft Teams for seamless meeting intelligence.',
    category: 'Video',
    icon: <Users className="w-6 h-6 text-purple-500" />,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get meeting summaries and action items delivered directly to your Slack channels.',
    category: 'Messaging',
    icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Sync Outlook calendar events and receive meeting notes in your inbox.',
    category: 'Calendar',
    icon: <Mail className="w-6 h-6 text-blue-600" />,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Log calls, sync contacts, and push meeting insights directly to your CRM.',
    category: 'CRM',
    icon: <Globe className="w-6 h-6 text-sky-500" />,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Automatically create deals and contacts from meeting participants in HubSpot.',
    category: 'CRM',
    icon: <Zap className="w-6 h-6 text-orange-500" />,
  },
];

type ConnectionState = Record<string, { enabled: boolean; connectedAt?: string }>;

function loadState(): ConnectionState {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}

function saveState(state: ConnectionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const CATEGORIES = ['All', 'Calendar', 'Video', 'Messaging', 'CRM'];

export default function IntegrationsPage() {
  const router = useRouter();
  const { addToast } = useAppStore();
  const [connections, setConnections] = useState<ConnectionState>({});
  const [category, setCategory] = useState('All');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  useEffect(() => {
    setConnections(loadState());
  }, []);

  const persist = useCallback((state: ConnectionState) => {
    setConnections(state);
    saveState(state);
  }, []);

  const connect = async (id: string, name: string) => {
    setConnecting(id);
    await new Promise((r) => setTimeout(r, 1200));
    const updated = {
      ...connections,
      [id]: { enabled: true, connectedAt: new Date().toISOString() },
    };
    persist(updated);
    setConnecting(null);
    addToast(`${name} connected successfully`);
  };

  const disconnect = (id: string, name: string) => {
    const updated = { ...connections };
    delete updated[id];
    persist(updated);
    addToast(`${name} disconnected`);
  };

  const toggleEnabled = (id: string) => {
    if (!connections[id]) return;
    persist({
      ...connections,
      [id]: { ...connections[id], enabled: !connections[id].enabled },
    });
  };

  const filtered = INITIAL_INTEGRATIONS.filter(
    (i) => category === 'All' || i.category === category
  );

  const connectedCount = Object.keys(connections).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onNewMeeting={() => setMeetingModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {connectedCount > 0 ? `${connectedCount} integration${connectedCount !== 1 ? 's' : ''} connected` : 'Connect your favorite tools to supercharge your meeting workflow.'}
            </p>
          </div>

          {/* Stats */}
          {connectedCount > 0 && (
            <div className="flex gap-3 mb-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">{connectedCount} Connected</span>
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Integration grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((integration) => {
              const state = connections[integration.id];
              const isConnected = !!state;
              const isLoading = connecting === integration.id;

              return (
                <div
                  key={integration.id}
                  className={`bg-white rounded-xl border h-full ${
                    isConnected ? 'border-indigo-200 shadow-sm' : 'border-gray-200'
                  } p-5 flex flex-col gap-3 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                      {integration.icon}
                    </div>
                    {isConnected && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{integration.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{integration.description}</p>
                  </div>

                  {isConnected && state.connectedAt && (
                    <p className="text-[10px] text-gray-400">
                      Connected {new Date(state.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}

                  <div className="flex gap-2 mt-auto">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => toggleEnabled(integration.id)}
                          className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors ${
                            state.enabled
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {state.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => disconnect(integration.id, integration.name)}
                          className="px-3 text-xs font-semibold py-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => connect(integration.id, integration.name)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60"
                      >
                        {isLoading ? (
                          <><RefreshCw className="w-3 h-3 animate-spin" /> Connecting...</>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
      <CreateMeetingModal open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)} onCreated={(m) => router.push(`/meetings/${m.id}`)} />
      <ToastContainer />
    </div>
  );
}
