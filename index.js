
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
  },
  threeToOne: {
    style: 'water',
    text: '3:1'
  }
};

const settingsList = {
  classic: {
    width: 3,
    height: 3,
    groundTiles: {
      wheat: 4,
      wood: 4,
      lamb: 4,
      clay: 3,
      ore: 3,
      desert: 1
    },
    portTiles: {
      wheat: 1,
      wood: 1,
      lamb: 1,
      clay: 1,
      ore: 1,
      threeToOne: 4
    }
  },
  extended: {
    width: 3,
    height: 4,
    groundTiles: {
      wheat: 6,
      wood: 6,
      lamb: 6,
      clay: 5,
      ore: 5,
      desert: 2
    },
    portTiles: {
      wheat: 1,
      wood: 1,
      lamb: 2,
      clay: 1,
      ore: 1,
      threeToOne: 5
    }
  }
};

let m_w = 123456789;
let m_z = 987654321;
const  mask = 0xffffffff;

function seed(i) {
  m_w = (123456789 + i) & mask;
  m_z = (987654321 - i) & mask;
}

function random()
{
  m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
  m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
  var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
  result /= 4294967296;
  return result;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function createSvgElement(tagName) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

function addTiles(deck, tileType, count) {
  for (let i = 0; i < count; i++) {
    const tile = {
      type: tileType
    };
    deck.push(tile);
  }
}

function addPorts(deck, portType, count) {
  for (let i = 0; i < count; i++) {
    const tile = {
      type: tileTypes.water,
      portType: portType
    };
    deck.push(tile);
  }
}

function range(from, to) {
  const result = [];
  for(let i = from; i <= to; i++) {
    result.push(i);
  }
  return result;
}

function setRange(obj, value, from, to) {
  for(let i of range(from, to)) {
    obj[i] = value;
  }
}

function getPossibleSides(isLeft, isRight, isTop, isBottom, isTopHalf, isBottomHalf) {
  const sides = {};
  setRange(sides, true, 0, 5);
  if (isLeft) {
    if (isTopHalf) {
      setRange(sides, false, 1, 4);
    }
    if (isBottomHalf) {
      setRange(sides, false, 0, 3)
    }
  }
  if (isRight) {
    if (isTopHalf) {
      setRange(sides, false, 3, 5);
      sides[0] = false;
    }
    if (isBottomHalf) {
      setRange(sides, false, 4, 5)
      setRange(sides, false, 0, 1)
    }
  }
  if (isTop) {
    setRange(sides, false, 2, 5);
  }
  if (isBottom) {
    setRange(sides, false, 0, 2);
    sides[5] = 0;
  }
  const result = [];
  for(let key in Object.keys(sides)) {
    if (sides[key]) {
      result.push(key);
    }
  }
  return result;
}

function generateMap(settings) {

  const mapWidth = settings.width + 1;
  const mapHeight = settings.height + 1;
  const deck = [];
  const portDeck = [];

  const portTiles = settings.portTiles;
  Object.keys(portTiles)
    .forEach(tileTypeName => {
      const tilesCount = portTiles[tileTypeName];
      const tileType = tileTypes[tileTypeName];
      addPorts(portDeck, tileType, tilesCount);
    });

  const portsInOdd = random() < 0.5;

  const groundTiles = settings.groundTiles;
  Object.keys(groundTiles)
    .forEach(tileTypeName => {
      const tilesCount = groundTiles[tileTypeName];
      const tileType = tileTypes[tileTypeName];
      addTiles(deck, tileType, tilesCount);
    });

  const map = [];
  let width = mapWidth;
  for (let y = 0; y < mapHeight * 2 - 1; y++) {
    const row = [];
    map[y] = row;
    for (let x = 0; x < width; x++) {
      const isLeft = x === 0;
      const isRight = x === width - 1;
      const isTop = y === 0;
      const isBottom = y === mapHeight * 2 - 2;
      const isWater = isLeft || isRight || isTop || isBottom;
      if (isWater) {
        const isTopHalf = y <= settings.height;
        const isBottomHalf = y >= settings.height;
        const odd = !!((x === 0) ?
          (y % 2 === 0) :
          (x % 2 === 0));

        const tile = (portsInOdd === odd) ?
          portDeck.splice(getRandomInt(0, portDeck.length), 1)[0] :
          {
            type: tileTypes.water
          };
        if (tile.portType) {
          const possibleSides = getPossibleSides(isLeft, isRight, isTop, isBottom, isTopHalf, isBottomHalf);
          tile.portSide = possibleSides[getRandomInt(0, possibleSides.length)];
        }
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

function addPoint(svg, x, y, size, angle, polygon) {
  const point = svg.createSVGPoint();
  point.x = x + size * Math.cos(angle);
  point.y = y + size * Math.sin(angle);
  polygon.points.appendItem(point);
  return point;
}

function drawTile(svg,x, y, size, tile) {
  const polygon = createSvgElement('polygon');
  svg.appendChild(polygon);
  polygon.setAttribute('class', tile.type.style);


  for (let side = 0; side < 7; side++) {
    const angle = side * 2 * Math.PI / 6 + Math.PI / 6;
    addPoint(svg, x, y, size, angle, polygon);
  }

  if (tile.portSide) {
    const sidePolygon = createSvgElement('polygon');
    svg.appendChild(sidePolygon);
    const angle1 = tile.portSide * 2 * Math.PI / 6 + Math.PI / 6;
    const angle2 = angle1 + Math.PI / 3;
    addPoint(svg, x, y, size * 0.9, angle1, sidePolygon);
    addPoint(svg, x, y, size * 0.9, angle2, sidePolygon);
    addPoint(svg, x, y, size * 0.6, angle2, sidePolygon);
    addPoint(svg, x, y, size * 0.6, angle1, sidePolygon);
    sidePolygon.setAttribute('class', tile.portType.style);
  }

  const text = createSvgElement('text');
  text.textContent = tile.portType ? tile.portType.text : tile.type.text;
  text.setAttribute('x', x);
  text.setAttribute('y', y);
  text.setAttribute('text-anchor', 'middle');
  svg.appendChild(text);
}

function drawMap(map, svg) {
  const tileSize = 40;
  const tileWidth = tileSize * Math.cos(Math.PI / 6) * 2;
  const tileHeight = tileSize * 2;
  const mapX = 400;
  const mapY = tileSize;

  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    const rowWidth = row.length * tileWidth;
    for (let x = 0; x < row.length; x++) {
      const tile = row[x];
      const tileX = mapX - (rowWidth / 2) + x * tileWidth;
      const tileY = mapY + y * (tileHeight - (Math.sin(Math.PI / 6) * tileSize));
      drawTile(svg, tileX, tileY, tileSize, tile);
    }
  }
}
function generate() {
  const svg = document.getElementById("svg");
  const type = document.querySelector('input[name="type"]:checked').value;
  const useSeedFromInput = document.getElementById('seedCheckbox').checked;
  const seedNumberInput = document.getElementById('seedNumber');
  const seedValue = useSeedFromInput ? seedNumberInput.value : Math.floor(Math.random() * 0xffffff);
  seed(seedValue);
  seedNumberInput.value = seedValue;
  const settings = settingsList[type];
  const map = generateMap(settings);

  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  drawMap(map, svg);
}

document.addEventListener("DOMContentLoaded", generate);
