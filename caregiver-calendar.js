// ═══════════════════════════════════════════════════════════════════════════════
// CAREGIVER CALENDAR ENHANCEMENT
// Features:
// 1. Display time slots as ranges (e.g., "8–10pm" instead of "8pm")
// 2. Enforce minimum 2-hour visit duration
// 3. Fix availability page text cutoff
// 4. Add search bar for caregiver booking
// ═══════════════════════════════════════════════════════════════════════════════

const MIN_VISIT_DURATION = 2; // hours

// ─────────────────────────────────────────────────────────────────────────────────
// 1. CALENDAR TIME RANGE FORMATTER
// ─────────────────────────────────────────────────────────────────────────────────
function formatTimeRange(startHour, endHour = null) {
  if (!endHour) {
    endHour = startHour + MIN_VISIT_DURATION;
  }
  
  const startPeriod = startHour >= 12 ? 'pm' : 'am';
  const endPeriod = endHour >= 12 ? 'pm' : 'am';
  
  const startHour12 = startHour > 12 ? startHour - 12 : startHour || 12;
  const endHour12 = endHour > 12 ? endHour - 12 : endHour || 12;
  
  // If both periods are same, show as "8–10pm"
  if (startPeriod === endPeriod) {
    return `${startHour12}–${endHour12}${endPeriod}`;
  }
  
  // If different periods, show as "10am–2pm"
  return `${startHour12}${startPeriod}–${endHour12}${endPeriod}`;
}

// ─────────────────────────────────────────────────────────────────────────────────
// 2. DISPLAY CALENDAR SLOTS WITH TIME RANGES
// ─────────────────────────────────────────────────────────────────────────────────
function displayDaySlots(dayElement, slots) {
  const slotsContainer = dayElement.querySelector('.day-slots');
  
  if (!slotsContainer) return;
  
  slotsContainer.innerHTML = '';
  
  slots.forEach(slot => {
    const slotEl = document.createElement('div');
    slotEl.className = 'slot';
    slotEl.dataset.startTime = slot.start;
    slotEl.dataset.endTime = slot.end;
    
    const timeRange = formatTimeRange(slot.start, slot.end);
    slotEl.innerHTML = `
      <div class="slot-time">${timeRange}</div>
      <div class="slot-caregiver">${slot.caregiverName}</div>
      <div class="slot-status ${slot.available ? 'available' : 'booked'}">
        ${slot.available ? 'Available' : 'Booked'}
      </div>
    `;
    
    slotEl.addEventListener('click', () => selectTimeSlot(slot));
    slotsContainer.appendChild(slotEl);
  });
}

// ─────────────────────────────────────────────────────────────────────────────────
// 3. VALIDATE MINIMUM 2-HOUR VISIT DURATION
// ─────────────────────────────────────────────────────────────────────────────────
function validateVisitDuration(startHour, endHour) {
  const duration = endHour - startHour;
  
  if (duration < MIN_VISIT_DURATION) {
    return {
      valid: false,
      error: `Visit must be at least ${MIN_VISIT_DURATION} hours. Selected duration: ${duration} hour(s)`,
      minEndHour: startHour + MIN_VISIT_DURATION
    };
  }
  
  return { valid: true };
}

function createCalendarSlot(startHour, caregiverId, caregiverName) {
  const endHour = startHour + MIN_VISIT_DURATION;
  
  // Validate duration
  const validation = validateVisitDuration(startHour, endHour);
  if (!validation.valid) {
    return { error: validation.error };
  }
  
  return {
    start: startHour,
    end: endHour,
    caregiverId: caregiverId,
    caregiverName: caregiverName,
    available: true,
    created_at: new Date().toISOString()
  };
}

// ─────────────────────────────────────────────────────────────────────────────────
// 4. FIX AVAILABILITY PAGE HEADER TEXT CUTOFF
// ─────────────────────────────────────────────────────────────────────────────────
function fixAvailabilityPageLayout() {
  const availabilityHeader = document.querySelector('.availability-header');
  
  if (availabilityHeader) {
    // Ensure header has proper padding and text wrapping
    availabilityHeader.style.padding = '2rem 3rem';
    availabilityHeader.style.overflow = 'visible';
    availabilityHeader.style.whiteSpace = 'normal';
    availabilityHeader.style.wordWrap = 'break-word';
    availabilityHeader.style.maxWidth = '100%';
    
    // Ensure title is visible
    const title = availabilityHeader.querySelector('h1');
    if (title) {
      title.style.fontSize = 'clamp(1.5rem, 4vw, 2.5rem)';
      title.style.lineHeight = '1.2';
      title.style.marginBottom = '1rem';
    }
    
    // Ensure description is visible
    const description = availabilityHeader.querySelector('p');
    if (description) {
      description.style.fontSize = '1rem';
      description.style.lineHeight = '1.6';
      description.style.marginBottom = '0';
    }
  }
  
  // Fix container overflow issues
  const availabilityContent = document.querySelector('#page-availability');
  if (availabilityContent) {
    availabilityContent.style.overflow = 'visible';
  }
}

