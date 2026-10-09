import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Consolidated 10 Modules
import { CommercialDesk } from './components/stages/CommercialDesk';
import { PrepressArtwork } from './components/stages/PrepressArtwork';
import { ProductionPlanning } from './components/stages/ProductionPlanning';
import { PrintingTerminal } from './components/stages/PrintingTerminal';
import { FinishingModule } from './components/stages/FinishingModule';
import { QualityControlModule } from './components/stages/QualityControlModule';
import { InventoryManagement } from './components/stages/InventoryManagement';
import { DispatchLogisticsModule } from './components/stages/DispatchLogisticsModule';
import { AccountsBilling } from './components/stages/AccountsBilling';
import { AdminAnalyticsModule } from './components/stages/AdminAnalyticsModule';

// Supporting Views
import { DesignProofing } from './components/stages/DesignProofing';
import { OrderClosureFeedback } from './components/stages/OrderClosureFeedback';
import { ReportsAnalytics } from './components/stages/ReportsAnalytics';
import { SystemAdmin } from './components/stages/SystemAdmin';

// Cross-Cutting
import { CustomerDirectory } from './components/crosscutting/CustomerDirectory';
import { CommunicationHub } from './components/crosscutting/CommunicationHub';
import { TaskFollowUp } from './components/crosscutting/TaskFollowUp';

// Modals
import { DynamicQrModal } from './components/common/DynamicQrModal';
import { JobTicketModal } from './components/common/JobTicketModal';
import { InvoiceModal } from './components/common/InvoiceModal';
import { QuoteModal } from './components/common/QuoteModal';
import { ControlGatesModal } from './components/common/ControlGatesModal';
import { EnquiryFormModal } from './components/common/EnquiryFormModal';
import { QCFlagModal } from './components/common/QCFlagModal';

import './App.css';

const MainContent = () => {
  const { activeTab, isMasterEnquiryModalOpen, setIsMasterEnquiryModalOpen, addEnquiry } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      // The 10 Consolidated ERP Modules
      case 'commercial': return <CommercialDesk />;
      case 'prepress': return <PrepressArtwork />;
      case 'planning': return <ProductionPlanning />;
      case 'press_terminal': return <PrintingTerminal />;
      case 'finishing': return <FinishingModule />;
      case 'qc':
      case 'qc_packing':
      case 'qc_inspection': return <QualityControlModule />;
      case 'inventory': return <InventoryManagement />;
      case 'dispatch': return <DispatchLogisticsModule />;
      case 'billing': return <AccountsBilling />;
      case 'admin_analytics': return <AdminAnalyticsModule />;

      // Legacy Aliases Route to Respective Consolidated Modules
      case 'booking':
      case 'enquiry':
      case 'costing':
      case 'estimator':
        return <CommercialDesk />;
      case 'production':
        return <ProductionPlanning />;
      case 'associates':
      case 'finishing_qc':
        return <FinishingModule />;
      case 'procurement':
        return <InventoryManagement />;
      case 'rejections':
        return <DispatchLogisticsModule />;
      case 'notifications':
      case 'owner_dashboard':
      case 'dashboard':
      case 'config':
        return <AdminAnalyticsModule />;

      // Legacy and cross-cutting views
      case 'design': return <DesignProofing />;
      case 'feedback': return <OrderClosureFeedback />;
      case 'reports': return <ReportsAnalytics />;
      case 'admin': return <SystemAdmin />;
      case 'customers': return <CustomerDirectory />;
      case 'communication': return <CommunicationHub />;
      case 'tasks': return <TaskFollowUp />;
      default: return <CommercialDesk />;
    }
  };

  return (
    <div className="app-layout-root">
      <Navbar />
      <div className="app-body-container">
        <Sidebar />
        <main className="app-main-viewport">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive & Printable Modals */}
      <DynamicQrModal />
      <JobTicketModal />
      <InvoiceModal />
      <QuoteModal />
      <ControlGatesModal />
      <QCFlagModal />
      <EnquiryFormModal
        isOpen={isMasterEnquiryModalOpen}
        onClose={() => setIsMasterEnquiryModalOpen(false)}
        enquiryData={null}
        onSaveEnquiry={(savedData) => {
          addEnquiry(savedData);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
