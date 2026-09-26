'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import { useAppStore } from '@/store/appStore';
import {
  User, Bell, Sliders, Palette, Camera, Check, Save,
  Video, Calendar, Globe, Monitor, Zap, ChevronRight, Mail,
} from 'lucide-react';

export const PROFILE_KEY = 'ff_profile';
export const PREFS_KEY = 'ff_prefs';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  bio: string;
  initials: string;
}

export interface UserPrefs {
  emailNotifications: boolean;
  meetingReminders: boolean;
  autoSaveNotes: boolean;
  compactCards: boolean;
  theme: 'light' | 'dark';
}

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return defaultProfile();
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null') ?? defaultProfile(); } catch { return defaultProfile(); }
}

function defaultProfile(): UserProfile {
  return { name: 'Janvi Agrawal', email: 'janvi@example.com', role: 'Data Science Student', bio: '', initials: 'JA' };
}

export function loadPrefs(): UserPrefs {
  if (typeof window === 'undefined') return defaultPrefs();
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) ?? 'null') ?? defaultPrefs(); } catch { return defaultPrefs(); }
}

function defaultPrefs(): UserPrefs {
  return { emailNotifications: true, meetingReminders: true, autoSaveNotes: true, compactCards: false, theme: 'light' };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const router = useRouter();
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<UserProfile>(defaultProfile());
  const [profileSaving, setProfileSaving] = useState(false);

  // Prefs state
  const [prefs, setPrefs] = useState<UserPrefs>(defaultPrefs());

  useEffect(() => {
    setProfile(loadProfile());
    setPrefs(loadPrefs());
  }, []);

  const saveProfile = async () => {
    setProfileSaving(true);
    const updated = { ...profile, initials: getInitials(profile.name) };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setProfile(updated);
    // Dispatch custom event to notify other components (e.g. Sidebar)
    window.dispatchEvent(new Event('ff_profile_updated'));
    await new Promise((r) => setTimeout(r, 400));
    setProfileSaving(false);
    addToast('Profile saved successfully');
  };

  const updatePref = <K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    addToast('Preference updated');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onNewMeeting={() => setMeetingModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your account and application preferences</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 max-w-4xl">
            {/* Tab sidebar */}
            <div className="w-full md:w-48 flex-shrink-0">
              <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:space-y-0.5">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="flex-1 min-w-0">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 mb-0.5">Profile</h2>
                    <p className="text-sm text-gray-500">Manage your personal information.</p>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                      {getInitials(profile.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{profile.name}</p>
                      <p className="text-xs text-gray-500">{profile.role}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Job Title / Role</label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Short description about yourself..."
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {profileSaving ? (
                      <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving...</span>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 mb-0.5">Preferences</h2>
                    <p className="text-sm text-gray-500">Customise your Fireflies experience.</p>
                  </div>
                  {([
                    { key: 'autoSaveNotes' as const, label: 'Auto-save notes', desc: 'Automatically save note changes as you type' },
                    { key: 'compactCards' as const, label: 'Compact meeting cards', desc: 'Show smaller meeting cards in the dashboard' },
                  ]).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <Toggle value={prefs[key] as boolean} onChange={(v) => updatePref(key, v)} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 mb-0.5">Notifications</h2>
                    <p className="text-sm text-gray-500">Control when and how you get notified.</p>
                  </div>
                  {([
                    { key: 'emailNotifications' as const, label: 'Email summaries', desc: 'Receive meeting summaries by email after each call' },
                    { key: 'meetingReminders' as const, label: 'Meeting reminders', desc: 'Get reminded 10 minutes before your next meeting' },
                  ]).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <Toggle value={prefs[key] as boolean} onChange={(v) => updatePref(key, v)} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 mb-0.5">Appearance</h2>
                    <p className="text-sm text-gray-500">Customise the look of the application.</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Theme</p>
                    <div className="flex gap-3">
                      {(['light', 'dark'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => updatePref('theme', t)}
                          className={`flex-1 py-4 rounded-xl border-2 font-semibold text-sm capitalize transition-all ${
                            prefs.theme === t
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {t === 'light' ? '☀️' : '🌙'} {t} Mode
                          {prefs.theme === t && <span className="ml-2">✓</span>}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Note: Theme preference is saved. Full dark mode support is on the roadmap.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <CreateMeetingModal open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)} onCreated={(m) => router.push(`/meetings/${m.id}`)} />
      <ToastContainer />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
        value ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
          value ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
