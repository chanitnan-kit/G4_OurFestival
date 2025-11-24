// Feedback page logic: validates form, sends to API, shows success modal

document.addEventListener('DOMContentLoaded', function () {
  const init = () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const modalEl = document.getElementById('successModal');
    const alertBox = document.getElementById('feedbackAlert');
    const submitBtn = feedbackForm ? feedbackForm.querySelector('button[type=\"submit\"]') : null;
    const Modal = window.bootstrap && window.bootstrap.Modal;
    if (!feedbackForm || !modalEl || !Modal) return false; // try again when Bootstrap is ready

    const successModal = new Modal(modalEl);
    const ratingError = document.getElementById('rating-error');
    if (ratingError) ratingError.style.display = 'none';

    const showAlert = (msg) => {
      if (!alertBox) return;
      alertBox.textContent = msg;
      alertBox.classList.remove('d-none');
    };

    const hideAlert = () => {
      if (!alertBox) return;
      alertBox.classList.add('d-none');
      alertBox.textContent = '';
    };

    feedbackForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopPropagation();
      hideAlert();

      // Trim textarea input before validating
      const feedbackInput = document.getElementById('feedbackText');
      if (feedbackInput) feedbackInput.value = feedbackInput.value.trim();

      if (!feedbackForm.checkValidity()) {
        feedbackForm.classList.add('was-validated');
        const ratingChecked = feedbackForm.querySelector('input[name=\"rating\"]:checked');
        if (!ratingChecked && ratingError) {
          ratingError.style.display = 'block';
        }
        return;
      }

      const rating = feedbackForm.querySelector('input[name=\"rating\"]:checked').value;
      const feedbackText = feedbackInput ? feedbackInput.value : '';

      try {
        if (submitBtn) submitBtn.disabled = true;
        const endpoint = new URL('api/index.php?r=feedback/create', window.location.href);
        const resp = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: Number(rating), comment: feedbackText }),
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          const message = (data.error && data.error.message) || 'Failed to send feedback. Please try again.';
          showAlert(message);
          return;
        }

        successModal.show();
        feedbackForm.reset();
        feedbackForm.classList.remove('was-validated');
        if (ratingError) ratingError.style.display = 'none';
      } catch (err) {
        showAlert('Network error. Please try again.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    const emojiRadios = feedbackForm.querySelectorAll('input[name=\"rating\"]');
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
