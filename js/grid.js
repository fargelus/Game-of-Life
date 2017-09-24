// grid.js -- Grid(Universe/Space) module

(function () {

	"use strict"
	
	// module vars
	let cnv = document.getElementById("canvas");	

	// корд-ты клеток в бесконечной плоскости
	let gridAliveCells = [];

	// коорд-ты клетки 
	// на двумерной конечной плоскости
	let renderCells = [];

	let cellSize = 20;

	let isPause = false;

	// класс Клетка: 
	// знает свои координаты, состояние, координаты соседей
	class Cell {
		
		constructor(x, y, alive = true) {
			this.cellX = x;
			this.cellY = y;

			// по умолчанию клетка -- жива
			this.cellAlive = alive;

			// пустые соседи клетки
			this.emptyNeighbours = [];			

			// по умолчанию все соседи -- пустые
			if (alive)
				this.fillEmptyNeighbours();

			// клетка "знает" кол-во живых клеток вокруг себя
			this.aliveNeighboursCounter = 0;
		}		

		debugPrint(checkNeighbours = true) {
			console.log("X: " + this.cellX);
			console.log("Y: " + this.cellY);

			let stateInfo = this.cellAlive ? "Alive" : "Dead";
			console.log("State: " + stateInfo);

			if (checkNeighbours) {
				let len = this.emptyNeighbours.length;
				for(let i = 0; i < len; ++i)
					this.emptyNeighbours[i].debugPrint(false);
			}

		}

		// окрестность Мура
		fillEmptyNeighbours() {

			for(let currentCellY = this.cellY - cellSize; 
				currentCellY <= this.cellY + cellSize; 
				currentCellY += cellSize)

				for(let currentCellX = this.cellX - cellSize; 
					currentCellX <= this.cellX + cellSize; 
						currentCellX += cellSize) 
				{

					if (currentCellX === this.cellX
						&& currentCellY === this.cellY) continue;

					// по умолчанию все соседи -- пустые
					let cell = new Cell(currentCellX, currentCellY, false);

					// сохраняем инф-ю о пустых клетках
					this.emptyNeighbours.push(cell);
					
				}

		}

		// уточнить инф-ю о соседях и их кол-ве(!для живой клетки)
		updateNeighbours() {						

			let neighbours = this.emptyNeighbours;
			let neighboursLen = neighbours.length;

			// !!! для рождения
			// сначала обновляем соседей									
			for(let j = 0; j < neighboursLen; ++j) {

				// только если сосед мертв(устраняем дублирование)
				if (neighbours[j].isAlive === false) {

					console.log("Dead neighbours");

					// заполним соседей						
					neighbours[j].fillEmptyNeighbours();

					neighbours[j].decideDestiny();					
				}
			}		

			this.decideDestiny();
		}

		decideDestiny(){

			// оставить только пустых соседей
			this.emptyNeighbours = getArrayDistract(this.emptyNeighbours,
													gridAliveCells);

			this.aliveNeighboursCounter = 8 - this.emptyNeighbours.length;			
			
			console.log("aliveNeighboursCounter: " + this.aliveNeighboursCounter);

			if (this.cellAlive) {				
				// или блин негде жить => смерть от холода 
				// или мне одиноко => покончу собой
				if (this.aliveNeighboursCounter < 2 || this.aliveNeighboursCounter > 3) {					
					this.cellAlive = false;
				}
			}
			else{
				this.cellAlive = (this.aliveNeighboursCounter === 3);
				console.log(this.cellAlive);
			}	
		}

		get neighbours() {
			return this.emptyNeighbours;
		}

		get x() {
			return this.cellX;
		}

		get y() {
			return this.cellY;
		}

		get isAlive() {
			return this.cellAlive;
		}
	}

	// buttons
	let stepBtn = document.getElementById("step-button");
	let clearBtn = document.getElementById("clear-button");
	let runBtn = document.getElementById("run-button");
	let pauseBtn = document.getElementById("pause-button");

	createGrid();

	// ********** Event Listeners ************** //

	// grid click listener
	cnv.addEventListener("click", function (evt) {
		
		// определим кординаты клика
		let mousePos = getMousePos(evt);

		// определим к-ты клетки
		let [xGridCellStart, yGridCellStart] = getCellCoord(mousePos.x, 
															mousePos.y);

		let cell = new Cell(xGridCellStart, yGridCellStart);		

		// сохраним инф-ию о живой клетке
		gridAliveCells.push(cell);
		renderCells.push(cell);
				
		paintCell(xGridCellStart, yGridCellStart);
		paintCell(xGridCellStart, yGridCellStart);		
	});

	stepBtn.addEventListener("click", makeStep);

	clearBtn.addEventListener("click", function(){
									   	gridAliveCells = [];
									   	createGrid();
									});

	runBtn.addEventListener("click", function () {
										isPause = false;
										run();
									}
							);

	pauseBtn.addEventListener("click", pause);

	// // ********* End Event Listeners ********** //



	// // ********* Module Functions ************* //	

	function refresh() {

		createGrid();	

		// рендерим все живые клетки
		for(let i = 0; i < renderCells.length; ++i) {		
			paintCell(renderCells[i].x, renderCells[i].y);
			paintCell(renderCells[i].x, renderCells[i].y);
		}
	
	}

	function createGrid() {

		let context = cnv.getContext("2d");	

		// after prev call		
		context.clearRect(0, 0, cnv.width, cnv.height);

		context.fillStyle = "white"; // canvas color
		context.fillRect(0, 0, cnv.width, cnv.height);

		context.strokeStyle = "black";	// cell stroke color

		// grid rendering
		let stepVal = 20;	
		for (let posX = 0; posX <= cnv.width; posX += stepVal) {
			context.beginPath();
				context.moveTo(posX, 0);
				context.lineTo(posX, cnv.height);
				context.stroke();
			context.closePath();

		}

		for(let posY = 0; posY <= cnv.height; posY += stepVal) {

			context.beginPath();
				context.moveTo(0, posY);
				context.lineTo(cnv.width, posY);
				context.stroke();
			context.closePath();
		}
	}
	
	function updateLivingCellNeighbours() {

		// обновим инф-ю в клетках и их соседях
		// о живых клетках
		for(let i = 0; i < gridAliveCells.length; ++i) {

			let aliveCell = gridAliveCells[i];				

			// при обновлении клетка меняет своё состояние
			aliveCell.updateNeighbours();	
		}
	}

	// Описание: Вышла ли клетка за границы вселенной
	// Вход: Коорд-ты рожденной клетки
	// Выход: Новые коорд-ты клетки	
	function updateBeyondBoundsCoords(coordX, coordY){

		// граница -- это ширина/высота минус размер клетки
		let boundX = cnv.width - cellSize;
		let boundY = cnv.height - cellSize;

		let isBeyondBoundX = coordX > boundX || coordX < 0;
		let isBeyondBoundY = coordY > boundY || coordY < 0;

		let toroidCoordX = isBeyondBoundX ? 
						   Math.abs(Math.abs(coordX % cnv.width)) : coordX;

		let toroidCoordY = isBeyondBoundY ? 
						   Math.abs(Math.abs(coordY % cnv.height)) : coordY;

		return [].concat(toroidCoordX, toroidCoordY);
	}

	function updateRenderCells() {

		renderCells = [];
		for(let i = 0; i < gridAliveCells.length; ++i) {

			let aliveCellX = gridAliveCells[i].x;
			let aliveCellY = gridAliveCells[i].y;

			let [renderCoordX, renderCoordY] = updateBeyondBoundsCoords(aliveCellX, 
											 							aliveCellY);

			let renderCell = new Cell(renderCoordX, renderCoordY);
			renderCells.push(renderCell);
		}
	}

	function makeStep() {
		
		let nextGen = [];

		updateLivingCellNeighbours();		

		let len = gridAliveCells.length;
		for(let i = 0; i < len; ++i) {			

			let aliveCell = gridAliveCells[i];
			let neighbours = aliveCell.emptyNeighbours;
			let neighboursLen = neighbours.length;

			for(let j = 0; j < neighboursLen; ++j) {
				if (neighbours[j].isAlive && !containsObject(nextGen, neighbours[j])) {

					let cell = new Cell(neighbours[j].x, neighbours[j].y);
					nextGen.push(cell);
				}					
			}

			if (aliveCell.isAlive) {
				let cell = new Cell(aliveCell.x, aliveCell.y);
				nextGen.push(cell);
			}
		}		

		gridAliveCells = nextGen;		

		updateRenderCells();

		console.log(gridAliveCells);

		refresh();
	}

	function pause() {
	
		isPause = !isPause;

		if (!isPause)
			run();
	}

	function run() {

		if (isPause)
			return;

		let prevGen = gridAliveCells.slice();	

		makeStep();

		if ( _.isEqual(gridAliveCells, prevGen) 
			|| gridAliveCells.length === 0){

			console.log("break");
			return;
		}		
	
		setTimeout(run, 200);
	}

	// получить к-ты клика пользователя на сетке
	function getMousePos(evt) {

		let rect = cnv.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

	// раскрасить живую клетку
	function paintCell(xGridCellStart, yGridCellStart) {
		
		let context = cnv.getContext("2d");

		context.strokeStyle = "rgba(135, 0, 0, 1)";
		
		let yGridCellEnd = yGridCellStart + 20;

		while (yGridCellStart < yGridCellEnd) {

			context.beginPath();
				context.moveTo(xGridCellStart, yGridCellStart);
				context.lineTo(xGridCellStart + 20, yGridCellStart);
				context.stroke();
			context.closePath();

			++yGridCellStart;
		}
	}

	// получить к-ты начала клетки (левый верхний угол)
	function getCellCoord(x, y) {

		let factorX = parseInt(x / 20);
		let factorY = parseInt(y / 20);	

		return [factorX * 20, factorY * 20];
	}

	// содержит ли массив объект
	function containsObject(arr, obj) {
		return arr.some(el => el.x === obj.x && el.y === obj.y);	
	}

	// вычитание массивов координат
	function getArrayDistract(minuendArr, subtrahendArr) {		
		return minuendArr.filter( val => !containsObject(subtrahendArr, val) );
	}
	
	// ******************** End of module functions ***********************
}());