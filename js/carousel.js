/* ========================================
   CAROUSEL 3D - JavaScript
   Système de carrousel circulaire réutilisable
   Optimisé pour performance et interactions
   ======================================== */

/**
 * Initialise un carrousel 3D circulaire
 * @param {string} containerSelector - Sélecteur CSS du container .carousel-container
 * @returns {object} API publique du carrousel
 */
function initCarousel(containerSelector) {
  // ========== SÉLECTION DES ÉLÉMENTS ==========
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Carousel: Container "${containerSelector}" non trouvé`);
    return null;
  }

  const carousel3D = container.querySelector('.carousel-3d');
  const cards = container.querySelectorAll('.carousel-card');
  const prevBtn = container.querySelector('.carousel-control--prev');
  const nextBtn = container.querySelector('.carousel-control--next');
  const indicatorsContainer = container.querySelector('.carousel-indicators');

  if (!carousel3D || cards.length === 0) {
    console.warn(`Carousel: Éléments manquants dans "${containerSelector}"`);
    return null;
  }

  // ========== CONFIGURATION ==========
  const totalCards = cards.length;
  const anglePerCard = 360 / totalCards;

  // État du carrousel
  let currentIndex = 0;
  let currentRotation = 0;
  let radius = 0;

  // État du drag/swipe
  const dragState = {
    isDragging: false,
    startX: 0,
    startRotation: 0,
    currentX: 0,
    hasMoved: false,           // Détecte si réel mouvement
    moveThreshold: 10,         // Pixels minimum pour drag
    velocity: 0,               // Vélocité pour l'inertie
    lastX: 0,
    lastTime: 0
  };

  // ========== CALCUL DU RAYON (RESPONSIVE) ==========
  /**
   * Calcule le rayon optimal selon la taille d'écran et nombre de cartes
   */
  function calculateRadius() {
    const screenWidth = window.innerWidth;
    let cardWidth = 320;
    let minRadius = 350;
    let maxRadius = 600;

    // Adapter selon la taille d'écran
    if (screenWidth <= 480) {
      cardWidth = 240;
      minRadius = 280;
      maxRadius = 400;
    } else if (screenWidth <= 768) {
      cardWidth = 260;
      minRadius = 300;
      maxRadius = 450;
    } else if (screenWidth <= 1024) {
      cardWidth = 280;
      minRadius = 320;
      maxRadius = 500;
    }

    // Formule basée sur la circonférence
    const spacing = screenWidth <= 768 ? 20 : 40;
    const circumference = totalCards * (cardWidth + spacing);
    const calculatedRadius = circumference / (2 * Math.PI);

    return Math.min(Math.max(calculatedRadius, minRadius), maxRadius);
  }

  // ========== POSITIONNEMENT DES CARTES ==========
  /**
   * Positionne chaque carte sur le cercle 3D
   */
  function positionCards() {
    radius = calculateRadius();
    
    cards.forEach((card, index) => {
      const angle = index * anglePerCard;
      card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    });
  }

  // ========== ROTATION DU CARROUSEL ==========
  /**
   * Fait tourner le carrousel vers l'index spécifié
   * @param {number} index - Index de la carte cible
   * @param {boolean} animate - Activer la transition (défaut: true)
   */
  function rotateTo(index, animate = true) {
    const newIndex = ((index % totalCards) + totalCards) % totalCards;
    
    // Calculer la différence d'angle la plus courte
    let diff = newIndex - currentIndex;
    
    // Optimiser le chemin : prendre le plus court
    if (diff > totalCards / 2) {
      diff -= totalCards;
    } else if (diff < -totalCards / 2) {
      diff += totalCards;
    }
    
    // Appliquer la rotation de manière continue
    currentRotation -= diff * anglePerCard;
    currentIndex = newIndex;

    // Activer/désactiver la transition
    carousel3D.style.transition = animate 
      ? 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
      : 'none';

    carousel3D.style.transform = `rotateY(${currentRotation}deg)`;

    updateActiveStates();
    updateIndicators();
  }

  /**
   * Rotation libre (pendant le drag)
   * @param {number} rotation - Angle de rotation en degrés
   */
  function rotateBy(rotation) {
    carousel3D.style.transition = 'none';
    carousel3D.style.transform = `rotateY(${rotation}deg)`;
  }

  function next() {
    // Rotation continue vers la droite (sens négatif)
    currentRotation -= anglePerCard;
    currentIndex = (currentIndex + 1) % totalCards;
    
    carousel3D.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    carousel3D.style.transform = `rotateY(${currentRotation}deg)`;
    
    updateActiveStates();
    updateIndicators();
  }

  function prev() {
    // Rotation continue vers la gauche (sens positif)
    currentRotation += anglePerCard;
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    
    carousel3D.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    carousel3D.style.transform = `rotateY(${currentRotation}deg)`;
    
    updateActiveStates();
    updateIndicators();
  }

  // ========== ÉTATS VISUELS ==========
  function updateActiveStates() {
    cards.forEach((card, index) => {
      card.classList.toggle('is-active', index === currentIndex);
    });
  }

  // ========== INDICATEURS ==========
  function createIndicators() {
    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = '';

    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-indicator');
      dot.setAttribute('aria-label', `Aller au projet ${i + 1}`);
      dot.dataset.index = i;
      dot.addEventListener('click', () => rotateTo(i));
      indicatorsContainer.appendChild(dot);
    }
  }

  function updateIndicators() {
    if (!indicatorsContainer) return;

    const dots = indicatorsContainer.querySelectorAll('.carousel-indicator');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // ========== DRAG SOURIS ==========
  /**
   * Début du drag souris
   */
  function handleMouseDown(e) {
    // Ignorer si clic sur contrôles ou boutons
    if (e.target.closest('.carousel-control') || 
        e.target.closest('.carousel-indicator') ||
        e.target.closest('.carousel-card__btn')) return;

    dragState.isDragging = true;
    dragState.hasMoved = false;
    dragState.startX = e.clientX;
    dragState.currentX = e.clientX;
    dragState.startRotation = currentRotation;
    dragState.lastX = e.clientX;
    dragState.lastTime = Date.now();
    dragState.velocity = 0;

    container.style.cursor = 'grabbing';
    carousel3D.style.transition = 'none';
  }

  /**
   * Mouvement pendant le drag
   */
  function handleMouseMove(e) {
    if (!dragState.isDragging) return;

    const deltaX = e.clientX - dragState.startX;
    
    // Détecter si mouvement significatif
    if (Math.abs(deltaX) > dragState.moveThreshold) {
      dragState.hasMoved = true;
    }

    // Calcul de la vélocité pour l'inertie
    const now = Date.now();
    const dt = now - dragState.lastTime;
    if (dt > 0) {
      dragState.velocity = (e.clientX - dragState.lastX) / dt;
    }
    dragState.lastX = e.clientX;
    dragState.lastTime = now;

    // Conversion pixels -> degrés
    const sensitivity = 0.3;
    const rotation = dragState.startRotation + (deltaX * sensitivity);

    rotateBy(rotation);
    dragState.currentX = e.clientX;
  }

  /**
   * Fin du drag souris
   */
  function handleMouseUp() {
    if (!dragState.isDragging) return;

    dragState.isDragging = false;
    container.style.cursor = 'grab';

    applyInertia();
  }

  // ========== SWIPE TACTILE ==========
  /**
   * Début du touch
   */
  function handleTouchStart(e) {
    if (e.target.closest('.carousel-control') || 
        e.target.closest('.carousel-indicator') ||
        e.target.closest('.carousel-card__btn')) return;

    const touch = e.touches[0];
    dragState.isDragging = true;
    dragState.hasMoved = false;
    dragState.startX = touch.clientX;
    dragState.currentX = touch.clientX;
    dragState.startRotation = currentRotation;
    dragState.lastX = touch.clientX;
    dragState.lastTime = Date.now();
    dragState.velocity = 0;

    carousel3D.style.transition = 'none';
  }

  /**
   * Mouvement tactile
   */
  function handleTouchMove(e) {
    if (!dragState.isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragState.startX;

    if (Math.abs(deltaX) > dragState.moveThreshold) {
      dragState.hasMoved = true;
      // Empêcher le scroll vertical si drag horizontal
      e.preventDefault();
    }

    // Calcul de la vélocité
    const now = Date.now();
    const dt = now - dragState.lastTime;
    if (dt > 0) {
      dragState.velocity = (touch.clientX - dragState.lastX) / dt;
    }
    dragState.lastX = touch.clientX;
    dragState.lastTime = now;

    // Conversion pixels -> degrés
    const sensitivity = 0.3;
    const rotation = dragState.startRotation + (deltaX * sensitivity);

    rotateBy(rotation);
    dragState.currentX = touch.clientX;
  }

  /**
   * Fin du touch
   */
  function handleTouchEnd() {
    if (!dragState.isDragging) return;

    dragState.isDragging = false;
    applyInertia();
  }

  // ========== INERTIE ==========
  /**
   * Applique l'effet d'inertie après le drag
   */
  function applyInertia() {
    // Inertie légère basée sur la vélocité
    const inertiaStrength = 80;
    const velocityRotation = dragState.velocity * inertiaStrength;

    // Rotation actuelle extraite du transform
    const currentTransform = carousel3D.style.transform;
    const match = currentTransform.match(/rotateY\(([-\d.]+)deg\)/);
    const currentAngle = match ? parseFloat(match[1]) : currentRotation;

    // Rotation finale avec inertie
    const finalRotation = currentAngle + velocityRotation;

    // Trouver l'index le plus proche
    const targetIndex = Math.round(-finalRotation / anglePerCard);

    // Animer vers la carte la plus proche
    rotateTo(targetIndex, true);

    // Reset hasMoved après un court délai
    setTimeout(() => {
      dragState.hasMoved = false;
    }, 100);
  }

  // ========== RESIZE (DEBOUNCED) ==========
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      positionCards();
      // Réappliquer la rotation sans animation
      carousel3D.style.transition = 'none';
      carousel3D.style.transform = `rotateY(${currentRotation}deg)`;
    }, 150);
  }

  // ========== ÉVÉNEMENTS ==========
  function bindEvents() {
    // Boutons de navigation
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Navigation clavier
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    });

    // Drag souris
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Swipe tactile
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    // Resize
    window.addEventListener('resize', handleResize);
  }

  // ========== INITIALISATION ==========
  function init() {
    positionCards();
    createIndicators();
    rotateTo(0);
    bindEvents();
    container.setAttribute('tabindex', '0');
    container.style.cursor = 'grab';
  }

  init();

  // ========== API PUBLIQUE ==========
  return {
    next,
    prev,
    goTo: rotateTo,
    getCurrentIndex: () => currentIndex,
    getTotalCards: () => totalCards,
    isDragging: () => dragState.isDragging,
    hasMoved: () => dragState.hasMoved,
    recalculate: positionCards
  };
}

// ========== INITIALISATION GLOBALE ==========
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser les carrousels
  const devCarousel = initCarousel('[data-carousel="dev-web"]');
  const creativeCarousel = initCarousel('[data-carousel="creation-numerique"]');

  // Initialiser les autres modules
  initTiltEffect();
  initCardClickInteraction();
  initModalEvents();

  // Exposer les instances
  window.carousels = {
    devWeb: devCarousel,
    creativeNumerique: creativeCarousel
  };

  // Navigation clavier globale : détecte quel carrousel est le plus visible
  const carouselEntries = [
    { instance: devCarousel, el: document.querySelector('[data-carousel="dev-web"]'), ratio: 0 },
    { instance: creativeCarousel, el: document.querySelector('[data-carousel="creation-numerique"]'), ratio: 0 }
  ].filter(c => c.el);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const found = carouselEntries.find(c => c.el === entry.target);
      if (found) found.ratio = entry.intersectionRatio;
    });
  }, { threshold: Array.from({ length: 11 }, (_, i) => i / 10) });

  carouselEntries.forEach(c => observer.observe(c.el));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    // Ne pas interférer si une modal est ouverte ou un input est actif
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (document.querySelector('.gallery-modal.active')) return;

    // Choisir le carrousel le plus visible
    const active = carouselEntries.reduce((a, b) => a.ratio >= b.ratio ? a : b);
    if (active.ratio === 0) return;

    e.preventDefault();
    if (e.key === 'ArrowLeft') active.instance.prev();
    else active.instance.next();
  });
});

/* ========================================
   TILT EFFECT - JavaScript
   Désactivé sur mobile (< 768px)
   Désactivé pendant le drag
   ======================================== */

function initTiltEffect() {
  const config = {
    maxTilt: 10,
    perspective: 1000,
    speed: 400,
    easing: 'cubic-bezier(0.03, 0.98, 0.52, 0.99)'
  };

  /**
   * Vérifie si le tilt est activé (desktop uniquement)
   */
  function isTiltEnabled() {
    return window.innerWidth > 768;
  }

  /**
   * Récupère l'instance du carrousel parent
   */
  function getCarouselInstance(card) {
    const carousel = card.closest('.carousel-container');
    const carouselData = carousel?.dataset.carousel;
    if (carouselData && window.carousels) {
      return carouselData === 'dev-web' 
        ? window.carousels.devWeb 
        : window.carousels.creativeNumerique;
    }
    return null;
  }

  const cards = document.querySelectorAll('.carousel-card');

  cards.forEach(card => {
    const inner = card.querySelector('.carousel-card__inner');
    if (!inner) return;

    // ========== MOUSE MOVE ==========
    card.addEventListener('mousemove', (e) => {
      // Désactivé sur mobile ou si carte non active
      if (!isTiltEnabled() || !card.classList.contains('is-active')) return;

      // Désactivé pendant le drag
      const carouselInstance = getCarouselInstance(card);
      if (carouselInstance?.isDragging()) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateY = (mouseX / (rect.width / 2)) * config.maxTilt;
      const rotateX = -(mouseY / (rect.height / 2)) * config.maxTilt;

      inner.style.transition = 'transform 0.1s ease-out';
      inner.style.transform = `
        perspective(${config.perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    // ========== MOUSE LEAVE ==========
    card.addEventListener('mouseleave', () => {
      if (!isTiltEnabled()) return;

      inner.style.transition = `transform ${config.speed}ms ${config.easing}`;
      inner.style.transform = `
        perspective(${config.perspective}px)
        rotateX(0deg)
        rotateY(0deg)
      `;
    });
  });
}

