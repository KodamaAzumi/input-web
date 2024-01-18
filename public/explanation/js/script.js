let slideIndex = { write: 0, look: 0, chat: 0 };

const plusSlides = (n, name) => {
  showSlides((slideIndex[name] += n), name);
};

const showSlides = (n, name) => {
  const slides = document.querySelectorAll(`.${name}-slide`);
  const slidesOuter = document.querySelector(`.${name}-slides`);
  const sliderDots = document.querySelector(`.${name}-slider-dots`);
  const dots = sliderDots.querySelectorAll('.dot');

  if (n >= slides.length) {
    slideIndex[name] = 0;
  }
  if (n < 0) {
    slideIndex[name] = slides.length - 1;
  }

  const percentage = slideIndex[name] * -33.3333;
  slidesOuter.style.transform = `translateX(${percentage}%)`;

  // すべてのドットを非アクティブにする
  dots.forEach((dot) => dot.classList.remove('active-dot'));

  // 現在のスライドに対応するドットをアクティブにする
  dots[slideIndex[name]].classList.add('active-dot');
};

// インジケータ（ドット）を制御する新しい部分
const createIndicator = (name) => {
  const slides = document.querySelectorAll(`.${name}-slide`);
  const dotContainer = document.querySelector(`.${name}-slider-dots`);

  const currentSlide = (n) => {
    showSlides((slideIndex[name] = n), name);
  };

  slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.addEventListener('click', () => {
      currentSlide(index);
    });
    dotContainer.appendChild(dot);
  });
};

createIndicator('write');
createIndicator('look');
createIndicator('chat');

showSlides(slideIndex.write, 'write');
showSlides(slideIndex.look, 'look');
showSlides(slideIndex.chat, 'chat');
