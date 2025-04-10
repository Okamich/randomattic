const firstNames = ['Пьяный','Глухой','Синий','Быстрый','Ветвистый','Благородный','Крысиный','Жидкий'];
const lastNames = ['Дракон','Лось','Дуб','Фрегат','Гоблин','Ветер','Водопад','Стул'];
    function generateTavern() {
      console.log('Имена:', firstNames, lastNames)
      const randomFirstIndex = Math.floor(Math.random() * firstNames.length);
      const randomLastIndex = Math.floor(Math.random() * lastNames.length);
      console.log('Выбран индекс:', randomFirstIndex, randomLastIndex)
      const tavernName = firstNames[randomFirstIndex] + lastNames[randomLastIndex]
      return tavernName;
    }
    
    document.getElementById('generate-btn').addEventListener('click', function() {
      console.log('Button pressed')
      const nameOutput = document.getElementById('name-output');
      if (nameOutput) {
        nameOutput.textContent = generateTavern();
      } else {
        console.error('Элемент с id "name-output" не найден');
      }
    });
