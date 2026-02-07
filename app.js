// --- DOM ---
const app = document.getElementById('app');
const dot = document.getElementById('dot');

// --- FSM ---
const FSM = {
  state: 'idle',
  previous: null,

  transition(next) {
    if (this.state === next) return;

    this.previous = this.state;
    this.state = next;

    app.setAttribute('data-state', this.state);
  },

  reset() {
    this.previous = null;
    this.state = 'idle';
    app.setAttribute('data-state', 'idle');
  }
};

// --- Gesture config ---
const GESTURE = {
  TAP_MAX_TIME: 150,
  HOLD_TIME: 450,
  MOVE_TOLERANCE: 8,
  SWIPE_DISTANCE: 40,
  SWIPE_TIME: 300
};

// --- Pointer tracking ---
let startX = 0;
let startY = 0;
let startTime = 0;
let holdTimer = null;
let isHolding = false;

// --- Helpers ---
function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function cancelHold() {
  clearTimeout(holdTimer);
  holdTimer = null;
  isHolding = false;
}

// --- Gesture handlers ---
dot.addEventListener('pointerdown', e => {
  startX = e.clientX;
  startY = e.clientY;
  startTime = Date.now();
  isHolding = false;

  holdTimer = setTimeout(() => {
    isHolding = true;
    FSM.transition('profile');
  }, GESTURE.HOLD_TIME);
});

dot.addEventListener('pointermove', e => {
  if (!holdTimer) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (Math.abs(dx) > GESTURE.MOVE_TOLERANCE || Math.abs(dy) > GESTURE.MOVE_TOLERANCE) {
    cancelHold();
  }
});

dot.addEventListener('pointerup', e => {
  const endTime = Date.now();
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const dt = endTime - startTime;

  cancelHold();

  // --- Swipe ---
  if (dt <= GESTURE.SWIPE_TIME) {
    if (Math.abs(dx) >= GESTURE.SWIPE_DISTANCE && Math.abs(dy) <= 20) {
      if (dx < 0) FSM.transition('search');
      return;
    }

    if (Math.abs(dy) >= GESTURE.SWIPE_DISTANCE && Math.abs(dx) <= 20) {
      if (dy > 0) FSM.transition('dialogs');
      if (dy < 0) FSM.transition('functions');
      return;
    }
  }

  // --- Tap ---
  if (dt <= GESTURE.TAP_MAX_TIME && distance(startX, startY, e.clientX, e.clientY) <= GESTURE.MOVE_TOLERANCE) {
    handleTap();
  }
});

// --- Tap logic ---
function handleTap() {
  switch (FSM.state) {
    case 'chat':
      sendMessage();
      break;

    case 'dialogs':
      FSM.transition('chat');
      break;

    case 'search':
      FSM.transition('chat');
      break;

    case 'functions':
      FSM.transition(FSM.previous || 'idle');
      break;

    default:
      // idle, profile → nothing
      break;
  }
}

// --- Message stub ---
function sendMessage() {
  // deliberately empty
  // message sending logic lives elsewhere
}

// --- Cancel / Back ---
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    FSM.reset();
  }
});

// --- Init ---
FSM.reset();
