const names = ['Артур','Эльза','Гарольд','Лиана','Борис','Мира','Дариус','Селена'];

    function generateName() {
      console.log('Имена:', names)
      console.log('длинна массива:', names.length)
      const randomIndex = Math.floor(Math.random()*names.length);
      console.log('Выбран индекс:', randomIndex)
      console.log('Сгенерировано имя:', names[randomIndex])
      return names[randomIndex];
    }
    
    document.getElementById('generate-btn').addEventListener('click', function() {
      console.log('Button pressed')
      const nameOutput = document.getElementById('name-output');
      if (nameOutput) {
        nameOutput.textContent = generateName();
      } else {
        console.error('Элемент с id "name-output" не найден');
      }
    });
