// js/scripts.js

document.addEventListener('DOMContentLoaded', function () {
    // Modal handling
    const authModal = document.getElementById('authModal');
    const authModalToggle = document.querySelector('[data-mdb-toggle="modal"]');

    authModalToggle.addEventListener('click', function () {
        const modalInstance = new mdb.Modal(authModal);
        modalInstance.show();
    });

    // Form validation
    const form = authModal.querySelector('form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const email = form.email.value;
        const password = form.password.value;

        if (validateEmail(email) && validatePassword(password)) {
            // Proceed with form submission (e.g., AJAX request)
            alert('Form submitted successfully!');
        } else {
            alert('Please enter valid email and password.');
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password) {
        return password.length >= 6; // Example validation
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase();
        filterTutors(query);
    });

    function filterTutors(query) {
        const tutors = document.querySelectorAll('.tutor-card');
        tutors.forEach(tutor => {
            const name = tutor.querySelector('.tutor-name').textContent.toLowerCase();
            if (name.includes(query)) {
                tutor.style.display = 'block';
            } else {
                tutor.style.display = 'none';
            }
        });
    }
});