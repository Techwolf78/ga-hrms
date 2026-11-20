import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  doc,
  writeBatch,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  initialCompany,
  initialBranches,
  initialDepartments,
  initialDesignations,
  initialShifts,
  initialLeaveTypes,
  initialEmployees,
  initialAttendanceRecords,
  initialLeaveRequests,
  initialRegularizations,
  initialPayrollRecords,
  initialSettings,
} from "../src/lib/seedData";

const firebaseConfig = {
  apiKey: "AIzaSyCwj3fRAPgSSfbMpxxY-nz8-usz8w93S4U",
  authDomain: "ga-hrms-70260.firebaseapp.com",
  projectId: "ga-hrms-70260",
  storageBucket: "ga-hrms-70260.firebasestorage.app",
  messagingSenderId: "1054915446388",
  appId: "1:1054915446388:web:203303452423b955047321",
};

function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

async function seed() {
  console.log("🚀 Starting Firestore Seeding for ga-hrms-70260...");

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log("🔐 Authenticating session via Firebase Auth...");
  const cred = await signInAnonymously(auth);
  console.log(`✅ Authenticated with temporary UID: ${cred.user.uid}`);

  // 1. Company
  console.log("🏢 Seeding company profile...");
  await setDoc(doc(db, "company", initialCompany.id), {
    ...sanitize(initialCompany),
    updatedAt: serverTimestamp(),
  });

  // 2. Organization Structure
  console.log("🏗️ Seeding branches, departments, designations, shifts, and leave policies...");
  const batch1 = writeBatch(db);
  initialBranches.forEach((b) => batch1.set(doc(db, "branches", b.id), sanitize(b)));
  initialDepartments.forEach((d) => batch1.set(doc(db, "departments", d.id), sanitize(d)));
  initialDesignations.forEach((ds) => batch1.set(doc(db, "designations", ds.id), sanitize(ds)));
  initialShifts.forEach((s) => batch1.set(doc(db, "shifts", s.id), sanitize(s)));
  initialLeaveTypes.forEach((p) => batch1.set(doc(db, "policies", p.id), sanitize(p)));
  await batch1.commit();
  console.log(`✅ Seeded ${initialBranches.length} branches, ${initialDepartments.length} departments, ${initialDesignations.length} designations, ${initialShifts.length} shifts, ${initialLeaveTypes.length} policies.`);

  // 3. Employees
  console.log(`👥 Seeding ${initialEmployees.length} employees...`);
  const batch2 = writeBatch(db);
  initialEmployees.forEach((emp) => batch2.set(doc(db, "employees", emp.id), sanitize(emp)));
  await batch2.commit();
  console.log(`✅ Seeded ${initialEmployees.length} employee records.`);

  // 4. Attendance
  console.log(`📅 Seeding November 2026 attendance records...`);
  const attendanceToSeed = initialAttendanceRecords.slice(0, 450);
  const batch3 = writeBatch(db);
  attendanceToSeed.forEach((att) => batch3.set(doc(db, "attendance", att.id), sanitize(att)));
  await batch3.commit();
  console.log(`✅ Seeded ${attendanceToSeed.length} attendance records.`);

  // 5. Leave & Regularization & Payroll
  console.log("📑 Seeding leave requests, regularizations, and payroll...");
  const batch4 = writeBatch(db);
  initialLeaveRequests.forEach((lr) => batch4.set(doc(db, "leave_requests", lr.id), sanitize(lr)));
  initialRegularizations.forEach((rr) => batch4.set(doc(db, "regularization_requests", rr.id), sanitize(rr)));
  initialPayrollRecords.forEach((pr) => batch4.set(doc(db, "payroll_records", pr.id), sanitize(pr)));
  batch4.set(doc(db, "settings", "company"), sanitize(initialSettings));
  await batch4.commit();
  console.log(`✅ Seeded ${initialLeaveRequests.length} leave requests, ${initialRegularizations.length} regularizations, ${initialPayrollRecords.length} payroll records, and company settings.`);

  console.log("\n🎉 ALL COLLECTIONS SUCCESSFULLY SEEDED IN CLOUD FIRESTORE!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
