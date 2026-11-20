# SOFTWARE DESIGN DOCUMENT (SDD)
# Human Resource Management System (GA-HRMS)
**Internal In-House HRMS Platform — Technical Design & Architecture Specification**

---

## Document Control

| Dimension | Details |
| :--- | :--- |
| **Document Title** | GA-HRMS System Design Document (SDD) |
| **Document Version** | 2.1 — Streamlined In-House Architecture (Internal HRMS Replacement) |
| **Status** | Approved Technical Specification |
| **Author / Architect** | Internal IT & Engineering Team |
| **Date** | 20 November 2026 |
| **Reference PRD** | HRMS Production PRD v1.4 (Internal Tool Baseline) |
| **Product Purpose** | Proprietary internal company HRMS to replace annual 3rd-party vendor software licenses |
| **Target Runtime** | React 18 + TypeScript + Vite / Google Firebase (Auth, Firestore, Storage, Cloud Functions) |
| **Hosting Model** | GoDaddy Web Hosting (cPanel / Apache SPA Delivery with `.htaccess` Routing) |
| **Production Target** | 3-Month Development & Validation Runway (Internal company rollout) |

---

## Table of Contents
1. **Executive Summary & System Purpose**
2. **Architectural Principles & Quality Attributes**
3. **C4 Architectural Views (Context, Container, Component)**
4. **Single-Organization Scope & Role-Based Access Architecture**
5. **Organizational Policy & Workflow Engine Design**
6. **Configurable Workflow & Approval Engine**
7. **Domain Module Technical Design (IAM, Org, Employee, Attendance, Leave, Payroll, Audit)**
8. **Cloud Firestore Schema, Document Models & Indexing**
9. **Service Layer, Client SDK & Callable Functions**
10. **Security, Privacy & Internal Access Rules**
11. **Hosting, DevOps & 3-Month Release Runway (GoDaddy + Firebase)**

---

# 1. Executive Summary & System Purpose

### 1.1 Purpose & Strategic Context
GA-HRMS is an **in-house, internal human resource management system** developed specifically for our organization. Management has formally approved developing this proprietary tool to **replace the external 3rd-party commercial HRMS software we purchase and renew annually**.

Because this platform is strictly an **internal company tool** and will never be commercialized or sold to external third parties, all extraneous multi-tenant SaaS abstractions, per-tenant licensing, and complex tenant-isolation overhead have been deliberately eliminated. The architecture is intentionally lean, pragmatic, and purpose-built for our company's exact operational requirements.

### 1.2 System Overview
The platform centralizes all internal company operations:
- **Employee Master & Profiles**: Centralized workforce records, personal info, job details, and internal document verification.
- **Attendance & Shift Management**: Daily clock-in/out, multi-shift scheduling, grace periods, and attendance regularization approvals.
- **Leave Ledger**: Company holiday calendars, paid/casual/sick leave balances, and manager approval chains.
- **Payroll Preparation & Payslips**: Internal salary structures, monthly payroll batch runs, and downloadable employee payslips.
- **Employee Self-Service (ESS)**: Direct employee access to personal details, attendance records, leaves, and payslips.
- **Company Branch Management**: Support for multiple office campuses and physical branches with flexible staff transfers.

### 1.3 Architectural Pattern: Lean Serverless BaaS (Firebase) + Static Cloud Hosting (GoDaddy)
The architecture eliminates server maintenance overhead by pairing **Google Firebase** (Serverless Backend-as-a-Service) with **GoDaddy Web Hosting** (static frontend delivery):