/* ========================================
   CARD CLICK INTERACTION - JavaScript
   Sécurisé contre les clics accidentels pendant drag
   ======================================== */

function initCardClickInteraction() {
  const config = {
    clickAnimationDuration: 300,
    delayBeforeAction: 350
  };

  /**
   * Récupère l'instance du carrousel parent
   */
  function getCarouselInstance(card) {
    const carousel = card.closest('.carousel-container');
    const carouselData = carousel?.dataset.carousel;
    if (carouselData && window.carousels) {
      return carouselData === 'dev-web' 
        ? window.carousels.devWeb 
        : window.carousels.creativeNumerique;
    }
    return null;
  }

  const cards = document.querySelectorAll('.carousel-card');

  cards.forEach(card => {
    const inner = card.querySelector('.carousel-card__inner');
    if (!inner) return;

    card.addEventListener('click', (e) => {
      // Ignorer les cartes galerie (gérées par GalleryManager)
      if (card.dataset.type === 'gallery') return;
      
      // Ignorer si clic sur le bouton
      if (e.target.closest('.carousel-card__btn')) return;

      // Ne réagir que si carte active
      if (!card.classList.contains('is-active')) return;

      // ========== SÉCURITÉ DRAG ==========
      // Bloquer le clic si drag a eu lieu
      const carouselInstance = getCarouselInstance(card);
      if (carouselInstance?.hasMoved()) {
        return;
      }

      // Récupérer les données
      const type = card.dataset.type;
      const link = card.dataset.link;
      const images = card.dataset.images;

      // Animation de clic
      inner.classList.add('is-clicking');

      setTimeout(() => {
        inner.classList.remove('is-clicking');
        handleCardAction(type, link, images);
      }, config.delayBeforeAction);
    });
  });
}

