document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('open');
        navLinks.classList.toggle('active');
    });
    
    // Chiude il menu quando si clicca su un link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('open');
            navLinks.classList.remove('active');
        });
    });
});