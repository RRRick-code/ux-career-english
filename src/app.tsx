import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { LearningRecordsProvider } from "@/hooks/use-learning-records";
import { HomePage } from "@/pages/home-page";
import { LibraryPage } from "@/pages/library-page";
import { StudyPage } from "@/pages/study-page";

export function App() {
  return (
    <LearningRecordsProvider>
      <HashRouter>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<LibraryPage />} path="/library" />
          <Route element={<StudyPage />} path="/study/:mode" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </HashRouter>
    </LearningRecordsProvider>
  );
}
