import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  loadDefaultBlurStandardAnswer,
  saveDefaultBlurStandardAnswer,
} from "@/lib/storage";

type InterviewSettingsContextValue = {
  defaultBlurStandardAnswer: boolean;
  setDefaultBlurStandardAnswer: (value: boolean) => void;
};

const InterviewSettingsContext =
  createContext<InterviewSettingsContextValue | null>(null);

export function InterviewSettingsProvider({ children }: PropsWithChildren) {
  const [defaultBlurStandardAnswer, setDefaultBlurStandardAnswerState] =
    useState<boolean>(() => loadDefaultBlurStandardAnswer());

  const value = useMemo<InterviewSettingsContextValue>(
    () => ({
      defaultBlurStandardAnswer,
      setDefaultBlurStandardAnswer: (nextValue) => {
        setDefaultBlurStandardAnswerState(nextValue);
        saveDefaultBlurStandardAnswer(nextValue);
      },
    }),
    [defaultBlurStandardAnswer],
  );

  return (
    <InterviewSettingsContext.Provider value={value}>
      {children}
    </InterviewSettingsContext.Provider>
  );
}

export function useInterviewSettings() {
  const context = useContext(InterviewSettingsContext);
  if (!context) {
    throw new Error(
      "useInterviewSettings must be used within InterviewSettingsProvider",
    );
  }

  return context;
}
