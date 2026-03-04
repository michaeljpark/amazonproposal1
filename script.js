document.addEventListener('DOMContentLoaded', () => {

    /* =============================================
       CONFIGURATION
       ============================================= */
    const TOTAL_SLIDES = 72;

    /**
     * Sections defined by 1-based page numbers.
     * Categories provided:
     *   3-8   Introduction
     *   9-26  Service Component I
     *   27-44 Service Component II
     *   45-62 Service Component III
     *   63-65 Future of Service
     *   66-69 Possible Solution
     *   70    Conclusion
     *   72    Works Cited
     */
    const sections = [
        { start: 3,  end: 8,  label: "Introduction"           },
        { start: 9,  end: 26, label: "Service Component I"    },
        { start: 27, end: 44, label: "Service Component II"   },
        { start: 45, end: 62, label: "Service Component III"  },
        { start: 63, end: 65, label: "Future of Service"      },
        { start: 66, end: 69, label: "Possible Solution"      },
        { start: 70, end: 70, label: "Conclusion"             },
        { start: 72, end: 72, label: "Works Cited"            },
    ];

    /**
     * Pages where the pill is explicitly suppressed even if nav is visible.
     * (Navigation stays visible but the highlight pill is hidden.)
     */
    const PILL_SUPPRESSED_PAGES = [71];

    /* =============================================
       DOM REFERENCES
       ============================================= */
    const container   = document.getElementById('slideshow-container');
    const navEl       = document.getElementById('top-nav');
    const navLinkEls  = document.querySelectorAll('#nav-links li');
    const pillBg      = document.getElementById('nav-pill-bg');

    /* =============================================
       BUILD SLIDES
       ============================================= */
    for (let page = 1; page <= TOTAL_SLIDES; page++) {
        const slide = document.createElement('div');
        slide.classList.add('slide');
        slide.dataset.page = page;

        const img = document.createElement('img');
        img.src = `${page}.png`;
        img.alt = `Slide ${page}`;

        // Lazy-load everything after page 4
        if (page > 4) {
            img.loading = 'lazy';
        }

        img.onload = () => img.classList.add('loaded');

        // If the image fails (placeholder missing), show a dark empty slide
        img.onerror = () => {
            img.style.display = 'none';
        };

        const pageNum = document.createElement('div');
        pageNum.classList.add('page-number');
        pageNum.textContent = `${page} / ${TOTAL_SLIDES}`;

        slide.appendChild(img);
        slide.appendChild(pageNum);
        container.appendChild(slide);
    }

    /* =============================================
       NAV: PILL POSITIONING
       ============================================= */
    const navSectionMap = {};
    sections.forEach((sec, idx) => {
        navSectionMap[sec.label] = idx;
    });

    const movePillToLabel = (label) => {
        const idx = navSectionMap[label];
        if (idx === undefined) return;

        const targetLi  = navLinkEls[idx];
        const navRect   = navEl.getBoundingClientRect();
        const liRect    = targetLi.getBoundingClientRect();
        const isMobile  = window.innerWidth <= 768;

        if (isMobile) {
            pillBg.style.width  = `${liRect.width}px`;
            pillBg.style.height = `${liRect.height}px`;
            pillBg.style.top    = `${liRect.top - navRect.top}px`;
            pillBg.style.left   = `${liRect.left - navRect.left}px`;
        } else {
            pillBg.style.width  = `${liRect.width}px`;
            pillBg.style.height = '100%';
            pillBg.style.top    = '0';
            pillBg.style.left   = `${liRect.left - navRect.left}px`;
        }

        pillBg.classList.add('active');
        pillBg.classList.remove('suppressed');
    };

    const hidePill = () => {
        pillBg.classList.remove('active');
        pillBg.classList.add('suppressed');
    };

    /* =============================================
       INTERSECTION OBSERVER — update nav state
       ============================================= */
    let currentPage = 1;

    const allSlides = document.querySelectorAll('.slide');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const page = parseInt(entry.target.dataset.page, 10);
            currentPage = page;

            // Nav is ALWAYS visible
            navEl.classList.add('visible');

            // Pill behaviour
            if (PILL_SUPPRESSED_PAGES.includes(page)) {
                hidePill();
            } else {
                const sec = sections.find(s => page >= s.start && page <= s.end);
                if (sec) {
                    movePillToLabel(sec.label);
                } else {
                    // Pages 1-2 (and any uncategorised page): no pill
                    hidePill();
                }
            }
        });
    }, {
        root: container,
        threshold: 0.5
    });

    allSlides.forEach(slide => observer.observe(slide));

    /* =============================================
       NAV CLICK → SCROLL TO SECTION START
       ============================================= */
    navLinkEls.forEach((li, idx) => {
        li.addEventListener('click', () => {
            const targetPage  = sections[idx].start;
            const targetSlide = allSlides[targetPage - 1];
            if (targetSlide) {
                targetSlide.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* =============================================
       KEYBOARD NAVIGATION (← → ↑ ↓ Space)
       ============================================= */
    const scrollToPage = (page) => {
        const clampedPage = Math.max(1, Math.min(TOTAL_SLIDES, page));
        const targetSlide = allSlides[clampedPage - 1];
        if (targetSlide) {
            targetSlide.scrollIntoView({ behavior: 'smooth' });
        }
    };

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                scrollToPage(currentPage + 1);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                scrollToPage(currentPage - 1);
                break;
            case 'Home':
                e.preventDefault();
                scrollToPage(1);
                break;
            case 'End':
                e.preventDefault();
                scrollToPage(TOTAL_SLIDES);
                break;
        }
    });

    /* =============================================
       INITIAL STATE
       ============================================= */
    navEl.classList.add('visible');

});
