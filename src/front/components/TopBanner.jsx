import React, { useState, useEffect } from 'react';
import { api } from '../Services/axios';

export const TopBanner = ({ message, linkText, linkHref }) => {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fetch active ad for 'home' placement
    // this is a simple and bassic ad system. to show case the concept. it is very strongly advised to use a crm system for this such as google adsense or similar... #todo
    let mounted = true;
    api.get('/advertisements?placement=home')
      .then(res => {
        const ads = res.data.advertisements || [];
        if (!mounted) return;
  if (ads.length > 0) setAd(ads[0]);
      })
      .catch(() => {})
    return () => { mounted = false }
  }, []);

  useEffect(() => {
    // expose banner height as CSS var on #app-theme for layout adjustments
    const root = document.getElementById('app-theme');
    const el = document.getElementById('top-banner-root');
    const setVar = () => {
      if (!root) return;
      const h = (visible && el) ? el.offsetHeight : 0;
      root.style.setProperty('--topbanner-height', `${h}px`);
    };
    setVar();
    window.addEventListener('resize', setVar);
    return () => {
      window.removeEventListener('resize', setVar);
      // clear the var on unmount
      if (root) root.style.setProperty('--topbanner-height', `0px`);
    };
  }, [visible, ad]);

  const dismiss = () => {
    // Non-persistent dismissal: hides banner only for current render
    setVisible(false);
  }

  // Non-persistent dismissal: do not persist to localStorage so banner reappears on next render/refresh
  if (!visible) return null;

  // compute image src with a small compatibility shim:
  // - DB may store "/ads/<name>" but server serves uploads at "/api/uploads/<name>"
  // - if image_url starts with "/ads/" map to "/api/uploads/<filename>"
  // - otherwise if it starts with "/" prefix with "/api" (legacy behavior)
  // - otherwise use as-is (external URL)
  const imageSrc = ad && ad.image_url ? (() => {
    try {
      const u = ad.image_url;
      if (u.startsWith('/ads/')) {
        const parts = u.split('/');
        const filename = parts[parts.length - 1];
        return `/api/uploads/${filename}`;
      }
      if (u.startsWith('/')) return `/api${u}`;
      return u;
    } catch (e) {
      return ad.image_url;
    }
  })() : null;

  return (
    <div id="top-banner-root" className="top-banner d-flex justify-content-between align-items-center px-3">
      <div className="top-banner-message d-flex align-items-center">
        {ad ? (
          <>
            {imageSrc ? (
              <a href={ad.target_url || '#'} className="me-2">
                <img src={imageSrc} alt={ad.title} style={{height: '48px', maxHeight: '48px'}} />
              </a>
            ) : null}
            <div>
              <a href={ad.target_url || '#'} className="text-white text-decoration-none fw-semibold">{ad.title}</a>
              {ad.description ? <div className="small">{ad.description}</div> : null}
            </div>
          </>
        ) : (
          <>
            {message || 'Important announcement from Charity Directory'}
            {linkText && linkHref && (
              <a href={linkHref} className="ms-2 text-decoration-underline text-white">{linkText}</a>
            )}
          </>
        )}
      </div>
      <div>
        <button className="btn btn-sm btn-outline-light" onClick={dismiss} aria-label="dismiss banner">Dismiss</button>
      </div>
    </div>
  );
};

export default TopBanner;
