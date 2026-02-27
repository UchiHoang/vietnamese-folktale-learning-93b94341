import { useLocation } from "react-router-dom";
import { useStudyTimeLimit } from "@/hooks/useStudyTimeLimit";
import StudyBreakReminder from "./StudyBreakReminder";
import { useState, useEffect } from "react";

const GAME_PATHS = [
  "/classroom/",
  "/lessons",
];

const StudyTimeLimitWrapper = () => {
  const location = useLocation();
  const { isLimitReached, extraTimeUsed, grantExtraTime, todayTimeSpent, loading } = useStudyTimeLimit();
  const [dismissed, setDismissed] = useState(false);

  const isGamePage = GAME_PATHS.some((p) => location.pathname.startsWith(p));

  // Reset dismissed when navigating to a new game page
  useEffect(() => {
    if (isGamePage && isLimitReached) {
      setDismissed(false);
    }
  }, [location.pathname, isLimitReached, isGamePage]);

  if (loading || !isGamePage) return null;

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
