import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Student, PaymentTransaction, User } from './types';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { StudentIDCardModal } from './components/StudentIDCardModal';
import { AddEditStudentModal } from './components/AddEditStudentModal';
import { DashboardView } from './views/DashboardView';
import { ScanStudentView } from './views/ScanStudentView';
import { FeeCollectionFastView } from './views/FeeCollectionFastView';
import { StudentFeeProfileView } from './views/StudentFeeProfileView';
import { StudentsListView } from './views/StudentsListView';
import { DueManagementView } from './views/DueManagementView';
import { TransactionsListView } from './views/TransactionsListView';
import { StudentLedgerView } from './views/StudentLedgerView';
import { FeeStructureView } from './views/FeeStructureView';
import { ReportsView } from './views/ReportsView';
import { UserManagementView } from './views/UserManagementView';
import { AuditLogView } from './views/AuditLogView';
import { BackupRestoreView } from './views/BackupRestoreView';
import { SettingsView } from './views/SettingsView';
import { TeacherCornerView } from './views/TeacherCornerView';
import { EnterpriseLicenseView } from './views/EnterpriseLicenseView';
import { ErrorDemoModal } from './views/ErrorDemoModal';
import { EnterpriseLicenseModal } from './components/EnterpriseLicenseModal';
import { EnterprisePartnerPortal } from './views/EnterprisePartnerPortal';
import { SchoolLicenseActivationModal } from './components/SchoolLicenseActivationModal';
import { KeyRound, Sparkles } from 'lucide-react';

