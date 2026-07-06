const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

let initialized = false;

function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID) && typeof window !== 'undefined';
}

export function initAnalytics() {
  if (!isAnalyticsEnabled() || initialized) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true
  });

  initialized = true;
}

export function trackPageView(path, title = '') {
  if (!isAnalyticsEnabled() || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title
  });
}

export function trackEvent(eventName, params = {}) {
  if (!isAnalyticsEnabled() || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}
