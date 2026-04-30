import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function PageWrapper({ children, className = "", id }: PageWrapperProps) {
  return (
    <div 
      id={id} 
      className={`animate-fade-up space-y-8 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
