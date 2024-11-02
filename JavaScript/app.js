document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const dueDateInput = document.getElementById('dueDate');
    const sortOrderSelect = document.getElementById('sortOrder');
    let tasks = getTasksFromLocalStorage(); // Load tasks from local storage on page load

    // Set min attribute to today's date for due date input
    function setMinDate() {
      const today = new Date().toISOString().split('T')[0];
      dueDateInput.setAttribute('min', today);
    }

    setMinDate(); // Call this when the page loads

    // Add Task
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const taskName = document.getElementById('taskName').value;
      const taskDesc = document.getElementById('taskDesc').value;
      const dueDate = document.getElementById('dueDate').value;

      const taskId = Date.now().toString();
      const newTask = { taskId, taskName, taskDesc, dueDate, isDone: false }; // 'isDone' added to track completion
      
      tasks.push(newTask);
      saveTasksToLocalStorage(tasks); // Save updated tasks list to local storage
      renderTasks();
      taskForm.reset();
      setMinDate(); // Reset the minimum date after form reset
    });

    // Render Tasks with sorting by due date
    function renderTasks() {
      taskList.innerHTML = '';

      // Sort tasks based on the selected order
      const sortOrder = sortOrderSelect.value;
      tasks.sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.dueDate) - new Date(b.dueDate)
          : new Date(b.dueDate) - new Date(a.dueDate);
      });

      // Check if there are tasks to render, else show a placeholder
      if (tasks.length === 0) {
        taskList.innerHTML = `<li class="text-gray-500 text-center">No tasks yet. Add a new task!</li>`;
        return;
      }

      tasks.forEach((task) => {
        if (task.taskName && task.taskDesc && task.dueDate) { // Only render if all properties are defined
          const li = document.createElement('li');
          li.className = `bg-gray-50 p-4 rounded shadow-md flex justify-between items-center ${task.isDone ? 'opacity-50' : ''}`;
          li.innerHTML = `
            <div>
              <h3 class="font-bold ${task.isDone ? 'line-through' : ''}">${task.taskName}</h3>
              <p class="${task.isDone ? 'line-through' : ''}">${task.taskDesc}</p>
              <p class="text-sm text-gray-500">Due: ${task.dueDate}</p>
            </div>
            <div>
              <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2" onclick="markDone('${task.taskId}')">${task.isDone ? 'Undo' : 'Done'}</button>
              <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2" onclick="editTask('${task.taskId}')">Edit</button>
              <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onclick="deleteTask('${task.taskId}')">Delete</button>
            </div>
          `;
          taskList.appendChild(li);
        }
      });
    }

    // Save tasks to local storage
    function saveTasksToLocalStorage(tasks) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from local storage
    function getTasksFromLocalStorage() {
      return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // Delete Task
    window.deleteTask = (id) => {
      tasks = tasks.filter(task => task.taskId !== id);
      saveTasksToLocalStorage(tasks); // Update local storage after deletion
      renderTasks();
    };

    // Edit Task
    window.editTask = (id) => {
      const taskToEdit = tasks.find(task => task.taskId === id);

      if (taskToEdit) {
        document.getElementById('taskName').value = taskToEdit.taskName;
        document.getElementById('taskDesc').value = taskToEdit.taskDesc;
        document.getElementById('dueDate').value = taskToEdit.dueDate;

        deleteTask(id); // Remove the task first, then re-add on submit
      }
    };

    // Mark Task as Done/Undo
    window.markDone = (id) => {
      const taskToToggle = tasks.find(task => task.taskId === id);
      if (taskToToggle) {
        taskToToggle.isDone = !taskToToggle.isDone; // Toggle done status
        saveTasksToLocalStorage(tasks); // Update local storage after toggling done status
      }
      renderTasks();
    };

    // Re-render tasks when the sorting order is changed
    sortOrderSelect.addEventListener('change', renderTasks);

    renderTasks(); // Initial render of tasks from local storage
  });