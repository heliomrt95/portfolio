document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const overlay = document.getElementById('form-overlay');
  const showFormBtn = document.getElementById('show-form-btn');
  const contactBtn = document.getElementById('contact-btn');
  const mobileContactBtn = document.getElementById('mobile-contact-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const menuIcon = document.querySelector('#menu-icon');
  const navbar = document.querySelector('.navbar');
  const menuOverlay = document.querySelector('#menu-overlay');
  const navbarLinks = document.querySelectorAll('.navbar a:not(.navbar-contact-btn)'); // Sélectionne tous les liens de la navbar sauf le bouton contact

  let scrollPosition = 0; // Variable pour sauvegarder la position de la page

  // Fonction pour désactiver le scroll
  function disableScroll() {
    scrollPosition = window.scrollY; // Sauvegarde la position actuelle
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
  }

  // Fonction pour réactiver le scroll
  function enableScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo({ top: scrollPosition, behavior: 'instant' }); // Restaure la position sans animation
  }

  // Fonction pour afficher le formulaire
  function showForm() {
    // Forcer le recalcul des styles avant d'ajouter la classe
    overlay.style.display = 'block'; // Assurez-vous que l'élément est visible
    void overlay.offsetHeight; // Déclenche un recalcul des styles
    form.classList.add('show');
    overlay.classList.add('show'); // Ajoute la classe pour afficher le fond flou
    disableScroll(); // Désactive le scroll
  }

  // Fonction pour masquer le formulaire
  function hideForm() {
    form.classList.remove('show');
    overlay.classList.remove('show'); // Retire la classe pour masquer le fond flou
    enableScroll(); // Réactive le scroll
  }

  // Affiche le formulaire au clic sur "M'écrire"
  showFormBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showForm();
  });

  // Affiche le formulaire au clic sur "Me Contacter"
if (contactBtn) {
  contactBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showForm();
  });
}

// Affiche le formulaire au clic sur "Me Contacter" (mobile)
if (mobileContactBtn) {
  mobileContactBtn.addEventListener('click', function (e) {
    e.preventDefault();
    hideMenu(); // Ferme d'abord le menu
    setTimeout(() => {
      showForm(); // Puis affiche le formulaire après une petite pause
    }, 300);
  });
}

  // Masque le formulaire au clic sur "Annuler"
  cancelFormBtn.addEventListener('click', function () {
    hideForm();
  });

  // Masque le formulaire si on clique sur le fond flou
  overlay.addEventListener('click', function () {
    hideForm();
  });

  // Masque le formulaire après l'envoi
  document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();

    emailjs.init("omrEvwwnobHjoxzml"); // Remplacez par votre Public Key

    emailjs.sendForm('service_jb956ot', 'template_clhib1b', this)
      .then(function () {
        hideForm(); // Masque le formulaire après l'envoi
        form.reset(); // Réinitialise les champs du formulaire
      }, function (error) {
        alert('Une erreur s\'est produit\e : ' + error.text); // Affiche une alerte uniquement en cas d'erreur
});
 });
  
  // Fonction pour afficher le menu
  function showMenu() {
    menuIcon.classList.add('bx-x'); // Change l'icône en croix
    navbar.classList.add('active'); // Affiche la navbar
    if (menuOverlay) {
      menuOverlay.classList.add('active'); // Affiche l'overlay
    }
    disableScroll(); // Désactive le scroll
  }

  // Fonction pour masquer le menu
  function hideMenu() {
    menuIcon.classList.remove('bx-x'); // Restaure l'icône du menu
    navbar.classList.remove('active'); // Masque la navbar
    if (menuOverlay) {
      menuOverlay.classList.remove('active'); // Masque l'overlay
    }
    enableScroll(); // Réactive le scroll
  }

  // Gestion du clic sur le menu hamburger
  menuIcon.addEventListener('click', function () {
    if (navbar.classList.contains('active')) {
      hideMenu();
    } else {
      showMenu();
    }
  });

  // Gestion du clic sur un lien de la navbar
  navbarLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault(); // Empêche le scroll immédiat
      const targetId = this.getAttribute('href'); // Récupère l'ancre (ex: #about)
      const targetElement = document.querySelector(targetId);
      
      // Ferme le menu sans restaurer la position (on va scroller vers une nouvelle section)
      menuIcon.classList.remove('bx-x');
      navbar.classList.remove('active');
      if (menuOverlay) {
        menuOverlay.classList.remove('active');
      }
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Scroll vers la section
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Gestion du clic sur l'overlay pour fermer le menu
  if (menuOverlay) {
    menuOverlay.addEventListener('click', hideMenu);
  }

  // Fermer le menu avec la touche Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navbar.classList.contains('active')) {
      hideMenu();
    }
  });

  // ========== SCROLL REVEAL ANIMATIONS ==========
  const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

  // Options pour l'Intersection Observer
  const revealOptions = {
    threshold: 0.15, // Déclenche quand 15% de l'élément est visible
    rootMargin: '0px 0px -50px 0px' // Déclenche un peu avant que l'élément soit complètement visible
  };

  // Fonction pour révéler les éléments (fonctionne dans les deux sens)
  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      } else {
        // Retirer la classe revealed quand l'élément sort du viewport
        // pour que l'animation se déclenche à nouveau quand on remonte
        entry.target.classList.remove('revealed');
      }
    });
  }, revealOptions);

  // Observer tous les éléments avec la classe scroll-reveal
  scrollRevealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // Pour les éléments qui sont déjà visibles au chargement (comme la section home)
  // On les révèle immédiatement
  const checkInitialVisibility = () => {
    scrollRevealElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        element.classList.add('revealed');
      }
    });
  };

  // Vérifier après un court délai pour s'assurer que le DOM est complètement chargé
  setTimeout(checkInitialVisibility, 100);
});