// 2b. สคริปต์สำหรับหน้า Feedback

document.addEventListener('DOMContentLoaded', function () {

    const feedbackForm = document.getElementById('feedbackForm');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    
    const ratingError = document.getElementById('rating-error');
    ratingError.style.display = 'none';

    feedbackForm.addEventListener('submit', function (event) {
        
        event.preventDefault();
        event.stopPropagation();

        if (!feedbackForm.checkValidity()) {
            feedbackForm.classList.add('was-validated');

            const ratingChecked = feedbackForm.querySelector('input[name="rating"]:checked');
            if (!ratingChecked) {
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
            ratingError.style.display = 'none';
        }
    });

    const emojiRadios = feedbackForm.querySelectorAll('input[name="rating"]');
    emojiRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (ratingError.style.display === 'block') {
                ratingError.style.display = 'none';
            }
        });
    });

});