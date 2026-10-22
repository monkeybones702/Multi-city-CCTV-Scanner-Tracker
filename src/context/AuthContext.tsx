import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import type { TrackedSubject } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveTrackedSubjectToCloud: (subject: TrackedSubject) => Promise<void>;
  logIncidentReportToCloud: (report: {
    id: string;
    trackingId: string;
    subjectLabel: string;
    corridor?: string;
    cityId: string;
    sightingsCount: number;
    summary?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync or register user profile document in /users/{userId}
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (!snapshot.exists()) {
            await setDoc(userDocRef, {
              userId: user.uid,
              email: user.email || 'operator@traffic.local',
              displayName: user.displayName || 'Traffic Operator',
              photoURL: user.photoURL || '',
              role: 'operator',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } catch (err) {
          // Log according to firestore error handler specifications
          console.warn('Initial profile sync note:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error);
      throw error;
    }
  };

  const saveTrackedSubjectToCloud = async (subject: TrackedSubject) => {
    if (!currentUser) return;
    const cleanId = subject.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 64);
    const path = `users/${currentUser.uid}/tracked_subjects/${cleanId}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'tracked_subjects', cleanId), {
        id: cleanId,
        userId: currentUser.uid,
        label: subject.label.slice(0, 128),
        category: subject.category || 'vehicle',
        subtype: ((subject as any).subtype || subject.sightings?.[0]?.subtype || 'any').slice(0, 64),
        color: (subject.color || 'any').slice(0, 64),
        height: (subject.height || 'standard').slice(0, 64),
        size: (subject.size || 'standard').slice(0, 64),
        status: 'active',
        description: (subject.description || 'Monitored target').slice(0, 512),
        lastCameraId: subject.lastCameraId,
        lastCameraName: (subject.lastCameraName || 'CCTV Node').slice(0, 128),
        lastSeen: subject.lastSeen || new Date().toISOString(),
        sightingsCount: subject.sightings?.length || 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const logIncidentReportToCloud = async (report: {
    id: string;
    trackingId: string;
    subjectLabel: string;
    corridor?: string;
    cityId: string;
    sightingsCount: number;
    summary?: string;
  }) => {
    if (!currentUser) return;
    const cleanId = report.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 64);
    const path = `users/${currentUser.uid}/incident_reports/${cleanId}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'incident_reports', cleanId), {
        id: cleanId,
        userId: currentUser.uid,
        trackingId: report.trackingId.slice(0, 64),
        subjectLabel: report.subjectLabel.slice(0, 128),
        corridor: (report.corridor || 'Metropolitan Grid').slice(0, 128),
        cityId: report.cityId.slice(0, 64),
        sightingsCount: report.sightingsCount,
        summary: (report.summary || 'Official incident surveillance report generated.').slice(0, 1024),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      signInWithGoogle,
      signOut,
      saveTrackedSubjectToCloud,
      logIncidentReportToCloud
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
