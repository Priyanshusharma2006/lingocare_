import { useState } from 'react';
import { CurriculumProvider } from './context/CurriculumContext';
import { Sidebar } from './components/Sidebar';
import { CurriculumHeader } from './components/CurriculumHeader';
import { CurriculumView } from './components/CurriculumView';
import { PdfUploadModal } from './components/PdfUploadModal';

function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 selection:bg-[#EC8601]/20 selection:text-[#EC8601] flex">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Focus Panel / Scrollable Canvas */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Curriculum Level 1 Root Header */}
          <CurriculumHeader
            onOpenUpload={() => setIsUploadOpen(true)}
          />

          {/* Main Curriculum Hierarchy View (Modules -> Topics -> Lessons) */}
          <main className="w-full">
            <CurriculumView onOpenUpload={() => setIsUploadOpen(true)} />
          </main>
        </div>
      </div>

      {/* Upload PDF Modal */}
      <PdfUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CurriculumProvider>
      <MainApp />
    </CurriculumProvider>
  );
}
