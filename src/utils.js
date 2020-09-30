'use strict';
// Получение случайного числа

module.exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Тасование Фишера-Йетса

module.exports.shuffle = (someArray) => {
  for (let i = someArray.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(Math.random() * i);
    [someArray[i], someArray[randomPosition]] = [someArray[randomPosition], someArray[i]];
  }
  return someArray;
};

exports.hasAllExpectedProperties = (object, expectedProperties) => {
  const objectProperties = Object.keys(object);

  return expectedProperties.every((expectedProperty) => objectProperties.includes(expectedProperty));
};


