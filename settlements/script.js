const firstNames = ['Полесье','Глухомань','Крабург','Штифт','Саку','Чак-Чак','Вриг','Манка'];
const lastNames = ['Большое','Малое','Деревня','Город','Поселок'];

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateSettlement() {
		const rndInt = randomIntFromInterval(1, 2);
		console.log(rndInt);
      if (rndInt == 1) {
        console.log('Имена:', firstNames)
        const randomFirstIndex = Math.floor(Math.random() * firstNames.length);
        console.log('Выбран индекс:', randomFirstIndex)
        const settlementName = firstNames[randomFirstIndex]
        return settlementName;
      } else {
      	console.log('Имена:', firstNames, lastNames)
        const randomFirstIndex = Math.floor(Math.random() * firstNames.length);
        const randomLastIndex = Math.floor(Math.random() * lastNames.length);
        console.log('Выбран индекс:', randomFirstIndex, randomLastIndex)
        const settlementName = (lastNames[randomLastIndex] + " " + firstNames[randomFirstIndex])
        return settlementName;
      }
    }
    
    document.getElementById('generate-btn').addEventListener('click', function() {
      console.log('Button pressed')
      const nameOutput = document.getElementById('name-output');
      if (nameOutput) {
        nameOutput.textContent = generateSettlement();
      } else {
        console.error('Элемент с id "name-output" не найден');
      }
    });
