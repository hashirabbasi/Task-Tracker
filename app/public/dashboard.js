document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuth();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load tasks
    loadTasks();
    
    // Load memory usage
    loadMemoryUsage();
});

// Authentication check
function checkAuth() {
    fetch('/dashboard')
        .then(response => {
            if (!response.ok) {
                // Not authenticated, redirect to login
                window.location.href = 'index.html';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.user) {
                // Display username
                document.getElementById('username-display').textContent = data.user.username;
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            window.location.href = 'index.html';
        });
}

// Initialize event listeners
function initEventListeners() {
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Task form submission
    document.getElementById('task-form').addEventListener('submit', addTask);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            // Filter tasks
            const filter = e.target.dataset.filter;
            filterTasks(filter);
        });
    });
    
    // Refresh memory button
    document.getElementById('refresh-memory').addEventListener('click', loadMemoryUsage);
}

// Logout function
function logout() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    });
}

// Load tasks from API
function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            renderTasks(tasks);
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            alert('Failed to load tasks. Please refresh the page.');
        });
}

// Render tasks to the DOM
function renderTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="no-tasks">No tasks found. Add a new task to get started!</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.status}`;
        taskElement.dataset.status = task.status;
        taskElement.dataset.id = task._id;
        
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        const updatedDate = new Date(task.updatedAt).toLocaleDateString();
        
        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description || 'No description'}</div>
            <div class="task-meta">
                <span>Status: ${formatStatus(task.status)}</span>
                <span>Created: ${createdDate}</span>
            </div>
            <div class="task-actions">
                <button class="edit-task" data-id="${task._id}">Edit</button>
                <button class="delete-task" data-id="${task._id}">Delete</button>
            </div>
        `;
        
        tasksList.appendChild(taskElement);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.id;
            editTask(taskId);
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.id;
            deleteTask(taskId);
        });
    });
}

// Format status for display
function formatStatus(status) {
    switch(status) {
        case 'todo': return 'To Do';
        case 'in-progress': return 'In Progress';
        case 'done': return 'Done';
        default: return status;
    }
}

// Filter tasks by status
function filterTasks(filter) {
    const tasks = document.querySelectorAll('.task-item');
    
    tasks.forEach(task => {
        if (filter === 'all' || task.dataset.status === filter) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}

// Add a new task
function addTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const status = document.getElementById('task-status').value;
    
    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, status })
    })
    .then(response => response.json())
    .then(task => {
        // Reset form
        document.getElementById('task-form').reset();
        // Reload tasks
        loadTasks();
    })
    .catch(error => {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
    });
}

// Edit a task (simplified - in a real app, you'd use a modal)
function editTask(taskId) {
    const newStatus = prompt('Enter new status (todo, in-progress, done):');
    if (!newStatus) return;
    
    if (!['todo', 'in-progress', 'done'].includes(newStatus)) {
        alert('Invalid status. Please use todo, in-progress, or done.');
        return;
    }
    
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    const title = taskElement.querySelector('.task-title').textContent;
    const description = taskElement.querySelector('.task-description').textContent;
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, status: newStatus })
    })
    .then(response => response.json())
    .then(updatedTask => {
        loadTasks();
    })
    .catch(error => {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again.');
    });
}

// Delete a task
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        loadTasks();
    })
    .catch(error => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    });
}

// Load memory usage information
function loadMemoryUsage() {
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            const memoryUsageElement = document.getElementById('memory-usage');
            memoryUsageElement.innerHTML = `
                <p><strong>Uptime:</strong> ${Math.floor(data.uptime / 60)} minutes</p>
                <p><strong>RSS:</strong> ${data.memoryUsage.rss}</p>
                <p><strong>Heap Total:</strong> ${data.memoryUsage.heapTotal}</p>
                <p><strong>Heap Used:</strong> ${data.memoryUsage.heapUsed}</p>
                <p><strong>External:</strong> ${data.memoryUsage.external}</p>
                <p><strong>Last Updated:</strong> ${new Date().toLocaleTimeString()}</p>
            `;
        })
        .catch(error => {
            console.error('Error loading memory usage:', error);
            document.getElementById('memory-usage').innerHTML = `
                <p>Failed to load memory usage information.</p>
                <p>Error: ${error.message}</p>
            `;
        });
}