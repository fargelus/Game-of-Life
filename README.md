# Game-of-Life
Игра "Жизнь" - это клеточный автомат, элементы которого связаны соотношением "близости".
Игру придумал математик Джон Хортон Конуэй.

## Клетки
Клетка - базовый элемент в игре. Клетки располагаются на специальном бесконечном поле.
Каждая клетка имеет ровно по 8 соседей.

Клетки могут находиться в 2 состояниях:
1. Живая ( организм )
2. Мертвая

Состояние клеток меняется во времени в зависимости от числа соседних "организмов".

## Правила
Организм:
- Живых соседей 2 или 3 => выживает на следующем поколении
- Живых соседей > 3 или < 2  => погибает от одиночества или перенаселённости
   
Пустая клетка:
- Живых соседей === 3 => на следующем поколении клетка становится живым организмом

## Примеры
1). [Планер](https://codepen.io/fargelus/pen/zPBLKa).

2). [Фигура-8](https://codepen.io/fargelus/pen/KyMxVx).

3). [Космический корабль](https://codepen.io/fargelus/pen/WXxgOK).
