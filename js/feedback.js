// Feedback page logic: validates form and shows success modal

document.addEventListener('DOMContentLoaded', function () {
  const init = () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const modalEl = document.getElementById('successModal');
    const Modal = window.bootstrap && window.bootstrap.Modal;
    if (!feedbackForm || !modalEl || !Modal) return false; // try again when Bootstrap is ready

    const successModal = new Modal(modalEl);
    const ratingError = document.getElementById('rating-error');
    if (ratingError) ratingError.style.display = 'none';

    feedbackForm.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!feedbackForm.checkValidity()) {
        feedbackForm.classList.add('was-validated');
        const ratingChecked = feedbackForm.querySelector('input[name="rating"]:checked');
        if (!ratingChecked && ratingError) {
          ratingError.style.display = 'block';
        }
      } else {
        const rating = feedbackForm.querySelector('input[name="rating"]:checked').value;
        const feedbackText = document.getElementById('feedbackText').value;

        console.log('Rating:', rating);
        console.log('Feedback:', feedbackText);

        successModal.show();
        feedbackForm.reset();
        feedbackForm.classList.remove('was-validated');
        if (ratingError) ratingError.style.display = 'none';
      }
    });

    const emojiRadios = feedbackForm.querySelectorAll('input[name="rating"]');
    emojiRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const ratingError = document.getElementById('rating-error');
        if (ratingError && ratingError.style.display === 'block') {
          ratingError.style.display = 'none';
        }
      });
    });

    return true;
  };

  if (!init()) {
    // Wait for Bootstrap bundle to be ready if not yet loaded
    const handler = () => { init(); window.removeEventListener('bootstrap:ready', handler); };
    window.addEventListener('bootstrap:ready', handler);
  }
});

