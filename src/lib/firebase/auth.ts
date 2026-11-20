import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "./config";
import { CurrentUser, UserRole } from "../../types/hrms";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<{ user: FirebaseUser; hrmsUser: CurrentUser }> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;

  // Retrieve user profile from Firestore users/{uid}
  const userRef = doc(db, "users", fbUser.uid);
  const snap = await getDoc(userRef);

  let hrmsUser: CurrentUser;
  if (snap.exists()) {
    hrmsUser = snap.data() as CurrentUser;
  } else {
    const isAdmin =
      email.toLowerCase().includes("admin") ||
      email === "pawarajay7878@gmail.com" ||
      email === "ajay.pawar@ga-hrms.io";

    hrmsUser = {
      id: fbUser.uid,
      name: fbUser.displayName || email.split("@")[0],
      email: fbUser.email || email,
      role: (isAdmin ? "SUPER_ADMIN" : "EMPLOYEE") as UserRole,
      avatar: "",
      employeeId: isAdmin ? "EMP-ADMIN-01" : `EMP-${fbUser.uid.substring(0, 5).toUpperCase()}`,
      designation: isAdmin ? "System Administrator" : "Staff Member",
      department: isAdmin ? "System Administration" : "Operations",
    };

    await setDoc(userRef, {
      ...hrmsUser,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  }

  return { user: fbUser, hrmsUser };
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole = "EMPLOYEE"
): Promise<{ user: FirebaseUser; hrmsUser: CurrentUser }> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;

  const hrmsUser: CurrentUser = {
    id: fbUser.uid,
    name: displayName,
    email: fbUser.email || email,
    role,
    avatar: "",
    employeeId: `EMP-${fbUser.uid.substring(0, 5).toUpperCase()}`,
    designation: "Team Member",
    department: "Operations",
  };

  await setDoc(doc(db, "users", fbUser.uid), {
    ...hrmsUser,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return { user: fbUser, hrmsUser };
}

/**
 * Sign Out from Firebase
 */
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Send Password Reset Email
 */
export async function sendResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
