// Plain DOM-based ToDo app written in TypeScript

interface Todo {
    id: string;
    title: string;
    completed: boolean;
}

const STORAGE_KEY = 'ts-todo-items';

const qs = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T | null;
const qsa = (selector: string) => Array.from(document.querySelectorAll(selector));

const newTodoInput = qs<HTMLInputElement>('#new-todo')!;
const todoListEl = qs<HTMLUListElement>('#todo-list')!;
const todoCountEl = qs<HTMLSpanElement>('#todo-count')!;
const clearCompletedBtn = qs<HTMLButtonElement>('#clear-completed')!;
const toggleAllCheckbox = qs<HTMLInputElement>('#toggle-all')!;

let todos: Todo[] = loadTodos();
let currentFilter: 'all' | 'active' | 'completed' = 'all';

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos(): Todo[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Todo[];
        return parsed;
    } catch (e) {
        console.log(e);
        return [];
    }
}

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

function addTodo(title: string) {
    const t: Todo = { id: uid(), title: title.trim(), completed: false };
    if (!t.title) return;
    todos.unshift(t);
    saveTodos();
    render();
}

function removeTodo(id: string) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
}

function toggleTodo(id: string) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos();
    render();
}

function updateTodoTitle(id: string, title: string) {
    todos = todos.map(t => t.id === id ? { ...t, title: title.trim() } : t);
    saveTodos();
    render();
}

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    render();
}

function setFilter(filter: 'all' | 'active' | 'completed') {
    currentFilter = filter;
    qsa('.filters a').forEach(a => a.classList.toggle('selected', (a as HTMLAnchorElement).dataset.filter === filter));
    render();
}

function render() {
    // show/hide main depending on todos
    const mainSection = qs<HTMLElement>('.main')!;
    mainSection.style.display = todos.length ? 'block' : 'none';

    const filtered = todos.filter(t => {
        if (currentFilter === 'active') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    todoListEl.innerHTML = '';

    for (const t of filtered) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = t.id;

        const view = document.createElement('div');
        view.className = 'view';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = t.completed;
        checkbox.addEventListener('change', () => toggleTodo(t.id));

        const label = document.createElement('div');
        label.className = 'label' + (t.completed ? ' completed' : '');
        label.textContent = t.title;
        label.title = 'Double-click to edit';

        // enable editing on double-click
        label.addEventListener('dblclick', () => startEdit(li, t));

        const destroy = document.createElement('button');
        destroy.className = 'destroy';
        destroy.innerHTML = '✕';
        destroy.title = 'Delete';
        destroy.addEventListener('click', () => removeTodo(t.id));

        view.appendChild(checkbox);
        view.appendChild(label);
        view.appendChild(destroy);

        li.appendChild(view);
        todoListEl.appendChild(li);
    }

    const remaining = todos.filter(t => !t.completed).length;
    todoCountEl.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;

    // footer visibility
    const footer = qs<HTMLElement>('.footer')!;
    footer.style.display = todos.length ? 'flex' : 'none';

    // toggle all status
    toggleAllCheckbox.checked = todos.length > 0 && todos.every(t => t.completed);
}

function startEdit(li: HTMLLIElement, todo: Todo) {
    const editInput = document.createElement('input');
    editInput.className = 'edit';
    editInput.value = todo.title;

    // replace view with input
    li.innerHTML = '';
    li.appendChild(editInput);
    editInput.focus();
    // move caret to end
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    function commit() {
        const val = editInput.value.trim();
        if (val) updateTodoTitle(todo.id, val);
        else removeTodo(todo.id);
    }

    editInput.addEventListener('blur', () => commit());
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            commit();
        } else if (e.key === 'Escape') {
            render();
        }
    });
}

// event bindings
newTodoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = newTodoInput.value;
        addTodo(val);
        newTodoInput.value = '';
    }
});

clearCompletedBtn.addEventListener('click', () => clearCompleted());

toggleAllCheckbox.addEventListener('change', () => {
    const checked = toggleAllCheckbox.checked;
    todos = todos.map(t => ({ ...t, completed: checked }));
    saveTodos();
    render();
});

qsa('.filters a').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const f = (a as HTMLAnchorElement).dataset.filter as 'all' | 'active' | 'completed';
        setFilter(f);
    });
});

// initial setup
(function init() {
    // make footer/main hidden if empty
    const mainSection = qs<HTMLElement>('.main')!;
    mainSection.style.display = todos.length ? 'block' : 'none';
    setFilter('all');
    render();
})();

