
class VerticalCubeSlider {
    constructor() {
        this.currentIndex = 0;
        this.isAnimating = false;
        this.sliceCount = 10;
        this.autoPlayInterval = null;
        this.isPlaying = true;
        this.currentFace = 0;

        this.images = [
            {
                url: 'resources/imgForIndex/Banner0.jpg',
                thumb: 'resources/imgForIndex/Banner0.jpg',
                title: 'CS100 Fireworks Festival',
                description: 'Midnight sky symphony with cascading peonies and comet tails above the riverfront.'
            },
            {
                url: 'resources/imgForIndex/Banner1.jpg',
                thumb: 'resources/imgForIndex/Banner1.jpg',
                title: 'Riverfront Light Parade',
                description: 'Candlelit promenade, glowing floats, and holiday cocktail bars along the waterfront.'
            },
            {
                url: 'resources/imgForIndex/Banner2.jpg',
                thumb: 'resources/imgForIndex/Banner2.jpg',
                title: 'Sky Symphony Grand Finale',
                description: 'Santa cameos, joyful choirs, and a playful finale that lights up every kid\'s smile.',
                position: 'center top'
            },
            {
                url: 'resources/imgForIndex/Banner4.jpg',
                thumb: 'resources/imgForIndex/Banner4.jpg',
                title: 'Frosty Forest Market',
                description: 'Sparkling pine paths, artisan gifts, and cocoa stops wrapped in golden fairy lights.'
            }
        ];

        this.init();
    }

    init() {
        this.createSlices();
        this.createDots();
        this.createThumbnails();
        this.attachEventListeners();
        this.initializeImages();
        this.startAutoPlay();
    }

    createSlices() {
        const stage = document.getElementById('sliderStage');
        const containerWidth = stage.offsetWidth;

        for (let i = 0; i < this.sliceCount; i++) {
            const sliceContainer = document.createElement('div');
            sliceContainer.className = 'slice-container';

            const sliceCube = document.createElement('div');
            sliceCube.className = 'slice-cube';

            for (let face = 1; face <= 4; face++) {
                const sliceFace = document.createElement('div');
                sliceFace.className = `slice-face face-${face}`;

                const sliceImage = document.createElement('div');
                sliceImage.className = 'slice-image';
                sliceImage.dataset.face = face;

                const sliceWidth = containerWidth / this.sliceCount;
                const leftPosition = -(i * sliceWidth);
                sliceImage.style.left = `${leftPosition}px`;
                sliceImage.style.width = `${containerWidth}px`;

                sliceFace.appendChild(sliceImage);
                sliceCube.appendChild(sliceFace);
            }

            sliceContainer.appendChild(sliceCube);
            stage.appendChild(sliceContainer);
        }
    }

