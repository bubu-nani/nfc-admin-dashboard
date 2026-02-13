"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Firebase Auth Imports
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function CreateCoachPage() {
  const router = useRouter();
  
  // State to block the page from showing until we verify the user
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // State to hold the form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: ''
  });

  // State to handle API loading, success, and error messages
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  // --- SECURITY: LOCK THE DOOR ---
  useEffect(() => {
    // SAFETY CHECK: If auth is null (during build), stop here.
    if (!auth) return; 

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Kick unauthorized users to the login screen instantly
        router.push('/login');
      } else {
        // Unblock the page for the verified Admin
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle typing in the text boxes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle the submit button click
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const response = await fetch('/api/create-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ loading: false, error: '', success: 'Coach created successfully! They can now log into the app.' });
        setFormData({ name: '', email: '', password: '', specialty: '' }); // Clear form
      } else {
        setStatus({ loading: false, error: data.error || 'Failed to create coach.', success: '' });
      }
    } catch (error: any) {
      setStatus({ loading: false, error: 'Network error. Please try again.', success: '' });
    }
  };

  // Show a blank loading screen while the security check runs
  if (isAuthLoading) {
    return <div className="min-h-screen bg-gray-50"></div>; 
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative">
      
      {/* Back to Dashboard Button */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Add a New Coach
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a secure login and database profile automatically.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Coach Devendar" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="coach@newfreedom.life" />
            </div>

            {/* Temporary Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} minLength={6}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Min. 6 characters" />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialty Area</label>
              <input type="text" name="specialty" required value={formData.specialty} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g. Addiction Recovery, Trauma" />
            </div>

            {/* Status Messages */}
            {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
            {status.success && <p className="text-green-600 text-sm font-medium">{status.success}</p>}

            {/* Submit Button */}
            <div>
              <button type="submit" disabled={status.loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
                {status.loading ? 'Creating...' : 'Create Coach Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
