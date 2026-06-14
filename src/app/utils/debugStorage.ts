/**
 * Debugging utilities for localStorage
 * This helps diagnose issues with progress saving
 */

export function listAllProgressKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('assessment_progress')) {
      keys.push({
        key,
        size: localStorage.getItem(key)?.length || 0,
        preview: localStorage.getItem(key)?.substring(0, 100)
      });
    }
  }
  console.table(keys);
  return keys;
}

export function clearAllProgress() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('assessment_progress')) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
  console.log('Cleared progress keys:', keys);
  return keys;
}

export function getStorageInfo() {
  const info = {
    totalKeys: localStorage.length,
    allKeys: [] as string[],
    progressKeys: [] as string[],
    totalSize: 0
  };
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      info.allKeys.push(key);
      const value = localStorage.getItem(key);
      if (value) {
        info.totalSize += value.length;
      }
      if (key.includes('assessment_progress')) {
        info.progressKeys.push(key);
      }
    }
  }
  
  console.log('Storage Info:', info);
  return info;
}

// Make these available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugStorage = {
    listAllProgressKeys,
    clearAllProgress,
    getStorageInfo
  };
}
