import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  root: { 
    height: '100dvh', 
    background: '#f9fafb', 
    display: 'flex', 
    flexDirection: 'column', 
    fontFamily: "sans-serif", 
    overflow: 'hidden' 
  },
  centered: { 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  layout: { 
    flex: 1, 
    display: 'flex', 
    overflow: 'hidden' 
  },
  chatWrapper: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden' 
  },
  inputArea: { 
    padding: '10px 16px 18px', 
    background: '#f9fafb', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: 6 
  },
};