// Carousel functionality
let currentSlide = 0;
let autoplayInterval;

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.carousel-indicator');

    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentSlide) {
            slide.classList.add('active');
        }
    });

    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === currentSlide) {
            indicator.classList.add('active');
        }
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
    resetAutoplay();
}

function previousSlide() {
    showSlide(currentSlide - 1);
    resetAutoplay();
}

function goToSlide(index) {
    showSlide(index);
    resetAutoplay();
}

function startAutoplay() {
    autoplayInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 3000);
}

function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);
    startAutoplay();

    // Pause on hover
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startAutoplay();
        });
    }
});
