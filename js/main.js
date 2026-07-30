/* ==========================================================================
   Antigravity Main Application Script
   High-Performance Rendering, Dynamic Resolution & Spotlight Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Dynamic Resolution & Viewport DPI Adjuster
  (function initDynamicResolution() {
    function adjustResolution() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      const dpr = window.devicePixelRatio || 1;
      document.documentElement.style.setProperty('--dpr', `${dpr}`);
    }

    window.addEventListener('resize', adjustResolution, { passive: true });
    adjustResolution();
  })();

  // 2. Smooth Navigation Anchor Scrolling with Dynamic Header Offset
  (function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 76;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  })();

  // 3. Full Page Scroll-Driven Parallax & Blur Background Controller (GPU Accelerated)
  (function initScrollBackground() {
    let bgWrapper = document.querySelector('.global-bg-wrapper');
    if (!bgWrapper) {
      bgWrapper = document.createElement('div');
      bgWrapper.className = 'global-bg-wrapper';
      bgWrapper.innerHTML = `<img src="assets/cyber_matrix_flow.gif" alt="Tokyo Night Synth Cyber Background" class="global-bg-image" id="globalBgImg" />`;
      document.body.prepend(bgWrapper);
    }

    const bgImg = document.getElementById('globalBgImg');
    if (!bgImg) return;

    let ticking = false;
    const isTouchMobile = window.innerWidth <= 768 || window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    function onScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      const scrollFraction = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      const scale = 1.0 + scrollFraction * 0.15;
      const translateY = scrollFraction * 100;
      const opacity = 0.24 - scrollFraction * 0.12;

      bgImg.style.transform = `scale(${scale}) translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      bgImg.style.opacity = opacity.toFixed(3);

      if (!isTouchMobile) {
        const blur = scrollFraction * 5;
        bgImg.style.filter = `saturate(1.2) contrast(1.1) blur(${blur.toFixed(1)}px)`;
      }

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    onScroll();
  })();

  // 4. Interactive High-DPI Canvas Particle Mesh with Micro-Optimized Math
  (function initCanvasMesh() {
    if (document.getElementById('bgCanvas')) return;
    if (window.innerWidth <= 768 || window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bgCanvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    let particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 65);
    const mouse = { x: null, y: null, radius: 180, radiusSq: 32400 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 1;
        this.alpha = Math.random() * 0.45 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouse.radiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= Math.cos(angle) * force * 1.5;
            this.y -= Math.sin(angle) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const maxDist = 130;
    const maxDistSq = 16900;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.16 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  })();

  // 5. Zero-Reflow Mouse Spotlight Tracking with Rect Caching & RAF Throttle
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    const spotlightCards = document.querySelectorAll('.metric-card, .philosophy-card, .ironagent-card, .feature-box, .pipeline-step, .project-card, .skill-category-card, .timeline-card');
    
    spotlightCards.forEach(card => {
      let rect = null;
      let rafId = null;

      function updateRect() {
        rect = card.getBoundingClientRect();
      }

      card.addEventListener('mouseenter', updateRect, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (!rect) updateRect();

        if (rafId) return;

        rafId = requestAnimationFrame(() => {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
          rafId = null;
        });
      }, { passive: true });
    });
  }

  // 6. Scroll-Reveal Intersection Observer
  (function initScrollReveal() {
    const revealElements = document.querySelectorAll('section, .metric-card, .philosophy-card, .feature-box, .project-card, .pipeline-step, .timeline-card');
    revealElements.forEach(el => el.classList.add('reveal-on-scroll'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    revealElements.forEach(el => observer.observe(el));
  })();

  // 7. Mobile Navigation Slide-Out Drawer & Backdrop Overlay Controller
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileNavLinks = document.querySelectorAll('#mobileNavLinks a');

  function openMobileDrawer() {
    if (mobileToggle) {
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
    if (mobileOverlay) {
      mobileOverlay.classList.add('active');
      mobileOverlay.setAttribute('aria-hidden', 'false');
    }
    if (mobileDrawer) {
      mobileDrawer.classList.add('active');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileToggle) {
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
    if (mobileOverlay) {
      mobileOverlay.classList.remove('active');
      mobileOverlay.setAttribute('aria-hidden', 'true');
    }
    if (mobileDrawer) {
      mobileDrawer.classList.remove('active');
      mobileDrawer.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer && mobileDrawer.classList.contains('active');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileDrawer);
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // 8. Project Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category');
        if (filter === 'all' || (categories && categories.includes(filter))) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // 9. Active Navbar Highlight Tracking & Scroll Elevation
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
  const navbar = document.getElementById('navbar');
  let navTicking = false;

  function updateNav() {
    const scrollY = window.pageYOffset;

    if (navbar) {
      if (scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    let current = '';
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 110;
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    allNavLinks.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });

    navTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(updateNav);
      navTicking = true;
    }
  }, { passive: true });

  // 10. High-Tech Cyber Cursor Trail & Glow Interaction Engine
  (function initCustomCursor() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover effect over interactive elements
    const updateInteractables = () => {
      const interactables = document.querySelectorAll('a, button, .btn, .card, .project-card, .metric-card, .philosophy-card, .skill-category-card, input');
      interactables.forEach(el => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = "true";
        el.addEventListener('mouseenter', () => {
          ring.classList.add('hovering');
          dot.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
          ring.classList.remove('hovering');
          dot.classList.remove('hovering');
        });
      });
    };

    updateInteractables();

    // Click pulse effect
    window.addEventListener('mousedown', () => {
      ring.classList.add('clicking');
    });
    window.addEventListener('mouseup', () => {
      ring.classList.remove('clicking');
    });
  })();

  // 11. Interactive Word Cursor Pointing & Color Change Engine (All words outside containers)
  (function initWordHoverEffect() {
    if (window.innerWidth <= 768 || window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const candidateSelectors = [
      '.hero-title',
      '.hero-subtitle',
      '.status-pill',
      '.section-tag',
      '.section-title',
      '.section-desc',
      'section > .container > p',
      'section > .container > div > p',
      'footer h2',
      'footer p',
      '.copyright',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'
    ];

    const containerSelector = [
      '.metric-card',
      '.philosophy-card',
      '.ironagent-card',
      '.feature-box',
      '.matrix-container',
      '.bench-container',
      '.project-card',
      '.skill-category-card',
      '.skill-card',
      '.timeline-card',
      '.timeline-item',
      '.arch-overview-card',
      '.pipeline-step',
      '.terminal-drawer',
      '.navbar',
      '.mobile-drawer',
      '.btn',
      'button',
      'input',
      'table',
      'code',
      'pre'
    ].join(', ');

    candidateSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Skip elements inside container cards / boxes
        if (el.closest(containerSelector)) return;
        if (el.dataset.wordWrapped) return;
        el.dataset.wordWrapped = "true";

        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (!text.trim()) return;

            const fragment = document.createDocumentFragment();
            const words = text.split(/(\s+)/);

            words.forEach(word => {
              if (/\s+/.test(word) || !word) {
                fragment.appendChild(document.createTextNode(word));
              } else {
                const span = document.createElement('span');
                span.className = 'word-hover';
                span.textContent = word;
                fragment.appendChild(span);
              }
            });

            node.parentNode.replaceChild(fragment, node);
          } else if (
            node.nodeType === Node.ELEMENT_NODE &&
            !node.classList.contains('word-hover') &&
            node.tagName !== 'SCRIPT' &&
            node.tagName !== 'STYLE' &&
            node.tagName !== 'SVG'
          ) {
            Array.from(node.childNodes).forEach(processNode);
          }
        };

        Array.from(el.childNodes).forEach(processNode);
      });
    });
  })();
});
