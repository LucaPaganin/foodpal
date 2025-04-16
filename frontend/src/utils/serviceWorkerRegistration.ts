// Service worker registration
import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    wb.addEventListener('installed', event => {
      if (event.isUpdate) {
        // New service worker is available, show update notification
        if (window.confirm('New version available! Click OK to refresh.')) {
          window.location.reload();
        }
      }
    });

    wb.addEventListener('controlling', () => {
      window.location.reload();
    });

    // Register the service worker
    wb.register()
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
}
