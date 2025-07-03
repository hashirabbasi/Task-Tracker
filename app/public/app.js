document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    fetch('/dashboard')
        .then(response => {
            if (response.ok) {
                // User is already logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            // Continue with login page
        });

    // Login form submission
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Login successful, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show error message
                loginError.textContent = data.message || 'Login failed. Please try again.';
                loginError.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'An error occurred. Please try again later.';
            loginError.style.display = 'block';
        }
    });
});