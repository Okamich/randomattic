const names = ['Артур','Эльза','Гарольд','Лиана','Борис','Мира','Дариус','Селена'];
const generateBtn = document.getElementById('generate-btn');
const result = document.getElementById('result');

generateBtn.addEventListener('click' () => [
  const randomIndex = Math.floor(Math.random() * names.lenght);
  result.textContent = names[randomIndex];
]);
