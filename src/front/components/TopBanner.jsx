import React, { useState, useEffect } from 'react';
import { api } from '../Services/axios';

export const TopBanner = ({ message, linkText, linkHref }) => {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem('top_banner_dismissed') !== '1' }
    catch { return true }
  });
  const [ad, setAd] = useState(null);

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
    // expose banner height as CSS var for layout adjustments
    const el = document.getElementById('top-banner-root');
    const setVar = () => {
      if (!el) return;
      const h = visible ? el.offsetHeight : 0;
      document.documentElement.style.setProperty('--topbanner-height', `${h}px`);
    };
    setVar();
    window.addEventListener('resize', setVar);
    return () => window.removeEventListener('resize', setVar);
  }, [visible, ad]);

  const dismiss = () => {
    try { localStorage.setItem('top_banner_dismissed', '1') } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div id="top-banner-root" className="top-banner d-flex justify-content-between align-items-center px-3">
      <div className="top-banner-message d-flex align-items-center">
        {ad ? (
          <>
            {ad.image_url ? (
              <a href={ad.target_url || '#'} className="me-2">
                <img src={ad.image_url} alt={ad.title} style={{height: '48px', maxHeight: '48px'}} />
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
