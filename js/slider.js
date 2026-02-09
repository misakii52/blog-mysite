// Hero Slider functionality
class HeroSlider {
    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.autoSlideInterval = null;
        this.slideDuration = 5000; // 5 seconds
        this.init();
    }
    
    async init() {
        await this.loadSlides();
        this.render();
        this.setupControls();
        this.startAutoSlide();
    }
    
    async loadSlides() {
        try {
            this.slides = await dbManager.getSliderItems();
            
            // If no slides in database, use defaults
            if (this.slides.length === 0) {
                this.slides = this.getDefaultSlides();
            }
        } catch (error) {
            console.error('Error loading slides:', error);
            this.slides = this.getDefaultSlides();
        }
    }
    
    getDefaultSlides() {
        return [
            {
                id: 'default-1',
                title: 'Welcome to Bookpango',
                subtitle: 'Discover the world\'s best books with our in-depth reviews',
                imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
                buttonText: 'Explore Books',
                linkTarget: '/blog.html'
            },
            {
                id: 'default-2',
                title: 'Expert Book Reviews',
                subtitle: 'Honest reviews from our team of book enthusiasts',
                imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
                buttonText: 'Read Reviews',
                linkTarget: '/blog.html'
            }
        ];
    }
    
    render() {
        const sliderContainer = document.getElementById('sliderContainer');
        const sliderDots = document.getElementById('sliderDots');
        
        if (!sliderContainer || this.slides.length === 0) return;
        
        // Render slides
        sliderContainer.innerHTML = this.slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="slide-background" 
                     style="background-image: url('${slide.imageUrl}')">
                </div>
                <div class="slide-content">
                    <h2 class="slide-title">${slide.title}</h2>
                    <p class="slide-subtitle">${slide.subtitle}</p>
                    <a href="${slide.linkTarget || '#'}" class="slide-button">
                        ${slide.buttonText || 'Learn More'}
                    </a>
                </div>
            </div>
        `).join('');
        
        // Render dots
        if (sliderDots) {
            sliderDots.innerHTML = this.slides.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" 
                        data-index="${index}"
                        aria-label="Go to slide ${index + 1}">
                </button>
            `).join('');
        }
    }
    
    setupControls() {
        const prevBtn = document.getElementById('sliderPrev');
        const nextBtn = document.getElementById('sliderNext');
        const sliderDots = document.getElementById('sliderDots');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        if (sliderDots) {
            sliderDots.addEventListener('click', (e) => {
                if (e.target.classList.contains('slider-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    this.goToSlide(index);
                }
            });
        }
        
        // Pause auto-slide on hover
        const slider = document.getElementById('heroSlider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.pauseAutoSlide());
            slider.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        // Hide current slide
        const currentSlide = document.querySelector('.slide.active');
        const currentDot = document.querySelector('.slider-dot.active');
        
        if (currentSlide) currentSlide.classList.remove('active');
        if (currentDot) currentDot.classList.remove('active');
        
        // Show new slide
        this.currentSlide = index;
        const newSlide = document.querySelector(`.slide[data-index="${index}"]`);
        const newDot = document.querySelector(`.slider-dot[data-index="${index}"]`);
        
        if (newSlide) newSlide.classList.add('active');
        if (newDot) newDot.classList.add('active');
        
        // Reset auto-slide timer
        this.resetAutoSlide();
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoSlide() {
        if (this.slides.length <= 1) return;
        
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.slideDuration);
    }
    
    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    resetAutoSlide() {
        this.pauseAutoSlide();
        this.startAutoSlide();
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const slider = new HeroSlider();
    window.heroSlider = slider;
});
