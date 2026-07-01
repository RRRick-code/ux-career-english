import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { LearningRecordsProvider } from "@/hooks/use-learning-records";
import { InterviewSettingsProvider } from "@/hooks/use-interview-settings";
import { HomePage } from "@/pages/home-page";
import { InterviewPage } from "@/pages/interview-page";
import { LibraryPage } from "@/pages/library-page";
import { StudyPage } from "@/pages/study-page";

export function App() {
  return (
    <LearningRecordsProvider>
      <InterviewSettingsProvider>
        <HashRouter>
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<InterviewPage />} path="/interview" />
            <Route element={<LibraryPage />} path="/library" />
            <Route element={<StudyPage />} path="/study/:scopeOrMode/:pool/:mode" />
            <Route element={<StudyPage />} path="/study/:scopeOrMode/:mode?" />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </HashRouter>
      </InterviewSettingsProvider>
    </LearningRecordsProvider>
  );
}
