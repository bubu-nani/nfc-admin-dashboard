"use client";

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, ShieldCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from our new API
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">Loading Intelligence...</div>;

  // Calculate Insights
  const totalUsers = users.length;
  const coachesCount = users.filter(u => u.role === 'coach').length;
  const membersCount = totalUsers - coachesCount;
  
  // Data for Charts
  const roleData = [
    { name: 'Members', value: membersCount },
    { name: 'Coaches', value: coachesCount },
  ];
  const COLORS = ['#3b82f6', '#10b981']; // Blue for members, Green for coaches

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
            <p className="text-gray-500 mt-1">Real-time insights for New Freedom Coaching</p>
          </div>
          <Link href="/create-coach" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <UserPlus size={20} /> Add New Coach
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Total Users" value={totalUsers} icon={<Users size={24} className="text-blue-600" />} />
          <MetricCard title="Active Coaches" value={coachesCount} icon={<ShieldCheck size={24} className="text-green-600" />} />
          <MetricCard title="Active Members" value={membersCount} icon={<Activity size={24} className="text-purple-600" />} />
        </div>

        {/* Visual Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">User Distribution</h3>
            <div className="h-64">
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
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Members</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Coaches</span>
            </div>
          </div>

          {/* Database Table */}
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
                    <tr key={i} className="border-b border-gray-50 last:border-0">
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

// Small helper component for the metric boxes
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
