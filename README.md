# GA-HRMS

A modern, streamlined internal Human Resource Management System (HRMS) platform built as a proprietary in-house tool to replace recurring annual 3rd-party software vendor licenses. Powered by a Serverless Backend-as-a-Service (BaaS) architecture using Google Firebase, a React 18 + Vite frontend, and hosted on GoDaddy Web Hosting.

## Architecture Highlights

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 6](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Hosting**: **GoDaddy Web Hosting** (Apache / cPanel Linux with `.htaccess` HTML5 history pushState URL rewrite and GoDaddy AutoSSL)
- **Backend & Data (Serverless BaaS)**:
  - **Firebase Authentication**: User identity, company email logins, and Custom Claims for internal Role-Based Access Control (`SUPER_ADMIN`, `HR_ADMIN`, `MANAGER`, `EMPLOYEE`).
  - **Cloud Firestore**: Real-time NoSQL database with single-company workforce collections, local persistent cache, and sub-100ms queries.
  - **Firebase Cloud Storage**: Encrypted document storage for candidate dossiers, employee KYC, resumes, and payslip PDFs.
  - **Firebase Security Rules**: Declarative access control directly at the database and storage layers.
  - **Firebase Cloud Functions**: Serverless event triggers and scheduled crons (monthly payroll calculation, annual leave accrual resets).
- **Project Roadmap**: Active 3-month development, testing, and internal validation cycle prior to company cutover.

## Core Features

- **Executive & Operational Dashboard**: Real-time KPI metrics, attendance tracking, department distribution, and upcoming activities.
- **Employee Directory & Profiles**: Comprehensive workforce management with role-based attributes and department organization.
- **Attendance & Shift Management**: Check-in/out logs, overnight shift pairing, and attendance regularization approval pipelines.
- **Leave Management & Ledger**: Multi-type leave requests, balance ledger, holiday calendars, and approval workflows.
- **Recruitment & Applicant Tracking**: Job postings, hiring pipelines, candidate stages, and onboarding dossier checklists.
- **Payroll & Compensation**: Salary structures, allowances, deductions, monthly payroll batch runs, and payslips.
- **Performance & OKRs**: Goal setting, OKRs, appraisal review cycles, and 360 feedback logs.
- **Organization & Multi-Branch**: Campus and branch management, staff transfers, and department hierarchy.
- **Audit Ledger**: Immutable append-only audit trail capturing administrative and lifecycle actions.

## Tech Stack

- **Client**: React 18, Vite 6, TypeScript, Tailwind CSS, Radix UI Primitives, Lucide Icons, Recharts
- **Routing**: React Router v6 + GoDaddy Apache `.htaccess` rewrite
- **Cloud Backend**: Google Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Hosting Infrastructure**: GoDaddy Web Hosting (cPanel / Apache)

## Getting Started (Development)

### Prerequisites

- Node.js (v18.0 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Techwolf78/ga-hrms.git
   cd ga-hrms
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Production Build (for GoDaddy `public_html` upload):
   ```bash
   npm run build
   ```
   *Note: Output is generated in `dist/` along with the `.htaccess` configuration for GoDaddy Apache server.*

## Documentation References

- **System Design Document**:
  - [HRMS Internal SDD v2.1 (Markdown)](file:///C:/Users/AjayPawar/Desktop/code/ga-hrms/docs/HRMS_Internal_SDD_v2.1.md)
  - [HRMS Internal SDD v2.1 (PDF)](file:///C:/Users/AjayPawar/Desktop/code/ga-hrms/docs/HRMS_Internal_SDD_v2.1.pdf)
- **Product Requirements Document**:
  - [HRMS Internal PRD v1.4 (Markdown)](file:///C:/Users/AjayPawar/Desktop/code/ga-hrms/docs/HRMS_Internal_PRD_v1.4.md)
  - [HRMS Internal PRD v1.4 (PDF)](file:///C:/Users/AjayPawar/Desktop/code/ga-hrms/docs/HRMS_Internal_PRD_v1.4.pdf)

## License

Private / Proprietary.
