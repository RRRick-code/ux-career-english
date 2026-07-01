import { useRef, useState, type ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  DownloadIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  UploadIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allValidItemIds } from "@/lib/content";
import {
  buildLearningRecordsExport,
  isMeaningfulLearningRecord,
  parseLearningRecordsImport,
  type LearningRecordsImportResult,
} from "@/lib/storage";
import { useLearningRecords } from "@/hooks/use-learning-records";
import { useInterviewSettings } from "@/hooks/use-interview-settings";

export function LearningRecordsMenu() {
  const location = useLocation();
  const isInterviewPage = location.pathname.startsWith("/interview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { records, replaceRecords } = useLearningRecords();
  const { defaultBlurStandardAnswer, setDefaultBlurStandardAnswer } =
    useInterviewSettings();
  const [pendingImport, setPendingImport] =
    useState<LearningRecordsImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const hasExportableRecords = Object.values(records).some((record) =>
    isMeaningfulLearningRecord(record),
  );

  const handleExport = () => {
    if (!hasExportableRecords) {
      return;
    }

    const exportData = buildLearningRecordsExport(records);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = exportData.exportedAt.slice(0, 10);

    link.href = url;
    link.download = `ux-english-learning-records-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const importResult = parseLearningRecordsImport(
        raw,
        allValidItemIds,
      );
      setPendingImport(importResult);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Invalid learning records backup file.",
      );
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImport) {
      return;
    }

    replaceRecords(pendingImport.records);
    setPendingImport(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Learning records"
            className="bg-transparent hover:bg-slate-300/20 aria-expanded:bg-slate-300/20"
            size="icon"
            variant="ghost"
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer"
              disabled={!hasExportableRecords}
              onSelect={handleExport}
            >
              <DownloadIcon />
              Export Records
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer"
              onSelect={handleImportClick}
            >
              <UploadIcon />
              Import Records
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {isInterviewPage ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  checked={defaultBlurStandardAnswer}
                  className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer"
                  onCheckedChange={setDefaultBlurStandardAnswer}
                >
                  <EyeOffIcon />
                  Blur by Default
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />

      <AlertDialog
        open={Boolean(pendingImport)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingImport(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Import learning records?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the learning progress and starred items in this
              browser. {pendingImport?.importedCount ?? 0} records will be
              imported
              {pendingImport?.ignoredCount
                ? `, and ${pendingImport.ignoredCount} records not found in the current library will be ignored`
                : ""}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(importError)}
        onOpenChange={(open) => {
          if (!open) {
            setImportError(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Import failed</AlertDialogTitle>
            <AlertDialogDescription>
              {importError ?? "Invalid learning records backup file."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setImportError(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
