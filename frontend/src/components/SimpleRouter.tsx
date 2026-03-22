import React, { useState, useEffect } from 'react';

export const Router = ({ routes }: { routes: Record<string, React.ReactNode> }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const Component = routes[currentPath] || routes['/'] || (() => <div>Not Found</div>);
  return <>{Component}</>;
};

export const Link = ({
  href,
  children,
  className,
  style,
}: {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
};
