/* ========================================
   SPITFIRE PENANG — Main Script
   ======================================== */

(function () {
  'use strict';

  /* ---- XSS helper ---- */
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ========================================
     LOADING SCREEN
     ======================================== */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('hidden'), 600);
  });

  /* ========================================
     NAVIGATION — scroll effect
     ======================================== */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 60);
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========================================
     MOBILE NAVIGATION
     ======================================== */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Create overlay element
  const navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  document.body.appendChild(navOverlay);

  function openNav() {
    navLinks.classList.add('open');
    navOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeNav() : openNav();
    });
  }

  navOverlay.addEventListener('click', closeNav);

  // Close on nav link click
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });
  }

  /* ========================================
     MENU TAB FILTERING
     ======================================== */
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuItems = document.querySelectorAll('.menu-item');
  const menuFeaturedItems = document.querySelectorAll('.menu-featured-item');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.category;

      // Update active tab
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Filter items
      menuItems.forEach(item => {
        item.classList.toggle('hidden', item.dataset.category !== cat);
      });

      // Swap featured photo
      menuFeaturedItems.forEach(feat => {
        feat.classList.toggle('hidden', feat.dataset.category !== cat);
      });
    });
  });

  /* ========================================
     GALLERY LIGHTBOX
     ======================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentIndex = 0;
  const galleryImages = [];

  galleryItems.forEach((item, i) => {
    const img = item.querySelector('img');
    if (img) {
      galleryImages.push({
        src: img.src,
        alt: esc(img.alt || ''),
        label: esc(item.dataset.label || '')
      });
    }
    item.addEventListener('click', () => {
      currentIndex = i;
      showLightbox();
    });
  });

  function showLightbox() {
    if (!lightbox || !galleryImages.length) return;
    const data = galleryImages[currentIndex];
    lightboxImg.src = data.src;
    lightboxImg.alt = data.alt;
    lightboxCaption.textContent = data.label;
    lightbox.classList.add('active');
    document.body.classList.add('menu-open'); // reuse overflow hidden
  }

  function hideLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    showLightbox();
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    showLightbox();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', hideLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

  // Close on backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) hideLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  /* ========================================
     LIVE HOURS BADGE
     ======================================== */
  const heroBadge = document.getElementById('heroBadge');

  function updateHoursBadge() {
    if (!heroBadge) return;

    // Penang is UTC+8
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const penang = new Date(utc + 8 * 3600000);

    const hour = penang.getHours();
    const minute = penang.getMinutes();
    const currentMinutes = hour * 60 + minute;

    // Open 11:00 (660) to 23:00 (1380)
    const openMin = 660;
    const closeMin = 1380;
    const isOpen = currentMinutes >= openMin && currentMinutes < closeMin;

    const dot = heroBadge.querySelector('.badge-dot');
    const text = heroBadge.querySelector('.badge-text');

    if (dot) {
      dot.classList.toggle('closed', !isOpen);
    }

    if (text) {
      if (isOpen) {
        const closeHour = 11; // 11 PM
        text.textContent = 'Open today until 11:00 PM';
      } else {
        text.textContent = 'Closed — Opens at 11:00 AM';
      }
    }
  }

  updateHoursBadge();
  setInterval(updateHoursBadge, 60000);

  /* ========================================
     MOBILE CTA BAR
     ======================================== */
  const mobileCta = document.getElementById('mobileCta');

  function updateMobileCta() {
    if (!mobileCta) return;
    mobileCta.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', updateMobileCta, { passive: true });
  updateMobileCta();

  /* ========================================
     SCROLL REVEAL — IntersectionObserver
     ======================================== */
  const revealElements = document.querySelectorAll(
    '.section-label, .section-title, .section-subtitle, ' +
    '.about-image, .about-content, ' +
    '.menu-tabs, .menu-featured, .menu-grid, .menu-note, ' +
    '.award-card, .testimonial-card, ' +
    '.gallery-item, ' +
    '.hours-info, .hours-map, ' +
    '.reservation-cta, .contact-card, ' +
    '.footer-brand, .footer-nav, .footer-hours'
  );

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ========================================
     ACTIVE NAV LINK ON SCROLL
     ======================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinksList.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

})();
