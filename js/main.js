"use strict";

/* -------------------------------------------------------------------------- */
/*                              Global Variables                              */
/* -------------------------------------------------------------------------- */

var height = 28;
var width = 14;
var nextTermino = false;
var currentShape = [];
var collisionIdx = 0;
var nextLocations = [];
var direction = "";
var gScore = 0;
var gBoard;
var gInterval;

function onInit() {
  gBoard = creatBoard(height, width);
  renderBoard(gBoard);
  clearAll();
  drawNextTermino();
  document.onkeyup = checkKey;
  document.querySelector(".score span").innerHTML = 0;
}

/* -------------------------------------------------------------------------- */
/*                   Clear The Gradient From The Game Board                   */
/* -------------------------------------------------------------------------- */

function clearAll() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j];
      document.querySelector(`.cell${cell.i}-${cell.j}`).style.backgroundColor =
        "white";
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                             Move The Piece Down                            */
/* -------------------------------------------------------------------------- */

function play() {
  direction = "down";
  drawShape();
}

/* -------------------------------------------------------------------------- */
/*                   When Moving Right Or Left, Redraw Shape                  */
/* -------------------------------------------------------------------------- */

function moveRight() {
  direction = "right";
  drawShape();
}
function moveLeft() {
  direction = "left";
  drawShape();
}

/* -------------------------------------------------------------------------- */
/*      Turn Game On Off/Upon Losing Restart Game Board And Button/Timer      */
/* -------------------------------------------------------------------------- */

function toggleGameOn(elCell) {
  if (elCell.innerHTML === "Start Game") {
    elCell.innerHTML = "Stop Game";
    stopwatch.start();
    gInterval = setInterval(play, 100);
    return;
  } else if (elCell.innerHTML === "Restart Game") {
    onInit();
    elCell.innerHTML = "Stop Game";
    stopwatch.reset();
    gScore = 0;
    gInterval = setInterval(play, 100);
  }
  elCell.innerHTML = "Start Game";

  stopwatch.stop();

  clearInterval(gInterval);
}

/* -------------------------------------------------------------------------- */
/*   Draw Next Termino Piece To The Board,Update CurrentCells,nextLocations   */
/* -------------------------------------------------------------------------- */

function drawNextTermino() {
  var randomIndex = randomNumberInRange(1, gBoard[0].length - 2);
  var cells = [];
  nextLocations = [];
  cells.push(gBoard[0][randomIndex]);
  cells.push(gBoard[0][randomIndex - 1]);
  cells.push(gBoard[1][randomIndex]);
  cells.push(gBoard[1][randomIndex - 1]);

  if (cells.some(cell => cell.isLocked)) {
    clearInterval(gInterval);
    stopwatch.stop();
    document.querySelector(".gameBtn").innerHTML = "Restart Game";
    return;
  }
  cells.forEach(cell => {
    document.querySelector(`.cell${cell.i}-${cell.j}`).style.backgroundColor =
      "red";
  });
  currentShape = cells;
  updateNextLocation();
}

/* -------------------------------------------------------------------------- */
/*           If a row is full, Clear the row, update the board/score          */
/* -------------------------------------------------------------------------- */

function clearRow() {
  collisionIdx = 0;
  for (var i = 0; i < gBoard.length; i++) {
    var row = gBoard[i];
    if (row.every(cell => cell.isLocked)) {
      gScore += 50;
      collisionIdx = gBoard.indexOf(row) - 2;
      row.forEach((cell, index) => {
        cell.isLocked = false;
        document.querySelector(
          `.cell${row[index].i}-${row[index].j}`
        ).style.backgroundColor = "white";
      });
    }
  }
  if (gBoard[collisionIdx].some(cell => cell.isLocked)) {
    moveBoardDown();
  }

  document.querySelector(".score span").innerHTML = gScore;
}

/* -------------------------------------------------------------------------- */
/*     If cells above the cleared row are also termino,move them all down     */
/* -------------------------------------------------------------------------- */

function moveBoardDown() {
  updateCellLocation();
  removeAllShapes();
  redrawShapes();
}

function redrawShapes() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j];
      if (cell.isLocked) {
        document.querySelector(
          `.cell${cell.i}-${cell.j}`
        ).style.backgroundColor = "red";
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                          Update The cell Location                          */
/* -------------------------------------------------------------------------- */

function updateCellLocation() {
  var cells = unlockCells();
  debugger;
  for (var i = 0; i < cells.length; i++) {
    gBoard[cells[i].i + 2][cells[i].j].isLocked = true;
  }
}

/* -------------------------------------------------------------------------- */
/*              Return all the Locked Cells, Set them to unlocked             */
/* -------------------------------------------------------------------------- */

function unlockCells() {
  var cellsToModify = [];
  for (var i = 0; i <= collisionIdx; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j];
      if (cell.isLocked) cellsToModify.push(cell);
      cell.isLocked = false;
    }
  }
  return cellsToModify;
}

