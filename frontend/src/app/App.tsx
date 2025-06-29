'use client';
import React, { useState, useEffect } from 'react';
import { HomeScreen } from '../components/HomeScreen';
import { MachineDashboard } from '../components/MachineDashboard';
import { ChatInterface } from '../components/ChatInterface';
import { SessionHistory } from '../components/SessionHistory';
import { ManualViewer } from '../components/ManualViewer';
import { SessionDetail } from '../components/SessionDetail';
import { ManualDetail } from '../components/ManualDetail';
import { Header } from '../components/Header';
import { getMachines, addMachine, updateMachine, deleteMachine, Machine } from '../lib/api';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabaseClient';
import { Document } from '../types/document';
import { ChatSession } from '../types/session';

// Define types for navigation and data
interface Session {
  id: string | number;
  date?: string;
  summary?: string;
}
interface Breadcrumb {
  name: string;
  screen: string;
}

type NavData = Machine | Session | Document | null;

const LoginForm = dynamic(() => import('../components/LoginForm'), { ssr: false });
const RegisterForm = dynamic(() => import('../components/RegisterForm'), { ssr: false });
const PasswordResetForm = dynamic(() => import('../components/PasswordResetForm'), { ssr: false });

export function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    {
      name: 'Home',
      screen: 'home',
    },
  ]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadingMachines, setLoadingMachines] = useState<boolean>(true);
  const [machinesError, setMachinesError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Fetch machines from Supabase
  const fetchMachines = async () => {
    setLoadingMachines(true);
    setMachinesError(null);
    try {
      const data = await getMachines();
      setMachines(data);
    } catch (err: any) {
      setMachinesError(err.message || 'Failed to load machines');
      console.error('Error fetching machines:', err);
    } finally {
      setLoadingMachines(false);
    }
  };

  useEffect(() => {
    // Check auth on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAuthChecked(true);
    });
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchMachines();
  }, []);

  // Add a handler for login success
  const handleLoginSuccess = () => {
    setCurrentScreen('home');
  };

  // Add a handler for register success
  const handleRegisterSuccess = () => {
    setCurrentScreen('login');
  };

  // Machine CRUD handlers
  const handleAddMachine = async (machine: Machine) => {
    try {
      await addMachine(machine);
      await fetchMachines();
    } catch (err: any) {
      alert(err.message || 'Failed to add machine');
    }
  };

  // Optionally, add edit/delete handlers here if needed

  // Handle navigation
  const navigateTo = (screen: string, data: NavData = null) => {
    let newBreadcrumbs = [...breadcrumbs];

    if (screen === 'home') {
      newBreadcrumbs = [
        {
          name: 'Home',
          screen: 'home',
        },
      ];
      setSelectedMachine(null);
      setSelectedSession(null);
      setSelectedDocument(null);
    } else if (screen === 'machine') {
      if (data && typeof data === 'object' && 'name' in data) {
        setSelectedMachine(data as Machine);
        newBreadcrumbs = [
          {
            name: 'Home',
            screen: 'home',
          },
          {
            name: (data as Machine).name || 'Machine',
            screen: 'machine',
          },
        ];
      }
    } else if (['chat', 'history', 'manual'].includes(screen)) {
      newBreadcrumbs = [
        {
          name: 'Home',
          screen: 'home',
        },
        {
          name: selectedMachine?.name || 'Machine',
          screen: 'machine',
        },
        {
          name: screen.charAt(0).toUpperCase() + screen.slice(1),
          screen: screen,
        },
      ];
    } else if (screen === 'session-detail') {
      if (
        data &&
        typeof data === 'object' &&
        'id' in data &&
        'machine_id' in data &&
        'user_id' in data &&
        'created_at' in data
      ) {
        setSelectedSession(data as ChatSession);
        newBreadcrumbs = [
          {
            name: 'Home',
            screen: 'home',
          },
          {
            name: selectedMachine?.name || 'Machine',
            screen: 'machine',
          },
          {
            name: 'History',
            screen: 'history',
          },
          {
            name: `Session ${(data as ChatSession).id ?? ''}`,
            screen: 'session-detail',
          },
        ];
      }
    } else if (screen === 'manual-detail') {
      if (data && typeof data === 'object' && 'id' in data && 'filename' in data) {
        setSelectedDocument(data as Document);
        newBreadcrumbs = [
          {
            name: 'Home',
            screen: 'home',
          },
          {
            name: selectedMachine?.name || 'Machine',
            screen: 'machine',
          },
          {
            name: 'Manual',
            screen: 'manual',
          },
          {
            name: (data as Document).filename || 'Manual Detail',
            screen: 'manual-detail',
          },
        ];
      }
    } else if (screen === 'login') {
      newBreadcrumbs = [
        {
          name: 'Home',
          screen: 'home',
        },
        {
          name: 'Login',
          screen: 'login',
        },
      ];
    } else if (screen === 'register') {
      newBreadcrumbs = [
        {
          name: 'Home',
          screen: 'home',
        },
        {
          name: 'Register',
          screen: 'register',
        },
      ];
    } else if (screen === 'reset-password') {
      newBreadcrumbs = [
        {
          name: 'Home',
          screen: 'home',
        },
        {
          name: 'Reset Password',
          screen: 'reset-password',
        },
      ];
    }

    setBreadcrumbs(newBreadcrumbs);
    setCurrentScreen(screen);
  };

  // Render the appropriate screen based on navigation state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            machines={machines}
            loading={loadingMachines}
            error={machinesError}
            onSelectMachine={(machine: Machine) => navigateTo('machine', machine)}
            onAddMachine={handleAddMachine}
          />
        );
      case 'machine':
        return selectedMachine && selectedMachine.id ? (
          <MachineDashboard
            machine={selectedMachine}
            onSelectAction={(action: string) => navigateTo(action)}
          />
        ) : null;
      case 'chat':
        return selectedMachine && selectedMachine.id ? (
          <ChatInterface machine={selectedMachine} onBack={() => navigateTo('machine')} />
        ) : null;
      case 'history':
        return selectedMachine && selectedMachine.id ? (
          <SessionHistory
            machine={selectedMachine}
            onSelectSession={(session: Session) => navigateTo('session-detail', session)}
            onBack={() => navigateTo('machine')}
          />
        ) : null;
      case 'session-detail':
        return selectedSession && selectedSession.id ? (
          <SessionDetail session={selectedSession} onBack={() => navigateTo('history')} />
        ) : null;
      case 'manual':
        return selectedMachine && selectedMachine.id && selectedMachine.name ? (
          <ManualViewer
            machine={{ id: selectedMachine.id, name: selectedMachine.name }}
            onSelectManual={(doc: Document) => navigateTo('manual-detail', doc)}
            onBack={() => navigateTo('machine')}
          />
        ) : null;
      case 'manual-detail':
        return selectedDocument ? (
          <ManualDetail document={selectedDocument} onBack={() => navigateTo('manual')} />
        ) : null;
      case 'login':
        return <LoginForm onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return <RegisterForm onRegisterSuccess={handleRegisterSuccess} />;
      case 'reset-password':
        return <PasswordResetForm />;
      default:
        return (
          <HomeScreen
            machines={machines}
            loading={loadingMachines}
            error={machinesError}
            onSelectMachine={(machine: Machine) => navigateTo('machine', machine)}
            onAddMachine={handleAddMachine}
          />
        );
    }
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  // If not authenticated, only allow auth screens
  if (!isAuthenticated) {
    if (["login", "register", "reset-password"].includes(currentScreen)) {
      return (
        <div className="flex flex-col w-full min-h-screen bg-slate-100">
          <Header
            breadcrumbs={breadcrumbs}
            onNavigate={(screen: string) => navigateTo(screen)}
          />
          <main className="flex-1 w-full">{renderScreen()}</main>
        </div>
      );
    }
    // Default to login
    return (
      <div className="flex flex-col w-full min-h-screen bg-slate-100">
        <Header
          breadcrumbs={breadcrumbs}
          onNavigate={(screen: string) => navigateTo(screen)}
        />
        <main className="flex-1 w-full">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-100">
      <Header
        breadcrumbs={breadcrumbs}
        onNavigate={(screen: string) => navigateTo(screen)}
        loginButton={
          <>
            <button onClick={() => setCurrentScreen('login')} className="ml-4 px-3 py-1 bg-blue-700 text-white rounded">Login</button>
            <button onClick={() => setCurrentScreen('register')} className="ml-2 px-3 py-1 bg-green-700 text-white rounded">Register</button>
            <button onClick={() => setCurrentScreen('reset-password')} className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded">Reset Password</button>
          </>
        }
      />
      <main className="flex-1 w-full">{renderScreen()}</main>
    </div>
  );
}
