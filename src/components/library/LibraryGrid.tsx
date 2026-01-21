import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import LibraryCard from "./LibraryCard";
import LibraryViewerModal from "./LibraryViewerModal";
import { Loader2, FileX } from "lucide-react";

interface LibraryDocument {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  download_count: number;
  uploaded_by: string;
  created_at: string;
}

interface LibraryGridProps {
  selectedGrade: string;
  searchQuery: string;
  sortBy: string;
  isTeacher: boolean;
  refreshTrigger: number;
  onRefresh: () => void;
}

const LibraryGrid = ({
  selectedGrade,
  searchQuery,
  sortBy,
  isTeacher,
  refreshTrigger,
  onRefresh,
}: LibraryGridProps) => {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<LibraryDocument | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);

      // Parse sort option and set correct column and direction
      let sortColumn = "created_at";
      let ascending = false;
      
      switch (sortBy) {
        case "created_at_desc":
          sortColumn = "created_at";
          ascending = false;
          break;
        case "created_at_asc":
          sortColumn = "created_at";
          ascending = true;
          break;
        case "download_count_desc":
          sortColumn = "download_count";
          ascending = false;
          break;
        case "title_asc":
          sortColumn = "title";
          ascending = true;
          break;
        case "title_desc":
          sortColumn = "title";
          ascending = false;
          break;
        default:
          sortColumn = "created_at";
          ascending = false;
      }

      let query = supabase
        .from("library_documents")
        .select("*")
        .order(sortColumn, { ascending });

      if (selectedGrade !== "all") {
        query = query.eq("grade", selectedGrade);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching documents:", error);
      } else {
        setDocuments(data || []);
      }

      setIsLoading(false);
    };

    fetchDocuments();
  }, [selectedGrade, searchQuery, sortBy, refreshTrigger]);

  const handleDelete = async (docId: string, filePath: string) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("library-documents")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file:", storageError);
      return false;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("library_documents")
      .delete()
      .eq("id", docId);

    if (dbError) {
      console.error("Error deleting document:", dbError);
      return false;
    }

    onRefresh();
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Chưa có tài liệu nào
        </h3>
        <p className="text-muted-foreground">
          {searchQuery
            ? "Không tìm thấy tài liệu phù hợp với từ khóa."
            : "Thư viện này đang trống. Hãy quay lại sau nhé!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <LibraryCard
            key={doc.id}
            document={doc}
            isTeacher={isTeacher}
            onView={() => setSelectedDoc(doc)}
            onDelete={() => handleDelete(doc.id, doc.file_path)}
          />
        ))}
      </div>

      <LibraryViewerModal
        document={selectedDoc}
        open={!!selectedDoc}
        onOpenChange={(open) => !open && setSelectedDoc(null)}
      />
    </>
  );
};

export default LibraryGrid;
