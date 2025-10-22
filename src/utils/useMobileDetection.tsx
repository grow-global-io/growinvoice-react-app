import { useState, useEffect } from "react";


/**
 * Custom React hook to detect if the current screen is a mobile screen
 * @param breakpoint - The pixel width to consider as mobile breakpoint (default: 768px)
 * @returns True if screen width is below the breakpoint (mobile), false otherwise
 */
const useMobileDetection = (breakpoint: number = 768): boolean => {
	// Initialize state with current window width check
	const [isMobile, setIsMobile] = useState<boolean>(() => {
		// Check if window is available (client-side)
		if (typeof window !== "undefined") {
			return window.innerWidth < breakpoint;
		}
		// Default to false for server-side rendering
		return false;
	});

	useEffect(() => {
		// Create media query
		const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

		// Handler function to update state
		const handleMediaQueryChange = (event: MediaQueryListEvent): void => {
			setIsMobile(event.matches);
		};

		// Set initial value
		setIsMobile(mediaQuery.matches);

		// Add event listener
		mediaQuery.addEventListener("change", handleMediaQueryChange);

		// Cleanup function
		return () => {
			mediaQuery.removeEventListener("change", handleMediaQueryChange);
		};
	}, [breakpoint]);

	return isMobile;
};

export default useMobileDetection;

// Alternative implementation using resize event listener
// export const useMobileDetectionResize = (breakpoint: number = 768): boolean => {
//   const [isMobile, setIsMobile] = useState<boolean>(() => {
//     if (typeof window !== 'undefined') {
//       return window.innerWidth < breakpoint;
//     }
//     return false;
//   });

//   useEffect(() => {
//     const handleResize = (): void => {
//       setIsMobile(window.innerWidth < breakpoint);
//     };

//     // Set initial value
//     handleResize();

//     // Add event listener
//     window.addEventListener('resize', handleResize);

//     // Cleanup
//     return () => window.removeEventListener('resize', handleResize);
//   }, [breakpoint]);

//   return isMobile;
// };

// Usage examples:
/*
// Basic usage with default 768px breakpoint
const MyComponent = () => {
  const isMobile = useMobileDetection();
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
};

// Custom breakpoint (e.g., 480px for smaller mobile screens)
const AnotherComponent = () => {
  const isSmallMobile = useMobileDetection(480);
  
  return (
    <div className={isSmallMobile ? 'mobile-layout' : 'desktop-layout'}>
      Content here
    </div>
  );
};

// Using the resize-based alternative
const ComponentWithResize = () => {
  const isMobile = useMobileDetectionResize(640);
  
  return (
    <nav className={`nav ${isMobile ? 'nav-mobile' : 'nav-desktop'}`}>
      Navigation items
    </nav>
  );
};
*/