/**
 * Gère l'action selon le type de carte
 */
function handleCardAction(type, link, images) {
  switch (type) {
    case 'site':
    case 'video':
      if (link && link !== '#') {
        window.open(link, '_blank');
      }
      break;

    case 'image':
      if (link && link !== '#') {
        openModal('image', link);
      }
      break;

    case 'gallery':
      if (images) {
        const imageArray = images.split(',').map(img => img.trim());
        openModal('gallery', imageArray);
      }
      break;
  }
}

/* ========================================
   MODAL SYSTEM - JavaScript
   ======================================== */

const modalState = {
  isOpen: false,
  type: null,
  images: [],
  currentIndex: 0
};

function openModal(type, content) {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  
  const modalImage = modal.querySelector('.modal__image');
  const modalGallery = modal.querySelector('.modal__gallery');
  const galleryNav = modal.querySelector('.modal__gallery-nav');

  // Reset
  modalImage.classList.remove('is-visible');
  modalGallery.classList.remove('is-visible');
  galleryNav.classList.remove('is-visible');
  modalGallery.innerHTML = '';

  if (type === 'image') {
    modalState.type = 'image';
    modalState.images = [content];
    modalState.currentIndex = 0;

    modalImage.src = content;
    modalImage.classList.add('is-visible');

  } else if (type === 'gallery') {
    modalState.type = 'gallery';
    modalState.images = content;
    modalState.currentIndex = 0;

    content.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Image ${index + 1}`;
      if (index === 0) img.classList.add('is-active');
      modalGallery.appendChild(img);
    });

    modalGallery.classList.add('is-visible');
    galleryNav.classList.add('is-visible');
    updateGalleryCounter();
  }

  modalState.isOpen = true;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  
  modalState.isOpen = false;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

function navigateGallery(direction) {
  if (modalState.type !== 'gallery') return;

  const totalImages = modalState.images.length;
  const galleryImages = document.querySelectorAll('.modal__gallery img');

  galleryImages[modalState.currentIndex].classList.remove('is-active');
  modalState.currentIndex = ((modalState.currentIndex + direction) % totalImages + totalImages) % totalImages;
  galleryImages[modalState.currentIndex].classList.add('is-active');

  updateGalleryCounter();
}

function updateGalleryCounter() {
  const counter = document.querySelector('.modal__gallery-counter');
  if (counter) {
    counter.textContent = `${modalState.currentIndex + 1} / ${modalState.images.length}`;
  }
}

function initModalEvents() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const overlay = modal.querySelector('.modal__overlay');
  const closeBtn = modal.querySelector('.modal__close');
  const prevBtn = modal.querySelector('.modal__nav-btn--prev');
  const nextBtn = modal.querySelector('.modal__nav-btn--next');

  if (overlay) overlay.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateGallery(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateGallery(1));

  document.addEventListener('keydown', (e) => {
    if (!modalState.isOpen) return;

    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft' && modalState.type === 'gallery') navigateGallery(-1);
    else if (e.key === 'ArrowRight' && modalState.type === 'gallery') navigateGallery(1);
  });
}

/* ========================================
   VIDEO MODAL SYSTEM - JavaScript
   Modal plein écran avec fond flou pour les vidéos
   ======================================== */

const videoModalState = {
  isOpen: false,
  currentVideo: null
};

/**
 * Ouvre le modal vidéo avec la source spécifiée
 * @param {string} videoSrc - Chemin vers la vidéo
 */
function openVideoModal(videoSrc) {
  const modal = document.getElementById('video-modal');
  const player = document.getElementById('video-modal-player');
  
  if (!modal || !player) return;

  // Définir la source de la vidéo
  const source = player.querySelector('source');
  if (source) {
    source.src = videoSrc;
  }
  player.load();

  // Ouvrir le modal
  videoModalState.isOpen = true;
  videoModalState.currentVideo = videoSrc;
  modal.classList.add('is-active');
  document.body.style.overflow = 'hidden';

  // Lancer la lecture automatiquement
  player.play().catch(() => {
    // Autoplay bloqué par le navigateur, pas de problème
  });
}

/**
 * Ferme le modal vidéo
 */
function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  const player = document.getElementById('video-modal-player');
  
  if (!modal) return;

  // Arrêter et réinitialiser la vidéo
  if (player) {
    player.pause();
    player.currentTime = 0;
  }

  videoModalState.isOpen = false;
  videoModalState.currentVideo = null;
  modal.classList.remove('is-active');
  document.body.style.overflow = '';
}

/**
 * Initialise les événements du modal vidéo
 */
function initVideoModalEvents() {
  const modal = document.getElementById('video-modal');
  if (!modal) return;

  const overlay = modal.querySelector('.video-modal__overlay');
  const closeBtn = document.getElementById('video-modal-close');

  // Fermer en cliquant sur l'overlay
  if (overlay) {
    overlay.addEventListener('click', closeVideoModal);
  }

  // Fermer avec le bouton X
  if (closeBtn) {
    closeBtn.addEventListener('click', closeVideoModal);
  }

  // Fermer avec Escape (géré dans le système unifié plus bas)
}

/* ========================================
   SYSTÈME VIDÉO INTERACTIF INTELLIGENT
   Gestion automatique des vidéos dans le carousel
   ======================================== */

const VideoCarouselManager = (function() {
  'use strict';

  // ========== ÉTAT GLOBAL ==========
  const state = {
    currentActiveVideo: null,      // Vidéo actuellement active
    sectionVisible: false,         // Section visible dans viewport
    modalOpen: false,              // Modal fullscreen ouvert
    wasPlayingBeforeModal: false,  // Vidéo jouait avant ouverture modal
    observer: null,                // IntersectionObserver
    preloadObserver: null,         // Observer pour préchargement anticipé
    preloadedVideos: new Set(),    // Vidéos déjà préchargées
    loadingVideos: new Set(),      // Vidéos en cours de chargement
    videosInitialized: false       // Vidéos initialisées
  };

  // ========== SÉLECTEURS ==========
  const SELECTORS = {
    section: '#creation-numerique',
    carousel: '[data-carousel="creation-numerique"]',
    videoCard: '.carousel-card--video',
    video: '.carousel-card__video',
    thumbnail: '.carousel-card__thumbnail',
    overlay: '.carousel-card__video-overlay',
    fullscreenBtn: '.carousel-card__fullscreen-btn',
    modal: '#video-modal',
    modalPlayer: '#video-modal-player',
    modalClose: '#video-modal-close',
    modalOverlay: '.video-modal__overlay'
  };

  // ========== PRÉCHARGEMENT LAZY DES VIDÉOS ==========

  /**
   * Initialise le préchargement anticipé (quand on approche de la section)
   */
  function initLazyPreload() {
    const section = document.querySelector(SELECTORS.section);
    if (!section) return;

    // Observer avec une grande marge pour commencer à charger avant d'arriver
    const options = {
      root: null,
      rootMargin: '500px 0px', // Commence à charger 500px avant d'arriver
      threshold: 0
    };

    state.preloadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !state.videosInitialized) {
          state.videosInitialized = true;
          // Charger les vidéos une par une avec un délai
          preloadVideosSequentially();
          state.preloadObserver.disconnect();
        }
      });
    }, options);

    state.preloadObserver.observe(section);
  }

  /**
   * Précharge les vidéos une par une (non bloquant)
   */
  async function preloadVideosSequentially() {
    const videos = document.querySelectorAll(`${SELECTORS.carousel} ${SELECTORS.video}`);
    
    for (const video of videos) {
      await preloadVideo(video);
      // Petit délai entre chaque vidéo pour ne pas bloquer
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Précharge une vidéo spécifique
   */
  function preloadVideo(video) {
    if (!video || state.preloadedVideos.has(video) || state.loadingVideos.has(video)) {
      return Promise.resolve();
    }

    state.loadingVideos.add(video);
    const card = video.closest('.carousel-card');

    return new Promise((resolve) => {
      // Timeout de sécurité (max 10 secondes par vidéo)
      const timeout = setTimeout(() => {
        state.loadingVideos.delete(video);
        resolve();
      }, 10000);

      // Écouter l'événement canplay (assez chargé pour commencer)
      const onCanPlay = () => {
        clearTimeout(timeout);
        state.preloadedVideos.add(video);
        state.loadingVideos.delete(video);
        card?.classList.add('video-ready');
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        resolve();
      };

      // Écouter les erreurs
      const onError = () => {
        clearTimeout(timeout);
        state.loadingVideos.delete(video);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        resolve();
      };

      // Si déjà prête
      if (video.readyState >= 3) {
        clearTimeout(timeout);
        state.preloadedVideos.add(video);
        state.loadingVideos.delete(video);
        card?.classList.add('video-ready');
        resolve();
        return;
      }

      video.addEventListener('canplay', onCanPlay, { once: true });
      video.addEventListener('error', onError, { once: true });

      // Forcer le chargement
      video.load();
    });
  }

  /**
   * Vérifie si une vidéo est prête à être lue
   */
  function isVideoReady(video) {
    return video && (state.preloadedVideos.has(video) || video.readyState >= 2);
  }

  // ========== UTILITAIRES ==========

  /**
   * Récupère la vidéo d'une carte
   */
  function getCardVideo(card) {
    return card?.querySelector(SELECTORS.video);
  }

  /**
   * Récupère la carte active du carousel création numérique
   */
  function getActiveVideoCard() {
    const carousel = document.querySelector(SELECTORS.carousel);
    if (!carousel) return null;
    return carousel.querySelector('.carousel-card--video.is-active');
  }

  /**
   * Vérifie si une vidéo est en lecture
   */
  function isVideoPlaying(video) {
    return video && !video.paused && !video.ended;
  }

  // ========== CONTRÔLE DES VIDÉOS ==========

  /**
   * Vérifie si une vidéo est en lecture
   */
  function isVideoPlaying(video) {
    return video && !video.paused && !video.ended;
  }

  // ========== CONTRÔLE DES VIDÉOS ==========

  /**
   * Met en pause toutes les vidéos du carousel
   */
  function pauseAllVideos() {
    const videos = document.querySelectorAll(`${SELECTORS.carousel} ${SELECTORS.video}`);
    videos.forEach(video => {
      video.pause();
      const card = video.closest('.carousel-card');
      card?.classList.remove('is-playing');
      card?.classList.remove('is-loading');
    });
    state.currentActiveVideo = null;
  }

  /**
   * Lance la lecture d'une vidéo (avec gestion du chargement)
   */
  async function playVideo(video) {
    if (!video) return;

    const card = video.closest('.carousel-card');
    if (!card) return;

    // Pause les autres vidéos d'abord
    pauseAllVideos();

    // Si la vidéo n'est pas prête, afficher le loader et attendre
    if (!isVideoReady(video)) {
      card.classList.add('is-loading');
      await preloadVideo(video);
      card.classList.remove('is-loading');
    }

    // Lance la lecture
    video.play().then(() => {
      card.classList.add('is-playing');
      state.currentActiveVideo = video;
    }).catch(err => {
      // Autoplay bloqué (navigateur)
      console.log('Autoplay bloqué:', err.message);
    });
  }

  /**
   * Met en pause une vidéo
   */
  function pauseVideo(video) {
    if (!video) return;

    const card = video.closest('.carousel-card');
    video.pause();
    card?.classList.remove('is-playing');
    card?.classList.remove('is-loading');
    
    if (state.currentActiveVideo === video) {
      state.currentActiveVideo = null;
    }
  }

  /**
   * Toggle play/pause d'une vidéo
   */
  function toggleVideo(video) {
    if (!video) return;

    if (isVideoPlaying(video)) {
      pauseVideo(video);
    } else {
      playVideo(video);
    }
  }

  // ========== GESTION DU CHANGEMENT DE CARTE ==========

  /**
   * Appelé quand la carte active change
   */
  function onCardChange() {
    // Pause la vidéo précédente
    pauseAllVideos();

    // Si la section est visible, lance la nouvelle vidéo active
    if (state.sectionVisible && !state.modalOpen) {
      const activeCard = getActiveVideoCard();
      if (activeCard) {
        const video = getCardVideo(activeCard);
        if (video) {
          // Petit délai pour laisser l'animation se terminer
          setTimeout(() => {
            playVideo(video);
          }, 300);
        }
      }
    }
  }

  // ========== INTERSECTION OBSERVER ==========

  /**
   * Initialise l'observation de la section
   */
  function initSectionObserver() {
    const section = document.querySelector(SELECTORS.section);
    if (!section) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3 // 30% de la section visible
    };

    state.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        state.sectionVisible = entry.isIntersecting;

        if (entry.isIntersecting) {
          // Section visible - lance la vidéo active si pas de modal
          if (!state.modalOpen) {
            const activeCard = getActiveVideoCard();
            if (activeCard) {
              const video = getCardVideo(activeCard);
              playVideo(video);
            }
          }
        } else {
          // Section hors viewport - pause toutes les vidéos
          pauseAllVideos();
        }
      });
    }, options);

    state.observer.observe(section);
  }

  // ========== MODAL FULLSCREEN ==========

  /**
   * Ouvre le modal fullscreen avec la vidéo
   */
  function openFullscreenModal(videoSrc, currentTime = 0) {
    const modal = document.querySelector(SELECTORS.modal);
    const player = document.querySelector(SELECTORS.modalPlayer);
    
    if (!modal || !player) return;

    // Mémorise si une vidéo jouait
    state.wasPlayingBeforeModal = state.currentActiveVideo !== null;
    
    // Pause la vidéo inline
    pauseAllVideos();

    // Configure le player modal
    const source = player.querySelector('source');
    if (source) {
      source.src = videoSrc;
    }
    player.load();
    player.currentTime = currentTime;

    // Ouvre le modal
    state.modalOpen = true;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Lance la lecture
    player.play().catch(() => {});
  }

  /**
   * Ferme le modal fullscreen
   */
  function closeFullscreenModal() {
    const modal = document.querySelector(SELECTORS.modal);
    const player = document.querySelector(SELECTORS.modalPlayer);
    
    if (!modal) return;

    // Mémorise le temps de lecture
    const currentTime = player?.currentTime || 0;

    // Stop et reset le player modal
    if (player) {
      player.pause();
      player.currentTime = 0;
    }

    // Ferme le modal
    state.modalOpen = false;
    modal.classList.remove('is-active');
    document.body.style.overflow = '';

    // Relance la vidéo inline si elle jouait avant
    if (state.wasPlayingBeforeModal && state.sectionVisible) {
      const activeCard = getActiveVideoCard();
      if (activeCard) {
        const video = getCardVideo(activeCard);
        if (video) {
          video.currentTime = currentTime;
          playVideo(video);
        }
      }
    }
  }

  // ========== EVENT LISTENERS ==========

  /**
   * Initialise les événements
   */
  function initEvents() {
    // Clic sur l'overlay play/pause
    document.querySelectorAll(`${SELECTORS.carousel} ${SELECTORS.overlay}`).forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = overlay.closest('.carousel-card');
        if (!card?.classList.contains('is-active')) return;

        const video = getCardVideo(card);
        toggleVideo(video);
      });
    });

    // Clic sur le bouton fullscreen
    document.querySelectorAll(`${SELECTORS.carousel} ${SELECTORS.fullscreenBtn}`).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.carousel-card');
        if (!card) return;

        const video = getCardVideo(card);
        const videoSrc = card.dataset.video;
        const currentTime = video?.currentTime || 0;

        if (videoSrc) {
          openFullscreenModal(videoSrc, currentTime);
        }
      });
    });

    // Fermeture du modal
    const modal = document.querySelector(SELECTORS.modal);
    const modalOverlay = modal?.querySelector(SELECTORS.modalOverlay);
    const modalClose = document.querySelector(SELECTORS.modalClose);

    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeFullscreenModal);
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeFullscreenModal);
    }

    // Fermeture avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.modalOpen) {
        closeFullscreenModal();
      }
    });

    // Observer les changements de carte active (MutationObserver)
    initCardChangeObserver();
  }

  /**
   * Observe les changements de classe is-active sur les cartes
   */
  function initCardChangeObserver() {
    const carousel = document.querySelector(SELECTORS.carousel);
    if (!carousel) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const card = mutation.target;
          if (card.classList.contains('carousel-card--video')) {
            // Une carte vidéo a changé de classe
            if (card.classList.contains('is-active')) {
              onCardChange();
            }
          }
        }
      });
    });

    // Observer toutes les cartes vidéo
    carousel.querySelectorAll(SELECTORS.videoCard).forEach(card => {
      observer.observe(card, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // ========== INITIALISATION ==========

  /**
   * Initialise le système
   */
  function init() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  function setup() {
    // Initialiser le préchargement lazy (quand on approche de la section)
    initLazyPreload();
    
    initSectionObserver();
    initEvents();
    initVideoModalEvents(); // Garde la compatibilité avec l'ancien système
  }

  // ========== API PUBLIQUE ==========

  return {
    init,
    pauseAllVideos,
    onCardChange,
    openFullscreenModal,
    closeFullscreenModal
  };

})();

// DÉSACTIVÉ TEMPORAIREMENT - Système vidéo
// VideoCarouselManager.init();

// ========================================
// GALLERY MODAL MANAGER - Système unifié
// Photos et Affiches avec navigation
// ========================================

const GalleryManager = (function() {
  'use strict';
  
  // État
  let currentIndex = 0;
  let currentImages = [];
  let savedScrollPosition = 0;
  let currentMode = 'single'; // 'single' ou 'masonry'
  
  // Images pour la galerie photo
  const photoImages = [
    'assets/img/gallery/photo1.png',
    'assets/img/gallery/photo2.png',
    'assets/img/gallery/photo6.png',
    'assets/img/gallery/photo4.png',
    'assets/img/gallery/photo5.png',
    'assets/img/gallery/photo3.png',
    'assets/img/gallery/photo7.png',
    'assets/img/gallery/photo10.jpg',
    'assets/img/gallery/photo11.png',
    'assets/img/gallery/photo12.png'
  ];
  
  // Images pour la galerie affiches
  const affichesImages = [
    'assets/img/affiches/affiche1.png',
    'assets/img/affiches/affiche2.png',
    'assets/img/affiches/affiche3.png',
    'assets/img/affiches/affiche4.png'
  ];
  
  // Références DOM
  let modal = null;
  let overlay = null;
  let closeBtn = null;
  let singleContainer = null;
  let masonryContainer = null;
  let masonryGrid = null;
  let prevBtn = null;
  let nextBtn = null;
  let imageEl = null;
  let currentEl = null;
  let totalEl = null;
  
  // Lightbox
  let lightbox = null;
  let lightboxOverlayEl = null;
  let lightboxImageEl = null;
  let lightboxCloseBtn = null;
  let lightboxPrevBtn = null;
  let lightboxNextBtn = null;
  
  /**
   * Initialise les références DOM
   */
  function cacheDOM() {
    modal = document.getElementById('gallery-modal');
    if (!modal) return false;
    
    overlay = modal.querySelector('.gallery-modal__overlay');
    closeBtn = modal.querySelector('.gallery-modal__close');
    singleContainer = modal.querySelector('.gallery-modal__single');
    masonryContainer = modal.querySelector('.gallery-modal__masonry');
    masonryGrid = modal.querySelector('.gallery-modal__masonry-grid');
    prevBtn = modal.querySelector('.gallery-modal__nav--prev');
    nextBtn = modal.querySelector('.gallery-modal__nav--next');
    imageEl = modal.querySelector('.gallery-modal__image');
    currentEl = modal.querySelector('.gallery-modal__current');
    totalEl = modal.querySelector('.gallery-modal__total');
    
    // Lightbox
    lightbox = document.getElementById('gallery-lightbox');
    if (lightbox) {
      lightboxOverlayEl = lightbox.querySelector('.gallery-lightbox__overlay');
      lightboxImageEl = lightbox.querySelector('.gallery-lightbox__image');
      lightboxCloseBtn = lightbox.querySelector('.gallery-lightbox__close');
      lightboxPrevBtn = lightbox.querySelector('.gallery-lightbox__nav--prev');
      lightboxNextBtn = lightbox.querySelector('.gallery-lightbox__nav--next');
    }
    
    return true;
  }
  
  /**
   * Génère la grille masonry avec les images
   * Optimisation : préchargement progressif pour mobile
   */
  function generateMasonryGrid() {
    if (!masonryGrid) return;
    
    masonryGrid.innerHTML = '';
    
    currentImages.forEach((src, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-modal__masonry-item';
      item.dataset.index = index;
      
      const img = document.createElement('img');
      img.alt = `Photo ${index + 1}`;
      img.decoding = 'async';
      
      img.loading = 'eager';
      img.src = src;
      
      item.appendChild(img);
      masonryGrid.appendChild(item);
      
      // Clic pour ouvrir le lightbox
      item.addEventListener('click', () => {
        openLightbox(index);
      });
    });
  }
  
  /**
   * Ouvre le lightbox sur une image spécifique
   */
  function openLightbox(index) {
    if (!lightbox) return;
    
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('is-open');
  }
  
  /**
   * Ferme le lightbox
   */
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
  }
  
  /**
   * Met à jour l'image dans le lightbox
   */
  function updateLightboxImage() {
    if (!lightboxImageEl || currentImages.length === 0) return;
    
    lightboxImageEl.style.opacity = '0';
    lightboxImageEl.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      lightboxImageEl.src = currentImages[currentIndex];
      lightboxImageEl.alt = `Image ${currentIndex + 1}`;
      
      lightboxImageEl.onload = () => {
        lightboxImageEl.style.opacity = '1';
        lightboxImageEl.style.transform = 'scale(1)';
      };
    }, 100);
  }
  
  /**
   * Navigation lightbox
   */
  function goToNextLightbox() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateLightboxImage();
  }
  
  function goToPrevLightbox() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateLightboxImage();
  }
  
  /**
   * Ouvre la galerie
   */
  function openGallery(type) {
    if (!modal) return;
    
    // Sélectionner les images selon le type
    if (type === 'photo') {
      currentImages = photoImages;
      // Photos : masonry sur desktop, single sur mobile
      currentMode = window.innerWidth > 768 ? 'masonry' : 'single';
    } else {
      currentImages = affichesImages;
      // Affiches : toujours en mode single (slide)
      currentMode = 'single';
    }
    currentIndex = 0;
    
    // Sauvegarder la position de scroll AVANT de bloquer
    savedScrollPosition = window.scrollY;
    
    // Bloquer le scroll avec position fixed (évite le jump)
    document.body.style.setProperty('--scroll-position', `-${savedScrollPosition}px`);
    document.documentElement.classList.add('no-scroll');
    
    // Appliquer le mode
    modal.classList.remove('is-single', 'is-masonry');
    modal.classList.add(currentMode === 'masonry' ? 'is-masonry' : 'is-single');
    
    if (currentMode === 'masonry') {
      // Mode masonry : générer la grille
      generateMasonryGrid();
    } else {
      // Mode single : afficher la première image
      updateImage();
    }
    
    // Ouvrir la modal
    modal.classList.add('active');
  }
  
  /**
   * Ferme la galerie
   */
  function closeGallery() {
    if (!modal) return;
    
    // Fermer aussi le lightbox si ouvert
    closeLightbox();
    
    modal.classList.remove('active');
    
    // Capturer la position avant modification
    const scrollY = savedScrollPosition;
    
    // Retirer les styles de blocage
    document.body.style.removeProperty('--scroll-position');
    document.documentElement.classList.remove('no-scroll');
    
    // Restaurer la position instantanément
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
    
    // Nettoyer
    setTimeout(() => {
      if (imageEl) imageEl.src = '';
      if (masonryGrid) masonryGrid.innerHTML = '';
      modal.classList.remove('is-single', 'is-masonry');
    }, 300);
  }
  
  /**
   * Met à jour l'image affichée
   */
  function updateImage() {
    if (!imageEl || currentImages.length === 0) return;
    
    // Animation de transition
    imageEl.style.opacity = '0';
    imageEl.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      imageEl.src = currentImages[currentIndex];
      imageEl.alt = `Image ${currentIndex + 1}`;
      
      // Attendre le chargement
      imageEl.onload = () => {
        imageEl.style.opacity = '1';
        imageEl.style.transform = 'scale(1)';
      };
    }, 150);
    
    // Mettre à jour le compteur
    if (currentEl) currentEl.textContent = currentIndex + 1;
    if (totalEl) totalEl.textContent = currentImages.length;
  }
  
  /**
   * Image suivante
   */
  function nextImage() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateImage();
  }
  
  /**
   * Image précédente
   */
  function prevImage() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateImage();
  }
  
  /**
   * Récupère l'instance du carrousel parent
   */
  function getCarouselInstance(card) {
    const carousel = card.closest('.carousel-container');
    const carouselData = carousel?.dataset.carousel;
    if (carouselData && window.carousels) {
      return carouselData === 'dev-web' 
        ? window.carousels.devWeb 
        : window.carousels.creativeNumerique;
    }
    return null;
  }
  
  /**
   * Configure les événements
   */
  function bindEvents() {
    // Gestion des clics sur les cartes galerie (clic sur toute la carte)
    document.querySelectorAll('.carousel-card[data-type="gallery"]').forEach(card => {
      card.addEventListener('click', (e) => {
        // Ne réagir que si la carte est active
        if (!card.classList.contains('is-active')) return;
        
        // Bloquer si drag en cours
        const carouselInstance = getCarouselInstance(card);
        if (carouselInstance?.hasMoved()) return;
        
        e.preventDefault();
        
        // Déterminer le type de galerie via data-gallery
        const type = card.dataset.gallery || 'affiches';
        openGallery(type);
      });
    });
    
    // Fermeture : bouton X
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeGallery();
      });
    }
    
    // Fermeture : clic overlay
    if (overlay) {
      overlay.addEventListener('click', closeGallery);
    }
    
    // Navigation : boutons
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevImage();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextImage();
      });
    }
    
    // Navigation : clavier
    document.addEventListener('keydown', (e) => {
      // Priorité au lightbox s'il est ouvert
      if (lightbox && lightbox.classList.contains('is-open')) {
        switch (e.key) {
          case 'Escape':
            closeLightbox();
            break;
          case 'ArrowLeft':
            goToPrevLightbox();
            break;
          case 'ArrowRight':
            goToNextLightbox();
            break;
        }
        return;
      }
      
      // Sinon gérer la modal principale
      if (!modal.classList.contains('active')) return;
      
      switch (e.key) {
        case 'Escape':
          closeGallery();
          break;
        case 'ArrowLeft':
          if (currentMode === 'single') prevImage();
          break;
        case 'ArrowRight':
          if (currentMode === 'single') nextImage();
          break;
      }
    });
    
    // === ÉVÉNEMENTS LIGHTBOX ===
    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeLightbox();
      });
    }
    
    if (lightboxOverlayEl) {
      lightboxOverlayEl.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToPrevLightbox();
      });
    }
    
    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToNextLightbox();
      });
    }
  }
  
  /**
   * Initialisation
   */
  function init() {
    if (!cacheDOM()) {
      console.warn('GalleryManager: Modal non trouvée');
      return;
    }
    bindEvents();
  }
  
  return { init, openGallery, closeGallery };
})();

// Initialiser le gestionnaire de galerie
document.addEventListener('DOMContentLoaded', () => {
  GalleryManager.init();
});

// ========================================
// VIDEO MODAL MANAGER - Player personnalisé
// Aucune vidéo dans le DOM au chargement
// ========================================

const VideoModalManager = (function() {
  'use strict';
  
  // Références DOM
  let modal = null;
  let overlay = null;
  let closeBtn = null;
  let videoContainer = null;
  let controls = null;
  let playBtn = null;
  let muteBtn = null;
  let progressBar = null;
  let progressFilled = null;
  let currentVideo = null;
  let progressInterval = null;
  let savedScrollPosition = 0;
  
  /**
   * Initialise les références DOM
   */
  function cacheDOM() {
    modal = document.getElementById('video-modal');
    if (!modal) return false;
    
    overlay = modal.querySelector('.video-modal__overlay');
    closeBtn = modal.querySelector('.video-modal__close');
    videoContainer = modal.querySelector('.video-modal__video-container');
    controls = modal.querySelector('.video-modal__controls');
    playBtn = modal.querySelector('.video-modal__btn--play');
    muteBtn = modal.querySelector('.video-modal__btn--mute');
    progressBar = modal.querySelector('.video-modal__progress');
    progressFilled = modal.querySelector('.video-modal__progress-filled');
    
    return true;
  }
  
  /**
   * Met à jour l'icône play/pause
   */
  function updatePlayIcon() {
    if (!playBtn || !currentVideo) return;
    const icon = playBtn.querySelector('i');
    if (currentVideo.paused) {
      icon.className = 'bx bx-play';
    } else {
      icon.className = 'bx bx-pause';
    }
  }
  
  /**
   * Met à jour l'icône mute/unmute
   */
  function updateMuteIcon() {
    if (!muteBtn || !currentVideo) return;
    const icon = muteBtn.querySelector('i');
    if (currentVideo.muted) {
      icon.className = 'bx bx-volume-mute';
    } else {
      icon.className = 'bx bx-volume-full';
    }
  }
  
  /**
   * Met à jour la barre de progression
   */
  function updateProgress() {
    if (!currentVideo || !progressFilled) return;
    const percent = (currentVideo.currentTime / currentVideo.duration) * 100;
    progressFilled.style.width = `${percent}%`;
  }
  
  /**
   * Toggle play/pause
   */
  function togglePlay() {
    if (!currentVideo) return;
    if (currentVideo.paused) {
      currentVideo.play();
    } else {
      currentVideo.pause();
    }
    updatePlayIcon();
  }
  
  /**
   * Toggle mute
   */
  function toggleMute() {
    if (!currentVideo) return;
    currentVideo.muted = !currentVideo.muted;
    updateMuteIcon();
  }
  
  /**
   * Seek sur la barre de progression
   */
  function handleProgressClick(e) {
    if (!currentVideo || !progressBar) return;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    currentVideo.currentTime = percent * currentVideo.duration;
    updateProgress();
  }
  
  /**
   * Ouvre la modal et injecte la vidéo
   * @param {string} videoSrc - Chemin vers la vidéo
   */
  function openModal(videoSrc) {
    if (!modal || !videoContainer || !videoSrc) return;
    
    // Créer la balise vidéo dynamiquement (sans controls natifs)
    currentVideo = document.createElement('video');
    currentVideo.className = 'video-modal__video';
    currentVideo.src = videoSrc;
    currentVideo.playsInline = true;
    currentVideo.muted = false;
    
    // Injecter dans le DOM
    videoContainer.innerHTML = '';
    videoContainer.appendChild(currentVideo);
    
    // Reset la barre de progression
    if (progressFilled) {
      progressFilled.style.width = '0%';
    }
    
    // Afficher les contrôles au démarrage
    if (controls) {
      controls.classList.add('visible');
      setTimeout(() => controls.classList.remove('visible'), 3000);
    }
    
    // Sauvegarder la position de scroll AVANT de bloquer
    savedScrollPosition = window.scrollY;
    
    // Bloquer le scroll avec position fixed (évite le jump)
    document.body.style.setProperty('--scroll-position', `-${savedScrollPosition}px`);
    document.documentElement.classList.add('no-scroll');
    
    // Afficher la modal
    modal.classList.add('active');
    
    // Événements vidéo
    currentVideo.addEventListener('play', updatePlayIcon);
    currentVideo.addEventListener('pause', updatePlayIcon);
    currentVideo.addEventListener('timeupdate', updateProgress);
    currentVideo.addEventListener('ended', () => {
      updatePlayIcon();
      if (progressFilled) progressFilled.style.width = '100%';
    });
    
    // Lancer la lecture
    currentVideo.play().then(() => {
      updatePlayIcon();
      updateMuteIcon();
    }).catch(err => {
      console.log('Autoplay prevented:', err.message);
      updatePlayIcon();
    });
  }
  
  /**
   * Ferme la modal et supprime la vidéo du DOM
   */
  function closeModal() {
    if (!modal) return;
    
    // Stopper et supprimer la vidéo
    if (currentVideo) {
      currentVideo.pause();
      currentVideo.removeEventListener('play', updatePlayIcon);
      currentVideo.removeEventListener('pause', updatePlayIcon);
      currentVideo.removeEventListener('timeupdate', updateProgress);
      currentVideo.src = '';
      currentVideo.load();
      currentVideo.remove();
      currentVideo = null;
    }
    
    // Vider le conteneur
    if (videoContainer) {
      videoContainer.innerHTML = '';
    }
    
    // Reset progression
    if (progressFilled) {
      progressFilled.style.width = '0%';
    }
    
    // Reset icônes
    if (playBtn) {
      playBtn.querySelector('i').className = 'bx bx-play';
    }
    if (muteBtn) {
      muteBtn.querySelector('i').className = 'bx bx-volume-full';
    }
    
    // Cacher la modal
    modal.classList.remove('active');
    
    // Capturer la position avant modification
    const scrollY = savedScrollPosition;
    
    // Retirer les styles de blocage
    document.body.style.removeProperty('--scroll-position');
    document.documentElement.classList.remove('no-scroll');
    
    // Restaurer la position instantanément
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
  }
  
  /**
   * Gère le clic sur une carte vidéo
   */
  function handleCardClick(e) {
    const card = e.currentTarget;
    
    // Ne réagir que si la carte est active
    if (!card.classList.contains('is-active')) return;
    
    // Récupérer le chemin vidéo
    const videoSrc = card.dataset.video;
    if (!videoSrc) return;
    
    // Empêcher la propagation
    e.preventDefault();
    e.stopPropagation();
    
    // Ouvrir la modal
    openModal(videoSrc);
  }
  
  /**
   * Configure les événements
   */
  function bindEvents() {
    // Clic sur les cartes vidéo
    document.querySelectorAll('.carousel-card--video[data-video]').forEach(card => {
      card.addEventListener('click', handleCardClick);
    });
    
    // Contrôles du player
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        togglePlay();
      });
    }
    
    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMute();
      });
    }
    
    if (progressBar) {
      progressBar.addEventListener('click', handleProgressClick);
    }
    
    // Fermeture : bouton X
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }
    
    // Fermeture : clic sur overlay
    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }
    
    // Fermeture : touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        closeModal();
      }
    });
    
    // Espace pour play/pause
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && modal?.classList.contains('active')) {
        e.preventDefault();
        togglePlay();
      }
    });
  }
  
  /**
   * Initialise le module
   */
  function init() {
    if (!cacheDOM()) {
      console.warn('VideoModalManager: Modal non trouvée');
      return;
    }
    
    bindEvents();
  }
  
  // API publique
  return {
    init,
    openModal,
    closeModal
  };
  
})();

// Initialiser le gestionnaire de modal vidéo
document.addEventListener('DOMContentLoaded', () => {
  VideoModalManager.init();
});
