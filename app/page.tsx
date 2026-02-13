"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Activity, ShieldCheck, UserPlus, LogOut } from 'lucide-react';
import Link from 'next/link';

// Firebase Auth Imports
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function DashboardHome() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    // FIX: Added '!' after auth
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetch('/api/users')
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setUsers(data.users);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching users:", err);
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      // FIX: Added '!' after auth
      await signOut(auth!);
      router.push('/login'); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium text-lg">
        Authenticating & Loading Intelligence...
      </div>
    );
  }

  // Calculate Insights
  const totalUsers = users.length;
  const coachesCount = users.filter((u) => u.role === 'coach').length;
  const membersCount = totalUsers - coachesCount;
  
  const roleData = [
    { name: 'Members', value: membersCount },
    { name: 'Coaches', value: coachesCount },
  ];
  const COLORS = ['#3b82f6', '#10b981']; 

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
            <p className="text-gray-500 mt-1">Real-time insights for New Freedom Coaching</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/create-coach" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
              <UserPlus size={20} /> Add New Coach
            </Link>
            
            <button onClick={handleLogout} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Total Users" value={totalUsers} icon={<Users size={24} className="text-blue-600" />} />
          <MetricCard title="Active Coaches" value={coachesCount} icon={<ShieldCheck size={24} className="text-green-600" />} />
          <MetricCard title="Active Members" value={membersCount} icon={<Activity size={24} className="text-purple-600" />} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold mb-4">User Distribution</h3>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Members</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Coaches</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold mb-4">Recent Registrations</h3>
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 6).map((user, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium">{user.name || 'Anonymous'}</td>
                      <td className="py-3 text-gray-500">{user.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'coach' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role || 'member'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: number, icon: any }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
