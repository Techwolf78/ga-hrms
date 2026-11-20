import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider, db } from "./config";
import { CurrentUser, UserRole } from "../../types/hrms";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; hrmsUser: CurrentUser }> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  // Sync / find HRMS user profile in Firestore
  const userRef = doc(db, "users", fbUser.uid);
  const snap = await getDoc(userRef);

  let hrmsUser: CurrentUser;
  if (snap.exists()) {
    hrmsUser = snap.data() as CurrentUser;
  } else {
    // Determine default role: admin if matching admin email, otherwise EMPLOYEE
    const isAdmin =
      fbUser.email?.toLowerCase().includes("admin") ||
      fbUser.email === "pawarajay7878@gmail.com" ||
      fbUser.email === "admin@ga-hrms.io";

    hrmsUser = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split("@")[0] || "Employee",
      email: fbUser.email || "",
      role: (isAdmin ? "SUPER_ADMIN" : "EMPLOYEE") as UserRole,
      avatar: fbUser.photoURL || "",
      employeeId: isAdmin ? "EMP-ADMIN-01" : `EMP-${fbUser.uid.substring(0, 5).toUpperCase()}`,
      designation: isAdmin ? "System Administrator" : "Team Member",
      department: isAdmin ? "System Administration" : "Operations",
    };

    // Save initial user profile in Firestore
    await setDoc(userRef, {
      ...hrmsUser,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  }

  return { user: fbUser, hrmsUser };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
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

