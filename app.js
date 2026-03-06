/* Custom JavaScript for Hotel Aditya Residency Contact Page */

document.addEventListener("DOMContentLoaded", () => {
    // Welcome Splash Screen Logic
    const splashScreen = document.getElementById('welcome-splash');
    if (splashScreen) {
        // Prevent scrolling while splash is active
        document.body.style.overflow = 'hidden';

        // Check if user has already seen the splash screen in this session
        // (Commented out sessionStorage for now so the user can see it easily when testing)
        // if (!sessionStorage.getItem('hasSeenSplash')) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            // Restore scrolling
            document.body.style.overflow = '';
            // sessionStorage.setItem('hasSeenSplash', 'true');

            // Remove from DOM completely after fade out completes
            setTimeout(() => {
                splashScreen.remove();
            }, 800);
        }, 1500); // 2.5 seconds view time
        // } else {
        //     splashScreen.style.display = 'none';
        //     document.body.style.overflow = '';
        // }
    }

    // Slide to Call Logic
    const slideContainer = document.getElementById("slideContainer");
    const slideThumb = document.getElementById("slideThumb");
    const slideText = document.getElementById("slideText");
    const callLink = document.getElementById("callLink");

    if (slideContainer && slideThumb && callLink) {
        let isDragging = false;
        let startX = 0;
        let originalThumbLeft = 0;
        let maxSlide = 0;
        let triggered = false;

        const initDims = () => {
            const containerRect = slideContainer.getBoundingClientRect();
            const thumbRect = slideThumb.getBoundingClientRect();
            // maxSlide is container width minus thumb width minus padded margins
            maxSlide = containerRect.width - thumbRect.width - 8;
        };

        const handleStart = (e) => {
            if (triggered) return;
            isDragging = true;
            slideThumb.classList.add('sliding');

            // Handle both touch and mouse
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            initDims();
        };

        const handleMove = (e) => {
            if (!isDragging || triggered) return;

            // Prevent scrolling while sliding
            if (e.cancelable) {
                e.preventDefault();
            }

            const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            let diff = currentX - startX;

            // Constrain movement
            if (diff < 0) diff = 0;
            if (diff > maxSlide) diff = maxSlide;

            slideThumb.style.transform = `translateX(${diff}px)`;

            // Fade out text as user slides
            const progress = diff / maxSlide;
            slideText.style.opacity = 0.8 - (progress * 0.8);

            // Check if reached the end (give a small 5% buffer so they don't have to hit the absolute pixel)
            if (diff >= maxSlide * 0.95) {
                triggered = true;
                isDragging = false;
                slideThumb.style.transform = `translateX(${maxSlide}px)`;
                slideThumb.classList.remove('sliding');

                // Change icon temporarily to show success
                slideThumb.innerHTML = '<i class="fa-solid fa-check"></i>';

                // Trigger the call
                window.location.href = callLink.href;

                // Reset after a delay
                setTimeout(() => {
                    triggered = false;
                    slideThumb.style.transform = `translateX(0px)`;
                    slideText.style.opacity = 0.8;
                    slideThumb.innerHTML = '<i class="fa-solid fa-phone"></i>';
                }, 2500);
            }
        };

        const handleEnd = () => {
            if (!isDragging || triggered) return;
            isDragging = false;

            // Spring back if not triggered
            slideThumb.classList.remove('sliding');
            slideThumb.style.transform = `translateX(0px)`;
            slideText.style.opacity = 0.8;
        };

        // Touch events - passive false is needed for preventDefault
        slideThumb.addEventListener('touchstart', handleStart, { passive: false });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);

        // Mouse events (for desktop testing)
        slideThumb.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('mouseleave', handleEnd);

        // Handle window resize dynamically
        window.addEventListener('resize', () => {
            if (!isDragging && !triggered) {
                slideThumb.style.transform = `translateX(0px)`;
            }
        });
    }

    // Image Gallery Auto-Slider
    const galleryContainer = document.querySelector('.gallery-container');
    if (galleryContainer) {
        let autoSlideInterval;

        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                if (!galleryContainer) return;
                const maxScrollLeft = galleryContainer.scrollWidth - galleryContainer.clientWidth;

                // If we reached the end, snap back to the start smoothly
                if (galleryContainer.scrollLeft >= maxScrollLeft - 10) {
                    galleryContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Otherwise scroll right by slightly less than the viewport width
                    galleryContainer.scrollBy({ left: galleryContainer.clientWidth * 0.8, behavior: 'smooth' });
                }
            }, 2000); // Slide every 3.5 seconds
        };

        const stopAutoSlide = () => {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        };

        // Pause auto-sliding when the user interacts
        galleryContainer.addEventListener('touchstart', stopAutoSlide, { passive: true });
        galleryContainer.addEventListener('touchend', startAutoSlide);
        galleryContainer.addEventListener('mouseenter', stopAutoSlide);
        galleryContainer.addEventListener('mouseleave', startAutoSlide);

        // Start the automatic rotation
        startAutoSlide();
    }

    // ================================================
    // LANGUAGE SWITCHER
    // ================================================
    const floatLangWrapper = document.getElementById('floatLangWrapper');
    const floatLangBtn = document.getElementById('floatLangBtn');
    const langMenu = document.getElementById('langMenu');
    const langBadge = document.getElementById('langActiveBadge');

    // Map lang codes to short badge labels
    const langBadges = { en: 'EN', kn: '\u0c95', hi: '\u0939\u093f', mr: '\u092e', te: '\u0c24\u0c46', ur: '\u0627\u064f', ta: '\u0ba4' };

    // Detect current language from googtrans cookie
    function getCurrentLang() {
        const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
        return (match && match[1] !== 'en') ? match[1] : 'en';
    }

    // Update active button highlight and badge
    function setActiveLang(lang) {
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        if (langBadge) langBadge.textContent = langBadges[lang] || 'EN';
    }

    // Set language via Google Translate select element
    function applyLanguage(lang) {
        const sel = document.querySelector('.goog-te-combo');
        if (sel) {
            sel.value = lang === 'en' ? '' : lang;
            sel.dispatchEvent(new Event('change'));
        } else {
            const val = lang === 'en' ? '/en/en' : '/en/' + lang;
            document.cookie = 'googtrans=' + val + '; path=/';
            window.location.reload();
        }
    }

    if (floatLangBtn && langMenu && floatLangWrapper) {

        // Init badge from cookie
        setActiveLang(getCurrentLang());

        // --- SCROLL HIDE/SHOW ---
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                floatLangWrapper.classList.add('hidden');
                // Close the menu too if open
                langMenu.classList.remove('open');
                floatLangBtn.classList.remove('open');
            } else {
                floatLangWrapper.classList.remove('hidden');
            }
        }, { passive: true });

        // --- TOGGLE MENU ---
        floatLangBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = langMenu.classList.contains('open');
            langMenu.classList.toggle('open', !isOpen);
            floatLangBtn.classList.toggle('open', !isOpen);
            floatLangBtn.setAttribute('aria-expanded', String(!isOpen));
        });

        // --- LANGUAGE OPTION CLICK ---
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                setActiveLang(lang);
                langMenu.classList.remove('open');
                floatLangBtn.classList.remove('open');
                floatLangBtn.setAttribute('aria-expanded', 'false');
                applyLanguage(lang);
            });
        });

        // --- CLOSE ON OUTSIDE TAP ---
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#floatLangWrapper')) {
                langMenu.classList.remove('open');
                floatLangBtn.classList.remove('open');
                floatLangBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // --- SYNC BADGE IF GOOGLE TRANSLATE CHANGES EXTERNALLY ---
        // Poll for the GT select element appearing, then watch it
        const syncInterval = setInterval(() => {
            const sel = document.querySelector('.goog-te-combo');
            if (sel) {
                clearInterval(syncInterval);
                sel.addEventListener('change', () => {
                    const lang = sel.value || 'en';
                    setActiveLang(lang);
                });
            }
        }, 500);
    }

    // Visitor Counter Logic (Mock implementation using localStorage)
    const visitorCountElement = document.getElementById('visitorCount');
    if (visitorCountElement) {
        // Base starting realistic number
        const baseCount = 150;

        // Get current count from storage, or initialize if not present
        let currentCount = localStorage.getItem('adityaResidencyVisitors');

        if (!currentCount) {
            currentCount = baseCount;
        } else {
            currentCount = parseInt(currentCount, 10);

            // Only increment 30% of the time on page load to simulate returning visitors vs new visitors
            if (Math.random() > 0.7) {
                currentCount += Math.floor(Math.random() * 3) + 1; // Add 1-3 new visitors
            }
        }

        // Save back to storage
        localStorage.setItem('adityaResidencyVisitors', currentCount);

        // Format with commas and display
        visitorCountElement.textContent = currentCount.toLocaleString('en-IN');
    }

    // ================================================
    // BOOKING SYSTEM
    // ================================================
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {

        // --- Helpers ---
        // Keys MUST match HTML option values exactly
        const R = '\u20B9'; // ₹
        const D = '\u2013'; // –
        const roomPrices = {};
        roomPrices['Deluxe Room ' + D + ' ' + R + '2500/night'] = 2500;
        roomPrices['Suite Room ' + D + ' ' + R + '4000/night'] = 4000;
        roomPrices['Grand Suite Room ' + D + ' ' + R + '6000/night'] = 6000;

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        };

        const nightsBetween = (checkin, checkout) => {
            const a = new Date(checkin + 'T00:00:00');
            const b = new Date(checkout + 'T00:00:00');
            const diff = (b - a) / (1000 * 60 * 60 * 24);
            return diff > 0 ? diff : 0;
        };

        // --- Counter logic ---
        const makeCounter = (upId, downId, valId, hiddenId, min, max) => {
            const up = document.getElementById(upId);
            const down = document.getElementById(downId);
            const valEl = document.getElementById(valId);
            const hiddenEl = document.getElementById(hiddenId);
            if (!up || !down) return;

            const update = (delta) => {
                let current = parseInt(hiddenEl.value, 10);
                current = Math.min(max, Math.max(min, current + delta));
                hiddenEl.value = current;
                valEl.textContent = current;
                updateSummary();
            };
            up.addEventListener('click', () => update(1));
            down.addEventListener('click', () => update(-1));
        };

        makeCounter('adultsUp', 'adultsDown', 'adultsVal', 'adults', 1, 10);
        makeCounter('childrenUp', 'childrenDown', 'childrenVal', 'children', 0, 10);

        // --- Set minimum date to today ---
        const todayStr = new Date().toISOString().split('T')[0];
        const checkInEl = document.getElementById('checkIn');
        const checkOutEl = document.getElementById('checkOut');
        checkInEl.min = todayStr;
        checkOutEl.min = todayStr;

        checkInEl.addEventListener('change', () => {
            // Ensure check-out is after check-in
            if (checkOutEl.value && checkOutEl.value <= checkInEl.value) {
                const nextDay = new Date(checkInEl.value + 'T00:00:00');
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutEl.value = nextDay.toISOString().split('T')[0];
            }
            checkOutEl.min = checkInEl.value;
            updateSummary();
        });
        checkOutEl.addEventListener('change', updateSummary);

        document.getElementById('roomType').addEventListener('change', updateSummary);
        document.getElementById('extraBed').addEventListener('change', updateSummary);

        // --- Summary updater ---
        function updateSummary() {
            const roomVal = document.getElementById('roomType').value;
            const checkIn = checkInEl.value;
            const checkOut = checkOutEl.value;
            const adults = parseInt(document.getElementById('adults').value, 10);
            const children = parseInt(document.getElementById('children').value, 10);
            const extraBed = document.getElementById('extraBed').checked;
            const summaryBox = document.getElementById('bookingSummary');
            const summaryContent = document.getElementById('summaryContent');

            if (!roomVal || !checkIn || !checkOut) {
                summaryBox.style.display = 'none';
                return;
            }

            const nights = nightsBetween(checkIn, checkOut);
            if (nights <= 0) {
                summaryBox.style.display = 'none';
                return;
            }

            const roomPrice = roomPrices[roomVal] || 0;
            const extraBedCost = extraBed ? 1000 : 0;
            const perNightTotal = roomPrice + extraBedCost;
            const totalCost = perNightTotal * nights;

            let guestsLine = `${adults} Adult${adults > 1 ? 's' : ''}`;
            if (children > 0) guestsLine += `, ${children} Child${children > 1 ? 'ren' : ''}`;

            summaryContent.innerHTML = `
                <div class="summary-row">
                    <span class="s-label">Room</span>
                    <span class="s-value">${roomVal.split('–')[0].trim()}</span>
                </div>
                <div class="summary-row">
                    <span class="s-label">Check-In</span>
                    <span class="s-value">${formatDate(checkIn)}</span>
                </div>
                <div class="summary-row">
                    <span class="s-label">Check-Out</span>
                    <span class="s-value">${formatDate(checkOut)}</span>
                </div>
                <div class="summary-row">
                    <span class="s-label">Duration</span>
                    <span class="s-value">${nights} Night${nights > 1 ? 's' : ''}</span>
                </div>
                <div class="summary-row">
                    <span class="s-label">Guests</span>
                    <span class="s-value">${guestsLine}</span>
                </div>
                ${extraBed ? `<div class="summary-row"><span class="s-label">Extra Bed</span><span class="s-value">+${R}1,000/night</span></div>` : ''}
                <div class="summary-divider"></div>
                <div class="summary-row">
                    <span class="s-label">Rate/Night</span>
                    <span class="s-value">${R}${perNightTotal.toLocaleString('en-IN')}</span>
                </div>
                <div class="summary-total">
                    <span class="s-label">Est. Total</span>
                    <span class="s-value">${R}${totalCost.toLocaleString('en-IN')}*</span>
                </div>
            `;
            summaryBox.style.display = 'block';
        }

        // --- Validation ---
        function validateField(el) {
            if (!el.value.trim()) {
                el.classList.add('invalid');
                el.addEventListener('input', () => el.classList.remove('invalid'), { once: true });
                el.addEventListener('change', () => el.classList.remove('invalid'), { once: true });
                return false;
            }
            return true;
        }

        // --- Form submission → WhatsApp ---
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const roomType = document.getElementById('roomType');
            const checkIn = document.getElementById('checkIn');
            const checkOut = document.getElementById('checkOut');
            const guestName = document.getElementById('guestName');
            const guestPhone = document.getElementById('guestPhone');
            const adults = document.getElementById('adults');
            const children = document.getElementById('children');
            const extraBed = document.getElementById('extraBed');
            const specialRequests = document.getElementById('specialRequests');

            // Validate required fields
            let valid = true;
            [roomType, checkIn, checkOut, guestName, guestPhone].forEach(el => {
                if (!validateField(el)) valid = false;
            });

            if (!valid) return;

            const nights = nightsBetween(checkIn.value, checkOut.value);
            if (nights <= 0) {
                checkOut.classList.add('invalid');
                checkOut.addEventListener('change', () => checkOut.classList.remove('invalid'), { once: true });
                return;
            }

            const roomPrice = roomPrices[roomType.value] || 0;
            const extraBedCost = extraBed.checked ? 1000 : 0;
            const total = (roomPrice + extraBedCost) * nights;

            let guestLine = `${parseInt(adults.value)} Adult${parseInt(adults.value) > 1 ? 's' : ''}`;
            if (parseInt(children.value) > 0) guestLine += `, ${parseInt(children.value)} Child${parseInt(children.value) > 1 ? 'ren' : ''}`;

            const rupee = '\u20B9'; // ₹ sign
            const line = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'; // ────────────────────

            const msg = [
                `*BOOKING REQUEST*`,
                `Hotel Aditya Residency`,
                line,
                `*Name:*  ${guestName.value.trim()}`,
                `*Phone:* ${guestPhone.value.trim()}`,
                line,
                `*Room:*      ${roomType.value}`,
                `*Check-In:*  ${formatDate(checkIn.value)}`,
                `*Check-Out:* ${formatDate(checkOut.value)}`,
                `*Duration:*  ${nights} Night${nights > 1 ? 's' : ''}`,
                `*Guests:*    ${guestLine}`,
                extraBed.checked ? `*Extra Bed:* Yes (+${rupee}1,000/night)` : '',
                line,
                `*Est. Total: ${rupee}${total.toLocaleString('en-IN')}*`,
                `_(excl. taxes)_`,
                specialRequests.value.trim() ? `\n*Special Requests:*\n${specialRequests.value.trim()}` : '',
                ``,
                `_Sent via Hotel Aditya Residency Website_`
            ].filter(l => l !== '').join('\n');

            const waUrl = `https://wa.me/917829396954?text=${encodeURIComponent(msg)}`; // TEMP: testing number
            window.open(waUrl, '_blank');
        });
    }

    // ================================================
    // FAQ ACCORDION
    // ================================================
    const faqList = document.getElementById('faqList');
    if (faqList) {
        faqList.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq-item');
                const answer = item.querySelector('.faq-answer');
                const isOpen = item.classList.contains('open');

                // Close all other open items
                faqList.querySelectorAll('.faq-item.open').forEach(openItem => {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-answer').classList.remove('open');
                    openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                });

                // Toggle current
                if (!isOpen) {
                    item.classList.add('open');
                    answer.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    console.log("Hotel Aditya Residency script initialized (v13)!");
});
