import ModeExam from "./ModeExam";
import ProfessorDocumentUpload from "../components/ProfessorDocumentUpload";
import { useAuth } from "@/contexts/AuthContext";
import { LibraryBig } from "lucide-react";

export default function ModeExamPage() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'enseignant';

  return (
    <div className="min-h-screen w-full bg-transparent text-foreground py-12 px-6">
      <div className="max-w-6xl mx-auto w-full">
        
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <LibraryBig className="h-10 w-10 text-primary" />
            Exam Mode & Resources
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
            Access, download, and manage reference materials and past exam papers for your courses.
          </p>
        </div>

        {isProfessor && (
          <div className="mb-8">
            <ProfessorDocumentUpload />
          </div>
        )}

        <ModeExam isProfessor={isProfessor} />
      </div>
    </div>
  );
}
