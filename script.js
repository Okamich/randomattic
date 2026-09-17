// === 1. Логика переключения тем ===
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Проверяем сохраненную тему (по умолчанию ставим темную, она атмосфернее)
const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let targetTheme = theme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    updateThemeIcon(targetTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : 'ߌ駻
}

// === 2. Данные генераторов (База данных) ===
// Когда генераторов станет много, этот массив можно будет вынести в отдельный файл data.js или json
const generatorsData = [
    {
        id: 'names',
        title: 'Генератор имён',
        desc: 'Случайные имена для NPC: эльфы, дворфы, люди, орки.',
        icon: 'ߓ짬
        link: '#names' // В будущем здесь будет ссылка на страницу генератора
    },
    {
        id: 'taverns',
        title: 'Генератор таверн',
        desc: 'Названия заведений, меню, зацепки и слухи за барной стойкой.',
        icon: 'ߍꧬ
        link: '#taverns'
    },
    {
        id: 'loot',
        title: 'Случайный лут',
        desc: 'Безделушки, содержимое карманов и сокровища.',
        icon: 'ߒ৬
        link: '#loot'
    },
    {
        id: 'weather',
        title: 'Погода и окружение',
        desc: 'Описания ландшафта, запахи и погодные условия.',
        icon: 'ߌ篸溺
        link: '#weather'
    }
];

// === 3. Рендер карточек на страницу ===
const gridContainer = document.getElementById('generators-grid');

function renderGenerators() {
    gridContainer.innerHTML = ''; // Очищаем контейнер

    generatorsData.forEach(gen => {
        // Создаем элемент карточки
        const card = document.createElement('a');
        card.href = gen.link;
        card.className = 'card';
        
        // Наполняем карточку содержимым
        card.innerHTML = `
            <div class="card-icon">${gen.icon}</div>
            <h2 class="card-title">${gen.title}</h2>
            <p class="card-desc">${gen.desc}</p>
        `;
        
        gridContainer.appendChild(card);
    });
}

// Запускаем рендер при загрузке скрипта
renderGenerators();