// ─────────────────────────────────────────────────────────────────────────────────
// 5. CAREGIVER BOOKING SEARCH
// ─────────────────────────────────────────────────────────────────────────────────
function setupCaregiverSearch() {
  const searchInput = document.querySelector('.caregiver-search-input');
  const caregiverList = document.querySelector('.caregiver-booking-list');
  
  if (!searchInput || !caregiverList) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const caregivers = caregiverList.querySelectorAll('.caregiver-card');
    
    caregivers.forEach(card => {
      const caregiverName = card.querySelector('.caregiver-name')?.textContent.toLowerCase() || '';
      const caregiverSpecialty = card.querySelector('.caregiver-specialty')?.textContent.toLowerCase() || '';
      
      const matches = caregiverName.includes(query) || caregiverSpecialty.includes(query) || query === '';
      
      card.style.display = matches ? 'block' : 'none';
    });
    
    // Show "no results" message if needed
    const visibleCards = Array.from(caregivers).filter(card => card.style.display !== 'none');
    const noResultsMsg = caregiverList.querySelector('.no-results-message');
    
    if (visibleCards.length === 0 && query !== '') {
      if (!noResultsMsg) {
        const msg = document.createElement('div');
        msg.className = 'no-results-message';
        msg.textContent = `No caregivers found matching "${query}"`;
        msg.style.padding = '2rem';
        msg.style.textAlign = 'center';
        msg.style.color = 'var(--ink-light)';
        caregiverList.appendChild(msg);
      }
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────────
// 6. TIME SLOT SELECTION
// ─────────────────────────────────────────────────────────────────────────────────
function selectTimeSlot(slot) {
  // Update UI to show selected slot
  document.querySelectorAll('.slot').forEach(el => el.classList.remove('selected'));
  
  const selectedSlotEl = document.querySelector(`[data-start-time="${slot.start}"]`);
  if (selectedSlotEl) {
    selectedSlotEl.classList.add('selected');
  }
  
  // Update booking summary
  const bookingSummary = document.querySelector('.booking-summary');
  if (bookingSummary) {
    const timeRange = formatTimeRange(slot.start, slot.end);
    bookingSummary.innerHTML = `
      <div class="summary-item">
        <span class="label">Time:</span>
        <span class="value">${timeRange}</span>
      </div>
      <div class="summary-item">
        <span class="label">Duration:</span>
        <span class="value">${slot.end - slot.start} hours</span>
      </div>
      <div class="summary-item">
        <span class="label">Caregiver:</span>
        <span class="value">${slot.caregiverName}</span>
      </div>
    `;
  }
  
  return slot;
}

// ─────────────────────────────────────────────────────────────────────────────────
// 7. INITIALIZE ALL FEATURES
// ─────────────────────────────────────────────────────────────────────────────────
function initCaregiverCalendarFeatures() {
  // Fix availability page layout on load
  fixAvailabilityPageLayout();
  
  // Setup caregiver search
  setupCaregiverSearch();
  
  // Watch for DOM changes to re-apply fixes
  const observer = new MutationObserver(() => {
    fixAvailabilityPageLayout();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('✓ Caregiver calendar features initialized');
  console.log('  - Time ranges display (e.g., "8–10pm")');
  console.log('  - Minimum 2-hour visit enforcement');
  console.log('  - Availability page layout fixed');
  console.log('  - Booking caregiver search enabled');
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaregiverCalendarFeatures);
} else {
  initCaregiverCalendarFeatures();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatTimeRange,
    displayDaySlots,
    validateVisitDuration,
    createCalendarSlot,
    fixAvailabilityPageLayout,
    setupCaregiverSearch,
    selectTimeSlot,
    MIN_VISIT_DURATION
  };
}