function removeAllShapes() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      document.querySelector(`.cell${i}-${j}`).style.backgroundColor = "white";
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                             Draw The Next Shape                            */
/* -------------------------------------------------------------------------- */

function drawShape() {
  clearRow();
  updateNextLocation();
  var VerticalCollision = detectCollisionVertical();
  var horizontalCollision = detectHorizontalCollision();
  if (VerticalCollision) {
    currentShape.forEach(cell => (cell.isLocked = true));
    drawNextTermino();
    return;
  }
  if (horizontalCollision) {
    direction = "down";
    return;
  }
  clearCurrent();
  if (direction === "right") {
    nextLocations.forEach(
      location =>
        (document.querySelector(
          `.cell${location[0]}-${location[1]}`
        ).style.backgroundColor = "red")
    );
  } else if (direction === "left") {
    nextLocations.forEach(
      location =>
        (document.querySelector(
          `.cell${location[0]}-${location[1]}`
        ).style.backgroundColor = "red")
    );
  } else if (direction === "down") {
    nextLocations.forEach(
      location =>
        (document.querySelector(
          `.cell${location[0]}-${location[1]}`
        ).style.backgroundColor = "red")
    );
  }
  currentShape = nextLocations.map(
    location => gBoard[location[0]][location[1]]
  );
}

/* -------------------------------------------------------------------------- */
/*                    Check If Vertical Collision Happened                    */
/* -------------------------------------------------------------------------- */

function detectCollisionVertical() {
  var collision = false;
  if (direction === "down") {
    if (nextLocations.some(location => location[0] > gBoard.length - 1)) {
      return (collision = true);
    }
    if (
      nextLocations.some(location => gBoard[location[0]][location[1]].isLocked)
    ) {
      collision = true;
    }
  }
  return collision;
}

/* -------------------------------------------------------------------------- */
/*                    Check If Horizontal Collision Happened                    */
/* -------------------------------------------------------------------------- */

function detectHorizontalCollision() {
  var collision = false;
  if (direction === "right" || direction === "left") {
    if (
      nextLocations.some(cell => cell[1] >= gBoard[0].length) ||
      nextLocations.some(cell => cell[1] < 0)
    ) {
      collision = true;
    } else if (
      nextLocations.some(location => gBoard[location[0]][location[1]].isLocked)
    ) {
      collision = true;
      direction = "down";
    }
  }
  return collision;
}

/* -------------------------------------------------------------------------- */
/*                    Clear the current Shape from the DOM                    */
/* -------------------------------------------------------------------------- */

function clearCurrent() {
  currentShape.forEach(cell => {
    document.querySelector(`.cell${cell.i}-${cell.j}`).style.backgroundColor =
      "white";
  });
}

/* -------------------------------------------------------------------------- */
/*   Move The Piece By Keyboard Stroke,Update The next Cells,Redraw Shape     */
/* -------------------------------------------------------------------------- */

function checkKey(e) {
  e.preventDefault();
  e = e || window.event;
  if (e.keyCode === 40) {
    direction = "down";
  } else if (e.keyCode === 37) {
    direction = "left";
  }
  if (e.keyCode === 39) {
    // right arrow
    direction = "right";
  } else if (e.keyCode === 38) {
    direction = "down";
  }
  drawShape();
}

/* -------------------------------------------------------------------------- */
/*                   Update nextLocations based on direction                  */
/* -------------------------------------------------------------------------- */

function updateNextLocation() {
  if (direction === "down") {
    nextLocations = currentShape.map(cell => {
      var arr = [cell.i + 1, cell.j];
      return arr;
    });
  } else if (direction === "left") {
    nextLocations = currentShape.map(cell => {
      var arr = [cell.i, cell.j - 1];
      return arr;
    });
  }
  if (direction === "right") {
    // right arrow
    nextLocations = currentShape.map(cell => {
      var arr = [cell.i, cell.j + 1];
      return arr;
    });
  } else if (direction === "up") {
    return;
  }
}

const randomNumberInRange = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

/* -------------------------------------------------------------------------- */
/*                     Board creating and rendering                    */
/* -------------------------------------------------------------------------- */

function renderBoard(board) {
  var strHtml = "<table><tBody>";
  for (var i = 0; i < board.length; i++) {
    strHtml += "<tr>";
    for (var j = 0; j < board[i].length; j++) {
      strHtml += `<td class="cell${i}-${j}" onkeyup="moveBlocks(event,this,i,j)"> </td> `;
    }
    strHtml += "</tr>";
  }
  strHtml += "</tBody></table>";
  document.querySelector(".container").innerHTML = strHtml;
}

function creatBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size / 2; j++) {
      board[i][j] = creatCell(i, j);
    }
  }

  console.log(board);

  return board;
}

function creatCell(i, j) {
  return {
    isLocked: false,
    i: i,
    j: j
  };
}