```
+-----------------------------------------------------------------------------------------+
|                                  GODADDY WEB HOSTING                                    |
|                       (Apache / cPanel Linux / AutoSSL / Company Domain)                |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                       GA-HRMS CLIENT APPLICATION (SPA)                          |   |
|   |           React 18 + TypeScript + Vite + Tailwind CSS + Radix UI + Recharts      |   |
|   |         URL Rewriting via .htaccess (HTML5 PushState Deep Linking Support)      |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
                                            |
                                            | HTTPS / WSS (Firebase Client SDK v10+)
                                            v
+-----------------------------------------------------------------------------------------+
|                               GOOGLE FIREBASE PLATFORM (BaaS)                           |
|                                                                                         |
|  +---------------------------+  +---------------------------+  +---------------------+  |
|  |       FIREBASE AUTH       |  |      CLOUD FIRESTORE      |  |   FIREBASE STORAGE  |  |
|  |  Company email logins,    |  |  Real-time NoSQL DB,      |  |  Employee Dossiers, |  |
|  |  internal user roles      |  |  Single-org collections,  |  |  Payslip PDFs, KYC, |  |
|  |  (ADMIN, HR, MGR, EMP)    |  |  Offline Local Cache      |  |  Company Assets     |  |
|  +---------------------------+  +---------------------------+  +---------------------+  |
|               |                               |                            |            |
|               v                               v                            v            |
|  +-----------------------------------------------------------------------------------+  |
|  |                      INTERNAL SECURITY RULES & ACCESS CONTROL                     |  |
|  |          firestore.rules & storage.rules enforce internal role permissions         |  |
|  +-----------------------------------------------------------------------------------+  |
|                                               |                                         |
|                                               v                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                       FIREBASE CLOUD FUNCTIONS (SERVERLESS)                       |  |
|  |         Scheduled Crons (Monthly Payroll Run, Annual Leave Resets, Alerts)        |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

# 2. Architectural Principles & Quality Attributes

### 2.1 Architectural Invariants
1. **Lean Single-Organization Scope**: All collections represent our company's single organizational boundary. No multi-tenant partitions, cross-tenant isolation checks, or tenant routing logic.
2. **Zero Commercial Bloat**: No subscription tier gating, platform feature entitlements, or billing engines. All HR modules are 100% active for the company.
3. **Calculation Determinism**: Business policies (attendance grace periods, overtime rules, leave balances) are maintained cleanly in company settings. Processed payroll runs and attendance records are stored as immutable snapshots.
4. **Role-Based Internal Access Control**: Permissions strictly follow internal organization roles: `SUPER_ADMIN` (IT/System), `HR_ADMIN` (People Ops), `MANAGER` (Team Leads), and `EMPLOYEE` (General Staff).
5. **3-Month Internal Runway**: Development, integration, and internal user acceptance testing (UAT) will proceed over a 3-month timeline before going live internally.

### 2.2 Quality Attributes

| Attribute | Target | Implementation Approach |
| :--- | :--- | :--- |
| **Performance** | Page initial load < 1.5s; Firestore read < 80ms | Static asset caching on GoDaddy Apache (`mod_expires`, `mod_deflate`), Firestore local cache |
| **Scalability** | All internal employees (~500–5,000 headcount) | Cloud Firestore easily scales to internal company volume with zero manual database tuning |
| **Availability** | 99.9% uptime during business hours | Google Cloud multi-region Firestore backend; static assets on GoDaddy |
| **Data Integrity** | Zero balance or calculation drift | Firestore atomic transactions (`runTransaction`) for leave balances and approvals |
| **Simplicity** | Minimal codebase complexity | Direct Firebase client SDK calls from React context; no intermediate proxy API layers |

---

# 3. C4 Architectural Views

### 3.1 C4 Level 1: System Context Diagram

```
+-----------------------------------------------------------------------------------+
|                               OUR COMPANY BOUNDARY                                |
|                                                                                   |
|    [ Employees ]       [ Managers ]      [ HR Admins ]       [ IT Admins ]        |
|   (Punch, Leave,      (Approve Leave,    (Employee Master,   (System Settings,    |
|     Payslips)          Regularization)     Payroll Runs)       Role Management)   |
|          \                  \                //                     //            |
|           \                  \              //                     //             |
|            v                   v            v                     v               |
|       +---------------------------------------------------------------+           |
|       |                           GA-HRMS                             |           |
|       |               Internal In-House HRMS Web App                  |           |
|       |           (React 18 SPA hosted on GoDaddy Apache)             |           |
|       +---------------------------------------------------------------+           |
|                                       |                                           |
|                                       v                                           |
|       +---------------------------------------------------------------+           |
|       |                     GOOGLE FIREBASE (BaaS)                    |           |
|       |           Auth  |  Cloud Firestore  |  Cloud Storage          |           |
|       +---------------------------------------------------------------+           |
+-----------------------------------------------------------------------------------+
```

### 3.2 C4 Level 2: Container Diagram

```
+---------------------------------------------------------------------------------------------+
|                                    GA-HRMS APPLICATION                                      |
|                                                                                             |
|  +---------------------------------------------------------------------------------------+  |
|  |                            GODADDY LINUX WEB HOSTING                                  |  |
|  |  +---------------------------------------------------------------------------------+  |  |
|  |  |                     Single-Page Application (Frontend Container)                |  |  |
|  |  |  React 18 / TypeScript / Vite / Tailwind CSS / Radix UI                         |  |  |
|  |  |  Apache Web Server with .htaccess Rewrite Engine                                 |  |  |
|  |  +---------------------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------------------+  |
|                                            |                                                |
|                                            | Direct HTTPS / WebSockets (Firebase Web SDK)   |
|                                            v                                                |
|  +---------------------------------------------------------------------------------------+  |
|  |                                 GOOGLE FIREBASE CLOUD                                 |  |
|  |  +--------------------------+  +--------------------------+  +---------------------+  |  |
|  |  |      Firebase Auth       |  |     Cloud Firestore      |  |   Firebase Storage  |  |  |
|  |  | Employee authentication, |  | Company data collections |  | Internal documents, |  |  |
|  |  | internal role claims     |  | Real-time listeners      |  | payslips & resumes  |  |  |
|  |  +--------------------------+  +--------------------------+  +---------------------+  |  |
|  +---------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------+
```

---

# 4. Single-Organization Scope & Role-Based Access Architecture

### 4.1 Internal Organization Model
The system represents one unified company entity with multiple physical offices:
- **Company Profile**: Single source of truth stored in `company/profile`.
- **Branches / Campuses**: Support for all physical office locations (e.g. Pune HQ, Bangalore Branch, etc.).
- **Departments & Designations**: Internal corporate hierarchy and team structures.
- **Reporting Relationships**: Every employee links to a `reportingManagerId` for approval workflows.

### 4.2 Streamlined Role Matrix

| Role | Target Users | Permissions & Capabilities |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | IT Administrators | System settings, role assignments, audit logs, branch & company profile setup. |
| **`HR_ADMIN`** | HR Team & People Ops | Employee master CRUD, attendance management, leave approvals, payroll runs, recruitment. |
| **`MANAGER`** | Department Leads & Supervisors | Review & approve team leaves/regularizations, review team appraisals & goals. |
| **`EMPLOYEE`** | All Company Staff | Self-service attendance clock-in/out, view balance, apply leave, view payslips, edit profile. |

---

# 5. Organizational Policy & Workflow Engine Design

### 5.1 Simple Configuration Model
Instead of complex multi-tier SaaS engines, company settings are stored directly in `company/settings`:
- **Attendance Settings**: Shift timings, grace periods (e.g. 15 mins), minimum half-day / full-day hours.
- **Leave Policies**: Annual allowance per leave category (Sick, Casual, Privilege), carry-forward rules.
- **Payroll Rules**: Default allowances (HRA, Special Allowance), statutory deductions (PF, Professional Tax).

### 5.2 Approvals & State Machine
Approval workflows follow direct internal reporting lines:
1. **Leave Requests**: `EMPLOYEE` submits -> `MANAGER` approves/rejects -> `HR_ADMIN` final confirmation (if required).
2. **Attendance Regularization**: `EMPLOYEE` submits missed punch reason -> `MANAGER` verifies & approves -> Attendance updated.

---

# 6. Domain Module Technical Design

### 6.1 Identity & Access Management (IAM)
- Authenticates internal company staff using email and password (with optional Google Workspace SSO).
- Role stored directly in the employee profile document and mirrored to Firebase Auth Custom Claims.

### 6.2 Employee Lifecycle
- Centralized `employees` collection holding personal, job, branch, department, and salary mappings.
- Status states: `ACTIVE`, `PROBATION`, `NOTICE_PERIOD`, `RESIGNED`, `TERMINATED`.

### 6.3 Attendance & Shifts
- Real-time `IN` and `OUT` punch tracking.
- Automatic daily duration calculations and status flags (`PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`).
- Regularization approval automatically corrects the attendance register.

### 6.4 Leave & Holidays
- Atomic balance deductions when leave is approved.
- Company-wide holiday calendar displayed across employee self-service dashboards.

### 6.5 Payroll & Payslips
- Internal monthly payroll run calculates gross salary, deductions, and net payout based on attendance.
- Finalized payslips are generated as records and can be downloaded by employees directly.

### 6.6 Audit Trail
- Simple append-only `audit_logs` collection logging all sensitive actions (salary changes, policy updates, status shifts).

---

# 7. Cloud Firestore Schema & Document Models

All data lives in clean, un-nested root collections:

```
firestore/
├── company/
│   ├── profile                       // Company name, logo, registration, tax IDs
│   └── settings                      // Shift rules, grace periods, payroll settings
├── branches/
│   └── {branchId}                    // name, code, city, address, isHeadOffice
├── departments/
│   └── {departmentId}               // name, code, headCount, parentDepartmentId
├── designations/
│   └── {designationId}              // title, code, level, departmentId
├── employees/
│   └── {employeeId}                 // personal, employment, departmentId, branchId, salary
├── attendance/
│   └── {attendanceId}               // date, employeeId, punchIn, punchOut, totalHours, status
├── regularizations/
│   └── {regId}                      // date, employeeId, reason, status, managerComment
├── leave_types/
│   └── {leaveTypeId}                // name, code, daysAllowed, carryForwardMax
├── leave_requests/
│   └── {requestId}                  // employeeId, leaveTypeId, fromDate, toDate, status
├── holidays/
│   └── {holidayId}                  // name, date, optionalBranchIds
├── shifts/
│   └── {shiftId}                    // name, startTime, endTime, gracePeriodMinutes
├── salary_structures/
│   └── {structureId}                // employeeId, basic, hra, allowances, deductions
├── payroll_runs/
│   └── {runId}                      // month, year, totalGross, totalNet, status
├── payslips/
│   └── {payslipId}                  // runId, employeeId, breakdown, netSalary, status
├── jobs/
│   └── {jobId}                      // internal/external hiring requisitions
├── candidates/
│   └── {candidateId}                // applicant tracking & recruitment pipeline
├── assets/
│   └── {assetId}                    // company laptops, monitors, access cards
├── performance_goals/
│   └── {goalId}                     // employee OKRs and review goals
├── appraisals/
│   └── {appraisalId}                // periodic performance reviews
├── onboarding_dossiers/
│   └── {dossierId}                  // new hire onboarding documents & verification checklist
├── notifications/
│   └── {notificationId}             // internal staff alerts and announcements
└── audit_logs/
    └── {logId}                      // action, actor, timestamp, details
