import { NextResponse } from 'next/server';
import { auth, db } from '../../../lib/firebaseAdmin'; 

export async function POST(request: Request) {
  try {
    // 1. Get the data sent from your Dashboard Form
    const body = await request.json();
    const { email, password, name, specialty } = body;

    // 2. Create the user in Firebase Auth using the Admin SDK
    // (This securely creates the user WITHOUT logging the admin out!)
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // 3. Save the Coach's profile directly to Firestore
    await db.collection('users').doc(uid).set({
      uid: uid,
      email: email,
      name: name,
      role: 'coach', // CRITICAL: This is what unlocks the Coach features in your Flutter app!
      specialty: specialty || 'General Recovery',
      createdAt: new Date().toISOString(),
      isVerified: true,
    });

    // 4. Send a success message back to the dashboard
    return NextResponse.json(
      { success: true, message: 'Coach created successfully!', uid: uid }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating coach:', error);
    // If the email is already in use, or password is too weak, send the error back
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
