import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
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
} from "../seedData";

function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if Firestore has already been seeded
 */
export async function isFirestoreSeeded(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, "company"));
    return !snap.empty;
  } catch (error) {
    console.warn("Could not check if Firestore is seeded:", error);
    return false;
  }
}

/**
 * Seed Firestore with the November 2026 HRMS baseline dataset
 */
export async function seedFirestoreWithNovember2026(force = false): Promise<{ success: boolean; message: string }> {
  try {
    if (!force) {
      const alreadySeeded = await isFirestoreSeeded();
      if (alreadySeeded) {
        return { success: true, message: "Firestore is already seeded with company data." };
      }
    }

    // 1. Company
    await setDoc(doc(db, "company", initialCompany.id), {
      ...sanitize(initialCompany),
      updatedAt: serverTimestamp(),
    });

    // 2. Organization Structure in Batches
    const batch1 = writeBatch(db);

    initialBranches.forEach((b) => {
      batch1.set(doc(db, "branches", b.id), sanitize(b));
    });
    initialDepartments.forEach((d) => {
      batch1.set(doc(db, "departments", d.id), sanitize(d));
    });
    initialDesignations.forEach((ds) => {
      batch1.set(doc(db, "designations", ds.id), sanitize(ds));
    });
    initialShifts.forEach((s) => {
      batch1.set(doc(db, "shifts", s.id), sanitize(s));
    });
    initialLeaveTypes.forEach((p) => {
      batch1.set(doc(db, "policies", p.id), sanitize(p));
    });

    await batch1.commit();

    // 3. Employees
    const batch2 = writeBatch(db);
    initialEmployees.forEach((emp) => {
      batch2.set(doc(db, "employees", emp.id), sanitize(emp));
    });
    await batch2.commit();

    // 4. Attendance (November 2026)
    const batch3 = writeBatch(db);
    initialAttendanceRecords.slice(0, 450).forEach((att) => {
      batch3.set(doc(db, "attendance", att.id), sanitize(att));
    });
    await batch3.commit();

    // 5. Leave & Regularization Requests
    const batch4 = writeBatch(db);
    initialLeaveRequests.forEach((lr) => {
      batch4.set(doc(db, "leave_requests", lr.id), sanitize(lr));
    });
    initialRegularizations.forEach((rr) => {
      batch4.set(doc(db, "regularization_requests", rr.id), sanitize(rr));
    });
    initialPayrollRecords.forEach((pr) => {
      batch4.set(doc(db, "payroll_records", pr.id), sanitize(pr));
    });
    batch4.set(doc(db, "settings", "company"), sanitize(initialSettings));

    await batch4.commit();

    return { success: true, message: "Firestore successfully seeded with November 2026 HRMS dataset!" };
  } catch (error) {
    console.error("Error seeding Firestore:", error);
    return { success: false, message: (error as Error).message };
  }
}