```

---

# 8. Service Layer & Frontend Integration

### 8.1 Unified Service Architecture
The React application maintains clean service wrappers under `src/lib/`:
- `hrmsContext.tsx`: The primary state and action provider for all UI components.
- `authContext.tsx`: Authentication state, current user persona, and role checks.
- Direct Firestore bindings: Real-time synchronization using `onSnapshot` for active modules and promises for batch operations.

---

# 9. Security & Access Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && request.auth.token.role == 'SUPER_ADMIN';
    }
    
    function isHRAdmin() {
      return isAuthenticated() && (request.auth.token.role == 'HR_ADMIN' || isSuperAdmin());
    }
    
    function isOwner(employeeId) {
      return isAuthenticated() && request.auth.token.employeeId == employeeId;
    }

    // Audit logs: viewable by HR/SuperAdmin; strictly append-only
    match /audit_logs/{logId} {
      allow read: if isHRAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }

    // Employees directory: readable by all staff; writable by HR/Admin
    match /employees/{employeeId} {
      allow read: if isAuthenticated();
      allow write: if isHRAdmin();
    }

    // Payslips: strictly private to the employee or HR Admin
    match /payslips/{payslipId} {
      allow read: if isHRAdmin() || isOwner(resource.data.employeeId);
      allow write: if isHRAdmin();
    }

    // Default internal rule: authenticated company staff can read and interact
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

---

# 10. Hosting & 3-Month Release Runway

### 10.1 GoDaddy Web Hosting
- **Server**: Apache on Linux (GoDaddy Web Hosting).
- **Domain**: Company intranet / internal domain with GoDaddy AutoSSL.
- **SPA Routing**: `.htaccess` handles deep links (`/employees`, `/payroll`, `/time`) cleanly without 404 errors.

### 10.2 3-Month Development & Internal Launch Runway
No production deployment will occur during the 3-month development window. The delivery timeline focuses on internal company rollout:

```
[ Month 1: Foundation & BaaS Setup ]
├── Week 1-2: Firebase Auth integration & internal role definitions
├── Week 3-4: Firestore company data models & seed data import

[ Month 2: Core Workflows & Daily Operations ]
├── Week 5-6: Employee Directory, Attendance punch & Regularization approvals
├── Week 7-8: Leave balance ledger & Monthly payroll snapshot generation

[ Month 3: Testing, Hardening & Internal Rollout ]
├── Week 9-10: File uploads via Firebase Storage & internal Security Rules audit
├── Week 11-12: Internal UAT with HR & Finance, staff onboarding, cutover from external vendor
```