export default function App() {
  const [portalMode, setPortalMode] = useState<'school' | 'enterprise_partner'>('school');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('SRA26-001');

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>(undefined);
  const [activeTransaction, setActiveTransaction] = useState<PaymentTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [studentForIDCard, setStudentForIDCard] = useState<Student | undefined>(undefined);
  const [showIDCardModal, setShowIDCardModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);

  // Check URL parameters for receipt verification on load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const verifyReceiptNo = params.get('verify') || params.get('receipt');
      if (verifyReceiptNo) {
        let tx = db.getTransactionByReceipt(verifyReceiptNo);
        if (!tx) {
          tx = db.getAllTransactions().find(
            (t) => t.receiptNo.toLowerCase() === verifyReceiptNo.toLowerCase()
          );
        }
        if (!tx && params.get('student') && params.get('amount')) {
          const studentId = params.get('student')!;
          const student = db.getStudentById(studentId);
          tx = {
            receiptNo: verifyReceiptNo,
            date: params.get('date') || new Date().toISOString(),
            studentId: studentId,
            studentName: student?.name || 'Verified Student',
            classNum: student?.classNum || 5,
            section: student?.section || 'A',
            academicYear: student?.academicYear || '2026-2027',
            items: [{
              feeCategory: 'Tuition Fee',
              assignedAmount: Number(params.get('amount')),
              amountPaid: Number(params.get('amount')),
              remainingDue: 0
            }],
            grossAmount: Number(params.get('amount')),
            discountAmount: 0,
            discountType: 'fixed',
            netAmountPaid: Number(params.get('amount')),
            paymentMethod: 'UPI',
            receivedBy: 'Chief Accounts Officer',
            previousOutstanding: 0,
            remainingOutstanding: 0,
            status: 'Completed'
          };
        }
        if (tx) {
          setActiveTransaction(tx);
          setShowReceiptModal(true);
        }
      }
    } catch (err) {
      console.error('Error reading verification param', err);
    }
  }, []);

  // Global Keyboard Shortcuts (F1 - F9, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in a text input or textarea, let some keys work, but handle Function keys
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setActiveView('dashboard');
          break;
        case 'F2':
          e.preventDefault();
          setActiveView('scan');
          break;
        case 'F3':
          e.preventDefault();
          setActiveView('collect');
          break;
        case 'F5':
          e.preventDefault();
          setActiveView('students');
          break;
        case 'F6':
          e.preventDefault();
          setActiveView('reports');
          break;
        case 'F7':
          e.preventDefault();
          setActiveView('transactions');
          break;
        case 'F8':
          e.preventDefault();
          setActiveView('dues');
          break;
        case 'F9':
          e.preventDefault();
          window.print();
          break;
        case 'Escape':
          // Dismiss open modals
          if (showReceiptModal) setShowReceiptModal(false);
          else if (showAddStudentModal) setShowAddStudentModal(false);
          else if (showIDCardModal) setShowIDCardModal(false);
          else if (showErrorModal) setShowErrorModal(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReceiptModal, showAddStudentModal, showIDCardModal, showErrorModal]);

  const handleNavigate = (view: string, studentId?: string) => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    setActiveView(view);
  };

  const handleStudentFoundFromScan = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView('collect');
  };

  const handlePaymentSuccess = (transaction: PaymentTransaction) => {
    setActiveTransaction(transaction);
    setShowReceiptModal(true);
  };

  const handleOpenAddStudent = () => {
    setStudentToEdit(undefined);
    setShowAddStudentModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setShowAddStudentModal(true);
  };

  const handleStudentSaved = (student: Student, shouldPrintID?: boolean) => {
    setShowAddStudentModal(false);
    setSelectedStudentId(student.id);
    if (shouldPrintID) {
      setStudentForIDCard(student);
      setShowIDCardModal(true);
    } else {
      setActiveView('profile');
    }
  };

  const handleViewReceipt = (tx: PaymentTransaction) => {
    setActiveTransaction(tx);
    setShowReceiptModal(true);
  };

  const handlePrintIDCard = (student: Student) => {
    setStudentForIDCard(student);
    setShowIDCardModal(true);
  };

  const handleOpenBulkIDCards = () => {
    setStudentForIDCard(undefined);
    setShowIDCardModal(true);
  };

  // Separate Independent Enterprise Partner & Support Portal
  if (portalMode === 'enterprise_partner') {
    return (
      <EnterprisePartnerPortal
        onReturnToSchool={() => setPortalMode('school')}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans select-none">
      {/* Top Application Bar */}
      <TopBar
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAddStudent={handleOpenAddStudent}
        onOpenDueReport={() => setActiveView('dues')}
        onLogout={() => setIsLoggedIn(false)}
        onOpenLicenseModal={() => setShowLicenseModal(true)}
        onOpenVendorPortal={() => setPortalMode('enterprise_partner')}
      />

      {/* Main Desktop Viewport with Fixed Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          onOpenErrorModal={() => setShowErrorModal(true)}
          onOpenEnterprisePortal={() => setPortalMode('enterprise_partner')}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-100 relative">
          {activeView === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenAddStudent={handleOpenAddStudent}
              onViewReceipt={handleViewReceipt}
            />
          )}

          {activeView === 'scan' && (
            <ScanStudentView
              onStudentFound={handleStudentFoundFromScan}
              onOpenAddStudent={handleOpenAddStudent}
              onOpenSearch={() => setActiveView('students')}
            />
          )}

          {activeView === 'collect' && (
            <FeeCollectionFastView
              initialStudentId={selectedStudentId}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={() => setActiveView('dashboard')}
              onSelectAnotherStudent={() => setActiveView('scan')}
            />
          )}

          {activeView === 'profile' && (
            <StudentFeeProfileView
              studentId={selectedStudentId}
              onBack={() => setActiveView('students')}
              onCollectFee={(id) => {
                setSelectedStudentId(id);
                setActiveView('collect');
              }}
              onViewLedger={(id) => {
                setSelectedStudentId(id);
                setActiveView('ledger');
              }}
              onEditStudent={handleEditStudent}
              onViewReceipt={handleViewReceipt}
            />
          )}

          {activeView === 'students' && (
            <StudentsListView
              onViewProfile={(id) => {
                setSelectedStudentId(id);
                setActiveView('profile');
              }}
              onCollectFee={(id) => {
                setSelectedStudentId(id);
                setActiveView('collect');
              }}
              onViewLedger={(id) => {
                setSelectedStudentId(id);
                setActiveView('ledger');
              }}
              onEditStudent={handleEditStudent}
              onPrintIDCard={handlePrintIDCard}
              onOpenAddStudent={handleOpenAddStudent}
              onOpenBulkIDCards={handleOpenBulkIDCards}
            />
          )}

          {activeView === 'dues' && (
            <DueManagementView
              onViewProfile={(id) => {
                setSelectedStudentId(id);
                setActiveView('profile');
              }}
              onCollectFee={(id) => {
                setSelectedStudentId(id);
                setActiveView('collect');
              }}
            />
          )}

          {activeView === 'teachers' && <TeacherCornerView />}

          {activeView === 'transactions' && (
            <TransactionsListView onViewReceipt={handleViewReceipt} />
          )}

          {activeView === 'ledger' && (
            <StudentLedgerView
              studentId={selectedStudentId}
              onBack={() => setActiveView('profile')}
              onCollectFee={(id) => {
                setSelectedStudentId(id);
                setActiveView('collect');
              }}
            />
          )}

          {activeView === 'structure' && <FeeStructureView />}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'users' && <UserManagementView />}

          {activeView === 'audit' && <AuditLogView />}

          {activeView === 'backup' && <BackupRestoreView />}

          {activeView === 'settings' && (
            <SettingsView
              onOpenVendorPortal={() => setPortalMode('enterprise_partner')}
            />
          )}

          {activeView === 'enterprise' && (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Separate Enterprise Vendor & Technical Support Panel
                    </h2>
                    <p className="text-xs text-slate-500">
                      School software and enterprise license key provisioning are decoupled. The software distributor configures school requirements (capacity, duration, modules) and issues keys from the separate vendor panel.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Independent Vendor Portal (Not Attached to School Menu)</span>
                  </div>
                  <p>
                    School users do not generate their own license keys. Keys are issued by your software provider according to your school requirement. Click below to launch the standalone Enterprise Vendor & Technical Support Panel.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPortalMode('enterprise_partner')}
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Launch Separate Enterprise Vendor Panel →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLicenseModal(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <span>Enter Vendor Key on This Workstation</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Login Screen Modal if user logged out */}
      {!isLoggedIn && (
        <LoginModal
          onSuccess={() => setIsLoggedIn(true)}
          onOpenVendorPortal={() => {
            setIsLoggedIn(true);
            setPortalMode('enterprise_partner');
          }}
        />
      )}

      {/* Official Receipt Print Preview Modal */}
      {showReceiptModal && activeTransaction && (
        <ReceiptPrintModal
          transaction={activeTransaction}
          onClose={() => setShowReceiptModal(false)}
          onScanNext={() => {
            setShowReceiptModal(false);
            setActiveView('scan');
          }}
        />
      )}

      {/* Student ID Card Print Modal */}
      {showIDCardModal && (
        <StudentIDCardModal
          initialStudent={studentForIDCard}
          onClose={() => setShowIDCardModal(false)}
        />
      )}

      {/* Add / Edit Student Registration Modal */}
      {showAddStudentModal && (
        <AddEditStudentModal
          studentToEdit={studentToEdit}
          onClose={() => setShowAddStudentModal(false)}
          onSaved={handleStudentSaved}
        />
      )}

      {/* School License & Key Activation Modal */}
      {showLicenseModal && (
        <SchoolLicenseActivationModal
          onClose={() => setShowLicenseModal(false)}
          onOpenVendorPortal={() => {
            setShowLicenseModal(false);
            setPortalMode('enterprise_partner');
          }}
          onLicenseUpdated={() => {
            // Refreshes license
          }}
        />
      )}

      {/* Error & Edge States Simulator Modal */}
      {showErrorModal && <ErrorDemoModal onClose={() => setShowErrorModal(false)} />}
    </div>
  );
}
