import { useLocation } from "react-router-dom";
import { useStudyTimeLimit } from "@/hooks/useStudyTimeLimit";
import { useOnlineTimeTracker } from "@/hooks/useOnlineTimeTracker";
import StudyBreakReminder from "./StudyBreakReminder";
import { useState, useEffect } from "react";

const GAME_PATHS = [
  "/classroom/",
  "/lessons",
];

const StudyTimeLimitWrapper = () => {
  const location = useLocation();
  const isGamePage = GAME_PATHS.some((p) => location.pathname.startsWith(p));
  
  // Track online time on ALL pages (not just game pages) to protect eyes
  useOnlineTimeTracker(true);
  
  const { isLimitReached, extraTimeUsed, grantExtraTime, todayTimeSpent, loading } = useStudyTimeLimit();
  const [dismissed, setDismissed] = useState(false);


  // Reset dismissed when navigating to a new game page
  useEffect(() => {
    if (isGamePage && isLimitReached) {
      setDismissed(false);
    }
  }, [location.pathname, isLimitReached, isGamePage]);

  if (loading) return null;

  // On non-game pages: show soft banner when limit reached
  if (!isGamePage && isLimitReached && !dismissed) {
    return (
      <StudyBreakReminder
        isVisible={true}
        extraTimeUsed={extraTimeUsed}
        onDismiss={() => setDismissed(true)}
        onGrantExtraTime={async () => {
          await grantExtraTime();
          setDismissed(true);
        }}
        todayTimeSpent={todayTimeSpent}
        softMode={true}
      />
    );
  }

  if (!isGamePage) return null;

  // On game/lesson pages: show full-screen overlay
  return (
    <StudyBreakReminder
      isVisible={isLimitReached && !dismissed}
      extraTimeUsed={extraTimeUsed}
      onDismiss={() => setDismissed(true)}
      onGrantExtraTime={async () => {
        await grantExtraTime();
        setDismissed(true);
      }}
      todayTimeSpent={todayTimeSpent}
    />
  );
};

export default StudyTimeLimitWrapper;
