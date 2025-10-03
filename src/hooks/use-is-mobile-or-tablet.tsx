import * as React from "react"

// This breakpoint now includes common tablet sizes (e.g., up to 1024px).
const TABLET_BREAKPOINT = 1024

export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<
    boolean | undefined
  >(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobileOrTablet
}