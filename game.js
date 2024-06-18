// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let gameStarted = false;

let gameOverImage;

// onload game
let onloadImg;

//bird

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdUpImg;
let birdDownImg;
let birdMidImg;
let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottonPipeImg;

//physics
let velocityX = -2; // velocidade que o cano se move a esquerda
let velocityY = 0; // velocidade que o passaro vai pular
let gravity = 0.4;

let gameOver = false;
let score = 0;

//score logic
let scoreImg = [];
for (let i = 0; i < 10; i++) {
  let img = new Image();
  img.src = `./assets/sprites/${i}.png`;
  scoreImg.push(img);
}

//audio
let hitSound;
let wingSound;
let pointSound;

window.onload = function () {
  board = document.getElementById("gameCanvas");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  //load images

  onloadImg = new Image();
  onloadImg.src = "./assets/sprites/message.png";
  onloadImg.onload = function () {
    context.drawImage(
      onloadImg,
      (boardWidth - onloadImg.width) / 2,
      (boardHeight - onloadImg.height) / 2,
      onloadImg.width,
      onloadImg.height
    );
  };

  birdUpImg = new Image();
  birdUpImg.src = "./assets/sprites/redbird-upflap.png";

  birdDownImg = new Image();
  birdDownImg.src = "./assets/sprites/redbird-downflap.png";

  birdMidImg = new Image();
  birdMidImg.src = "./assets/sprites/redbird-midflap.png";

  birdMidImg.onload = function () {
    context.drawImage(birdMidImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "./assets/sprites/toppipe.png";

  bottonPipeImg = new Image();
  bottonPipeImg.src = "./assets/sprites/bottompipe.png";

  gameOverImage = new Image();
  gameOverImage.src = "./assets/sprites/gameover.png";

  //sounds

  hitSound = new Audio("./assets/audios/hit.wav");
  wingSound = new Audio("./assets/audios/wing.wav");
  pointSound = new Audio("./assets/audios/point.wav");
};

window.addEventListener("keydown", () => {
  if (!gameStarted) {
    gameStarted = true;

    startGame();
  }
});

const startGame = () => {
  requestAnimationFrame(update);
  setInterval(placePipes, 1500);
  window.addEventListener("keydown", moveBird);
};

const update = () => {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  //bird
  velocityY += gravity;
  let birdImageToUse;
  if (velocityY < 0) {
    birdImageToUse = birdUpImg;
  } else if (velocityY > 0) {
    birdImageToUse = birdUpImg;
  } else {
    birdImageToUse = birdMidImg;
  }

  bird.y = Math.max(bird.y + velocityY, 0);
  context.drawImage(birdImageToUse, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    gameOver = true;
  }

  //pipe

  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];

    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
      pointSound.play();
    }

    if (detectColision(bird, pipe)) {
      gameOver = true;
    }
  }
  //clear pipe

  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  // score

  drawScore(score);

  if (gameOver) {
    hitSound.play();
    context.drawImage(
      gameOverImage,
      (board.width - gameOverImage.width) / 2,
      (board.height - gameOverImage.height) / 2
    );
  }
};

const placePipes = () => {
  if (gameOver) {
    return;
  }

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };

  pipeArray.push(topPipe);

  let bottonPipe = {
    img: bottonPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };

  pipeArray.push(bottonPipe);
};

const moveBird = () => {
  velocityY = -6;
  if (gameOver) {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
  }
  wingSound.play();
};

const detectColision = (a, b) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

const drawScore = (score) => {
  let scoreStr = score.toString();
  let digitWidth = scoreImg[0].width;
  let digitHeight = scoreImg[0].height;
  let totalWidth = digitWidth * scoreStr.length;

  let startX = (boardWidth - totalWidth) / 2;

  for (let i = 0; i < scoreStr.length; i++) {
    let digit = parseInt(scoreStr[i]);
    let x = startX + i * digitWidth;
    let y = 140;
    context.drawImage(scoreImg[digit], x, y, digitWidth, digitHeight);
  }
};
