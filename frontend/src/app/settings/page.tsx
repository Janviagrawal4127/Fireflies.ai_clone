'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import {
  User, Bell, Sliders, Plug, ChevronRight,
  Mic2, Video, Calendar, Globe, Monitor, Zap,
} from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your account details and preferences',
    icon: <User className="w-5 h-5 text-violet-600" />,
    items: ['Display Name', 'Email Address', 'Profile Photo', 'Time Zone'],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customise your Fireflies experience',
    icon: <Sliders className="w-5 h-5 text-blue-600" />,
    items: ['Language', 'Date Format', 'Default Meeting Duration', 'Transcript Language'],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control when and how you get notified',
    icon: <Bell className="w-5 h-5 text-orange-500" />,
    items: ['Email Summaries', 'Action Item Reminders', 'Weekly Digest', 'Mention Alerts'],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect Fireflies to your tools',
    icon: <Plug className="w-5 h-5 text-emerald-600" />,
    items: [],
  },
];

const INTEGRATIONS = [
  { name: 'Zoom', icon: <Video className="w-5 h-5 text-blue-500" />, status: 'Not connected' },
  { name: 'Google Meet', icon: <Monitor className="w-5 h-5 text-green-500" />, status: 'Not connected' },
  { name: 'Google Calendar', icon: <Calendar className="w-5 h-5 text-red-500" />, status: 'Not connected' },
  { name: 'Slack', icon: <Globe className="w-5 h-5 text-purple-500" />, status: 'Not connected' },
  { name: 'Zapier', icon: <Zap className="w-5 h-5 text-orange-500" />, status: 'Not connected' },
];

export default function SettingsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onNewMeeting={() => setCreateOpen(true)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your account and application preferences</p>
          </div>

          <div className="max-w-3xl space-y-6">
            {SETTINGS_SECTIONS.map((section) => (
              <div key={section.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </div>

                {/* Section content */}
                {section.id === 'integrations' ? (
                  <div className="divide-y divide-gray-50">
                    {INTEGRATIONS.map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            {integration.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                            <p className="text-xs text-gray-400">{integration.status}</p>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-not-allowed opacity-60">
                          Coming Soon
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-center justify-between px-6 py-3.5">
                        <span className="text-sm text-gray-700">{item}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Coming Soon</span>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Bot & Transcription placeholder */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">AI Bot & Live Transcription</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Let the Fireflies AI Notetaker join your meetings automatically and transcribe them in real time.
                    Connect to Zoom, Google Meet, or Microsoft Teams.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg opacity-60 cursor-not-allowed">
                      Add to Calendar
                    </button>
                    <button className="px-4 py-2 border border-violet-200 text-violet-700 text-sm font-medium rounded-lg opacity-60 cursor-not-allowed">
                      Learn More
                    </button>
                  </div>
                  <p className="text-xs text-violet-500 mt-3 font-medium">Coming Soon — Real-time transcription not included in this build</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(m) => router.push(`/meetings/${m.id}`)}
      />
      <ToastContainer />
    </div>
  );
}
