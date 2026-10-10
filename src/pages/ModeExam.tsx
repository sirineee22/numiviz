import React, { useState, useEffect } from "react";
import { FileText, Download, Trash2, Search, Filter } from "lucide-react";
import api from '@/lib/axios';

type Document = {
  id: number;
  filename: string;
  file_path: string;
  document_type: 'exam' | 'tp';
  upload_date: string;
  id_enseignant: number | null;
};

interface ModeExamProps {
  isProfessor: boolean;
}

const ModeExam: React.FC<ModeExamProps> = ({ isProfessor }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'all' | 'exam' | 'tp'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedDocumentType !== 'all') {
          params.append('document_type', selectedDocumentType);
        }
        const response = await api.get(`/documents?${params.toString()}`);
        setDocuments(response.data);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [selectedDocumentType]);

  const handleDeleteDocument = async (documentId: number, filename: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le document "${filename}" ?`)) {
      try {
        await api.delete(`/documents/${documentId}`);
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  return (
    <div className="w-full mt-8">
      <div className="glass-card rounded-2xl p-8 border border-border/50 relative overflow-hidden">
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <FileText size={160} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Reference Library</h2>
            <p className="text-muted-foreground mt-1">Browse, download, and manage exam papers and assignments.</p>
          </div>
          
          <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
            <button 
              onClick={() => setSelectedDocumentType('all')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                ${selectedDocumentType === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              All Files
            </button>
            <button 
              onClick={() => setSelectedDocumentType('exam')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                ${selectedDocumentType === 'exam' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              Exams
            </button>
            <button 
              onClick={() => setSelectedDocumentType('tp')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                ${selectedDocumentType === 'tp' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              Assignments
            </button>
          </div>
        </div>
          
        <div className="relative z-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl bg-background/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-lg font-medium text-foreground">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl bg-background/50 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">No documents found</p>
              <p className="text-sm text-muted-foreground max-w-md">There are no documents matching this category. Switch filters or upload new files.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="group relative flex flex-col p-5 border border-border/50 rounded-xl bg-background/50 hover:bg-background shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    {isProfessor && (
                      <button 
                        onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-2" title={doc.filename}>
                      {doc.filename}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider
                        ${doc.document_type === 'exam' ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/10 text-blue-600'}`}>
                        {doc.document_type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border/50">
                    <a 
                      href={doc.file_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors duration-200 text-sm gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeExam;