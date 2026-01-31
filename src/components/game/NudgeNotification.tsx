import { useEffect, useState } from "react";

interface NudgeNotificationProps {
  from: string;
  color: string;
}

export function NudgeNotification({ from, color }: NudgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger entrance animation
    const timeoutId = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div className={`nudge-banner ${isVisible ? 'visible' : ''}`}>
      <div className="nudge-banner-content">
        <span style={{ color }}>{from}</span> nudged you!
      </div>
    </div>
  );
}
