document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const overlay = document.getElementById('form-overlay');
  const showFormBtn = document.getElementById('show-form-btn');
  const contactBtn = document.getElementById('contact-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const menuIcon = document.querySelector('#menu-icon');
  const navbar = document.querySelector('.navbar');
  const menuOverlay = document.querySelector('#menu-overlay');
  const navbarLinks = document.querySelectorAll('.navbar a'); // Sélectionne tous les liens de la navbar

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
    window.scrollTo(0, scrollPosition); // Restaure la position sauvegardée
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
    menuOverlay.classList.add('active'); // Affiche l'overlay
    disableScroll(); // Désactive le scroll
  }

  // Fonction pour masquer le menu
  function hideMenu() {
    menuIcon.classList.remove('bx-x'); // Restaure l'icône du menu
    navbar.classList.remove('active'); // Masque la navbar
    menuOverlay.classList.remove('active'); // Masque l'overlay
    enableScroll(); // Réactive le scroll
  }

  // Gestion du clic sur le menu hamburger
  menuIcon.addEventListener('click', function () {
    if (navbar.classList.contains('active')) {
      hideMenu();
    } else {
      showMenu();
    }
    menuIcon.classList.toggle('active'); // Active ou désactive l'animation
  });

  // Gestion du clic sur un lien de la navbar
  navbarLinks.forEach(link => {
    link.addEventListener('click', function () {
      hideMenu(); // Masque la navbar
    });
  });

  // Gestion du clic sur l'overlay pour fermer le menu
  menuOverlay.addEventListener('click', hideMenu);
});