    createDots() {
        const dotsContainer = document.getElementById('dots');

        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.dataset.index = index;

            dot.addEventListener('click', () => {
                if (!this.isAnimating && index !== this.currentIndex) {
                    this.goToSlide(index);
                }
            });

            dotsContainer.appendChild(dot);
        });
    }

    createThumbnails() {
        const thumbnailsContainer = document.getElementById('thumbnails');

        this.images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            if (index === 0) thumbnail.classList.add('active');
            thumbnail.dataset.index = index;
            thumbnail.style.backgroundImage = `url(${image.thumb})`;

            thumbnail.addEventListener('click', () => {
                if (!this.isAnimating && index !== this.currentIndex) {
                    this.goToSlide(index);
                }
            });

            thumbnailsContainer.appendChild(thumbnail);
        });
    }

    attachEventListeners() {
        document.getElementById('prevArrow').addEventListener('click', () => this.prevSlide());
        document.getElementById('nextArrow').addEventListener('click', () => this.nextSlide());
        document.getElementById('playPauseBtn').addEventListener('click', () => this.toggleAutoPlay());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoPlay();
            }
        });

        const container = document.querySelector('.slider-container');
        container.addEventListener('mouseenter', () => {
            if (this.isPlaying) {
                this.pauseAutoPlay();
            }
        });

        container.addEventListener('mouseleave', () => {
            if (this.isPlaying) {
                this.resumeAutoPlay();
            }
        });

        window.addEventListener('resize', () => this.updateSliceWidths());
    }

    updateSliceWidths() {
        const stage = document.getElementById('sliderStage');
        const containerWidth = stage.offsetWidth;
        const sliceImages = document.querySelectorAll('.slice-image');

        sliceImages.forEach((img, index) => {
            const sliceIndex = Math.floor(index / 4);
            const sliceWidth = containerWidth / this.sliceCount;
            const leftPosition = -(sliceIndex * sliceWidth);

            img.style.width = `${containerWidth}px`;
            img.style.left = `${leftPosition}px`;
        });
    }

    initializeImages() {
        this.setFaceImage(1, this.images[0]);
        const titleEl = document.getElementById('slideTitle');
        const descriptionEl = document.getElementById('slideDescription');
        if (titleEl && descriptionEl) {
            titleEl.textContent = this.images[0].title;
            descriptionEl.textContent = this.images[0].description;
        }

        const progressBar = document.getElementById('progressBar');
        setTimeout(() => {
            progressBar.classList.add('active');
        }, 100);
    }

    setFaceImage(faceNumber, imageData) {
        const imageUrl = typeof imageData === 'string' ? imageData : imageData.url;
        const position = typeof imageData === 'object' && imageData.position ? imageData.position : 'center';
        const faceImages = document.querySelectorAll(`.slice-image[data-face="${faceNumber}"]`);
        faceImages.forEach(img => {
            img.style.backgroundImage = `url(${imageUrl})`;
            img.style.backgroundPosition = position;
        });
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;

        this.isAnimating = true;

        const progressBar = document.getElementById('progressBar');
        progressBar.classList.remove('active');
        progressBar.classList.add('reset');

        document.getElementById('prevArrow').disabled = true;
        document.getElementById('nextArrow').disabled = true;

        const textOverlay = document.getElementById('textOverlay');
        const titleEl = document.getElementById('slideTitle');
        const descriptionEl = document.getElementById('slideDescription');
        const cubes = document.querySelectorAll('.slice-cube');

        const nextFace = (this.currentFace + 1) % 4;
        const nextFaceNumber = nextFace + 1;

        this.setFaceImage(nextFaceNumber, this.images[index]);

        textOverlay.classList.add('hiding');

        cubes.forEach(cube => {
            cube.className = 'slice-cube';
            void cube.offsetWidth;
            cube.classList.add(`rotate-${nextFace}`);
        });

        setTimeout(() => {
            titleEl.textContent = this.images[index].title;
            descriptionEl.textContent = this.images[index].description;
            textOverlay.classList.remove('hiding');

            this.currentIndex = index;
            this.currentFace = nextFace;
            this.updateDots();
            this.updateThumbnails();

            document.getElementById('prevArrow').disabled = false;
            document.getElementById('nextArrow').disabled = false;

            if (this.isPlaying) {
                setTimeout(() => {
                    progressBar.classList.remove('reset');
                    progressBar.classList.add('active');
                }, 50);
            }

            this.isAnimating = false;
        }, 950);
    }

    updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }

    updateThumbnails() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumbnail, i) => {
            thumbnail.classList.toggle('active', i === this.currentIndex);
        });
    }

    nextSlide() {
        if (this.isAnimating) return;
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        if (this.isAnimating) return;
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 3500);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resumeAutoPlay() {
        if (this.isPlaying && !this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }

    toggleAutoPlay() {
        const btn = document.getElementById('playPauseBtn');
        const progressBar = document.getElementById('progressBar');
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            btn.classList.remove('paused');
            this.startAutoPlay();
            progressBar.classList.remove('reset');
            progressBar.classList.add('active');
        } else {
            btn.classList.add('paused');
            this.pauseAutoPlay();
            progressBar.classList.remove('active');
            progressBar.classList.add('reset');
        }
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VerticalCubeSlider();
});
