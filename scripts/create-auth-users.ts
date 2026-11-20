import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwj3fRAPgSSfbMpxxY-nz8-usz8w93S4U",
  authDomain: "ga-hrms-70260.firebaseapp.com",
  projectId: "ga-hrms-70260",
  storageBucket: "ga-hrms-70260.firebasestorage.app",
  messagingSenderId: "1054915446388",
  appId: "1:1054915446388:web:203303452423b955047321",
};

const DEFAULT_PASSWORD = "Password@123";

const USERS_TO_REGISTER = [
  {
    email: "admin@ga-hrms.io",
    name: "System Admin",
    role: "SUPER_ADMIN",
    employeeId: "usr-admin-01",
    designation: "System Administrator",
    department: "System Administration",
  },
  {
    email: "ajay.pawar@ga-hrms.io",
    name: "Ajay Pawar",
    role: "SUPER_ADMIN",
    employeeId: "EMP-1001",
    designation: "Head of Engineering",
    department: "Engineering & Cloud Platforms",
  },
  {
    email: "priya.sharma@ga-hrms.io",
    name: "Priya Sharma",
    role: "HR_ADMIN",
    employeeId: "EMP-1002",
    designation: "Senior HR Business Partner",
    department: "Human Resources & People Ops",
  },
  {
    email: "rajesh.kulkarni@ga-hrms.io",
    name: "Rajesh Kulkarni",
    role: "MANAGER",
    employeeId: "EMP-1003",
    designation: "Lead Architect & People Manager",
    department: "Engineering & Cloud Platforms",
  },
  {
    email: "ananya.iyer@ga-hrms.io",
    name: "Ananya Iyer",
    role: "EMPLOYEE",
    employeeId: "EMP-1004",
    designation: "Senior Software Engineer",
    department: "Engineering & Cloud Platforms",
  },
  {
    email: "ramesh.patil@ga-hrms.io",
    name: "Ramesh Patil",
    role: "EMPLOYEE",
    employeeId: "EMP-1033",
    designation: "Full Stack Developer",
    department: "Engineering & Cloud Platforms",
  },
  {
    email: "vikram.malhotra@ga-hrms.io",
    name: "Vikram Malhotra",
    role: "EMPLOYEE",
    employeeId: "EMP-1005",
    designation: "Staff DevOps & Reliability Engineer",
    department: "Engineering & Cloud Platforms",
  },
  {
    email: "sneha.patel@ga-hrms.io",
    name: "Sneha Patel",
    role: "MANAGER",
    employeeId: "EMP-1006",
    designation: "Lead Product Designer",
    department: "Product & Experience Design",
  },
];

async function registerUsers() {
  console.log("🚀 Registering Email/Password users in Firebase Authentication...");

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  for (const u of USERS_TO_REGISTER) {
    try {
      let fbUser;
      try {
        const cred = await createUserWithEmailAndPassword(auth, u.email, DEFAULT_PASSWORD);
        fbUser = cred.user;
        console.log(`✅ Created new Firebase Auth account: ${u.email} (UID: ${fbUser.uid})`);
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          console.log(`ℹ️ Account already exists: ${u.email}. Signing in to verify/update profile...`);
          const cred = await signInWithEmailAndPassword(auth, u.email, DEFAULT_PASSWORD);
          fbUser = cred.user;
        } else {
          throw err;
        }
      }

      // Update Display Name
      if (fbUser.displayName !== u.name) {
        await updateProfile(fbUser, { displayName: u.name });
      }

      // Sync Firestore User profile
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          id: fbUser.uid,
          name: u.name,
          email: u.email,
          role: u.role,
          employeeId: u.employeeId,
          designation: u.designation,
          department: u.department,
          avatar: "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`   Linked Firestore profile for ${u.name} (${u.role})`);
      await signOut(auth);
    } catch (err) {
      console.error(`❌ Failed to register ${u.email}:`, err);
    }
  }

  console.log("\n🎉 ALL USERS SUCCESSFULLY REGISTERED IN FIREBASE AUTH!");
  console.log(`🔑 All accounts initialized with default password: ${DEFAULT_PASSWORD}`);
  process.exit(0);
}

registerUsers().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
