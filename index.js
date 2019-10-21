
const tileTypes = {
  water: {
    color: "#007dff",
    text: ''
  },
  wheat: {
    color: "#ffea20",
    text: 'Wh'
  },
  wood: {
    color: "#35c104",
    text: 'Wo'
  },
  lamb: {
    color: "#ffffff",
    text: 'L'
  },
  clay: {
    color: "#9b3e24",
    text: 'C'
  },
  ore: {
    color: "#494949",
    text: 'O'
  },
  desert: {
    color: "#fff99c",
    text: 'D'
  }
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function drawTile(canvas,x, y, size, tile) {
  canvas.beginPath();
  for (let side = 0; side < 7; side++) {
    const angle = side * 2 * Math.PI / 6 + Math.PI / 6;
    canvas.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
  }
  canvas.fillStyle = tile.type.color;
  canvas.strokeStyle = "#373737";
  canvas.fill();
  canvas.stroke();

  canvas.fillStyle = "#000000";
  canvas.textAlign = "center";
  canvas.fillText(tile.type.text, x, y);
}

function addTiles(deck, tileType, count) {
  for (let i = 0; i < count; i++) {
    const tile = {
      type: tileType
    };
    deck.push(tile);
  }
}

function generateMap(mapWidth, mapHeight) {
  const deck = [];
  const waterDeck = [];

  addTiles(waterDeck, tileTypes.water, 22);

  addTiles(deck, tileTypes.wheat, 6);
  addTiles(deck, tileTypes.wood, 6);
  addTiles(deck, tileTypes.lamb, 6);
  addTiles(deck, tileTypes.clay, 4);
  addTiles(deck, tileTypes.ore, 6);
  addTiles(deck, tileTypes.desert, 2);

  console.log("Deck size " + deck.length);

  const map = [];
  let width = mapWidth;
  for (let y = 0; y < mapHeight * 2 - 1; y++) {
    const row = [];
    map[y] = row;
    for (let x = 0; x < width; x++) {
      const isWater = (x === 0 || x === width -1 || y === 0 || y === mapHeight * 2 - 2);
      if (isWater) {
        const tile = waterDeck.splice(getRandomInt(0, waterDeck.length), 1)[0];
        row[x] = tile;
      } else {
        const tile = deck.splice(getRandomInt(0, deck.length), 1)[0];
        row[x] = tile;
      }
    }
    if (y < mapHeight - 1) {
      width++;
    } else {
      width--;
    }
  }
  return map;
}

function ready() {
  const mapWidth = 3 + 1;
  const mapHeight = 4 + 1;
  const tileSize = 20;
  const tileWidth = tileSize * Math.cos(Math.PI / 6) * 2;
  const tileHeight = tileSize * 2;

  const canvas = document.querySelector('#canvas').getContext('2d');

  const mapX = 200,
    mapY = 100;

  const map = generateMap(mapWidth, mapHeight);

  for (let y = 0; y < mapHeight * 2 - 1; y++) {
    const row = map[y];
    const rowWidth = row.length * tileWidth;
    for (let x = 0; x < row.length; x++) {
      const tile = row[x];
      const tileX = mapX - (rowWidth / 2) + x * tileWidth;
      const tileY  = mapY + y * (tileHeight - (Math.sin(Math.PI / 6) * tileSize));
      drawTile(canvas, tileX, tileY, tileSize, tile);
    }
  }
}


document.addEventListener("DOMContentLoaded", ready);
