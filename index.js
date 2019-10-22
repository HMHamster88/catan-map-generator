
const tileTypes = {
  water: {
    style: "water",
    text: ''
  },
  wheat: {
    style: 'wheat',
    text: 'Wh'
  },
  wood: {
    style: 'wood',
    text: 'Wo'
  },
  lamb: {
    style: 'lamb',
    text: 'L'
  },
  clay: {
    style: 'clay',
    text: 'C'
  },
  ore: {
    style: 'ore',
    text: 'O'
  },
  desert: {
    style: 'desert',
    text: 'D'
  }
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function drawTile(svg,x, y, size, tile) {
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  svg.appendChild(polygon);
  polygon.setAttribute("class", tile.type.style);
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.textContent = tile.type.text;
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("text-anchor", "middle");
  svg.appendChild(text);

  for (let side = 0; side < 7; side++) {
    const angle = side * 2 * Math.PI / 6 + Math.PI / 6;
    const point = svg.createSVGPoint();
    point.x = x + size * Math.cos(angle);
    point.y = y + size * Math.sin(angle);
    polygon.points.appendItem(point);
  }
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
  const tileSize = 40;
  const tileWidth = tileSize * Math.cos(Math.PI / 6) * 2;
  const tileHeight = tileSize * 2;
  const svg = document.getElementById("svg");

  const mapX = 400,
    mapY = tileSize;

  const map = generateMap(mapWidth, mapHeight);

  for (let y = 0; y < mapHeight * 2 - 1; y++) {
    const row = map[y];
    const rowWidth = row.length * tileWidth;
    for (let x = 0; x < row.length; x++) {
      const tile = row[x];
      const tileX = mapX - (rowWidth / 2) + x * tileWidth;
      const tileY  = mapY + y * (tileHeight - (Math.sin(Math.PI / 6) * tileSize));
      drawTile(svg, tileX, tileY, tileSize, tile);
    }
  }
}


document.addEventListener("DOMContentLoaded", ready);
