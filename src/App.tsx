import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// --- Constants ---
const minTileIndex = -8;
const maxTileIndex = 8;
const tilesPerRow = maxTileIndex - minTileIndex + 1;
const tileSize = 42;

// --- Helper Functions ---

function createCamera() {
  const size = 300;
  const viewRatio = window.innerWidth / window.innerHeight;
  const width = viewRatio < 1 ? size : size * viewRatio;
  const height = viewRatio < 1 ? size / viewRatio : size;

  const camera = new THREE.OrthographicCamera(
    width / -2, // left
    width / 2, // right
    height / 2, // top
    height / -2, // bottom
    100, // near
    900 // far
  );

  camera.up.set(0, 0, 1);
  camera.position.set(300, -300, 300);
  camera.lookAt(0, 0, 0);

  return camera;
}

function createTexture(width: number, height: number, rects: { x: number, y: number, w: number, h: number }[]) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(0,0,0,0.6)";
  rects.forEach((rect) => {
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  return new THREE.CanvasTexture(canvas);
}

const carFrontTexture = createTexture(40, 80, [{ x: 0, y: 10, w: 30, h: 60 }]);
const carBackTexture = createTexture(40, 80, [{ x: 10, y: 10, w: 30, h: 60 }]);
const carRightSideTexture = createTexture(110, 40, [
  { x: 10, y: 0, w: 50, h: 30 },
  { x: 70, y: 0, w: 30, h: 30 },
]);
const carLeftSideTexture = createTexture(110, 40, [
  { x: 10, y: 10, w: 50, h: 30 },
  { x: 70, y: 10, w: 30, h: 30 },
]);

const truckFrontTexture = createTexture(30, 30, [
  { x: 5, y: 0, w: 10, h: 30 },
]);
const truckRightSideTexture = createTexture(25, 30, [
  { x: 15, y: 5, w: 10, h: 10 },
]);
const truckLeftSideTexture = createTexture(25, 30, [
  { x: 15, y: 15, w: 10, h: 10 },
]);

function Wheel(x: number) {
  const wheel = new THREE.Mesh(
    new THREE.BoxGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({
      color: 0x333333,
      flatShading: true,
    })
  );
  wheel.position.x = x;
  wheel.position.z = 6;
  return wheel;
}

function Car(initialTileIndex: number, direction: boolean, color: number | string) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * tileSize;
  if (!direction) car.rotation.z = Math.PI;

  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(33, 24, 12), [
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carBackTexture,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carFrontTexture,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carRightSideTexture,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      flatShading: true,
      map: carLeftSideTexture,
    }),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // top
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // bottom
  ]);
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  const frontWheel = Wheel(18);
  car.add(frontWheel);

  const backWheel = Wheel(-18);
  car.add(backWheel);

  return car;
}

function Truck(initialTileIndex: number, direction: boolean, color: number | string) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * tileSize;
  if (!direction) truck.rotation.z = Math.PI;

  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(70, 35, 35),
    new THREE.MeshLambertMaterial({
      color: 0xb4c6fc,
      flatShading: true,
    })
  );
  cargo.position.x = -15;
  cargo.position.z = 25;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), [
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      map: truckFrontTexture,
    }), // front
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
    }), // back
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      map: truckLeftSideTexture,
    }),
    new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      map: truckRightSideTexture,
    }),
    new THREE.MeshPhongMaterial({ color, flatShading: true }), // top
    new THREE.MeshPhongMaterial({ color, flatShading: true }), // bottom
  ]);
  cabin.position.x = 35;
  cabin.position.z = 20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;

  truck.add(cabin);

  const frontWheel = Wheel(37);
  truck.add(frontWheel);

  const middleWheel = Wheel(5);
  truck.add(middleWheel);

  const backWheel = Wheel(-35);
  truck.add(backWheel);

  return truck;
}

function Tree(tileIndex: number, height: number, isFruitTree: boolean = false) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * tileSize;

  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 20),
    new THREE.MeshLambertMaterial({
      color: 0x4d2926,
      flatShading: true,
    })
  );
  trunk.position.z = 10;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  const crownColor = isFruitTree ? 0x2d5a27 : 0x7aa21d;
  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(12, 1),
    new THREE.MeshLambertMaterial({
      color: crownColor,
      flatShading: true,
    })
  );
  crown.position.z = 30;
  crown.castShadow = true;
  crown.receiveShadow = true;
  tree.add(crown);

  if (isFruitTree) {
    // Add fruits
    const fruitColors = [0xff0000, 0xffa500, 0xffff00]; // Red, Orange, Yellow
    const fruitColor = randomElement(fruitColors);
    for (let i = 0; i < 5; i++) {
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(3, 8, 8),
        new THREE.MeshLambertMaterial({ color: fruitColor })
      );
      fruit.position.x = (Math.random() - 0.5) * 25;
      fruit.position.y = (Math.random() - 0.5) * 25;
      fruit.position.z = 25 + Math.random() * 15;
      tree.add(fruit);
    }
  }

  return tree;
}

function MaizeStalk(tileIndex: number) {
  const stalk = new THREE.Group();
  stalk.position.x = tileIndex * tileSize;

  // Main stalk
  const stem = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 40),
    new THREE.MeshLambertMaterial({ color: 0x8ab33a, flatShading: true })
  );
  stem.position.z = 20;
  stem.castShadow = true;
  stem.receiveShadow = true;
  stalk.add(stem);

  // Leaves
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(15, 2, 8),
      new THREE.MeshLambertMaterial({ color: 0x7aa21d, flatShading: true })
    );
    leaf.position.z = 15 + i * 8;
    leaf.rotation.y = (Math.random() - 0.5) * 0.5;
    leaf.rotation.z = (i * Math.PI) / 2;
    stalk.add(leaf);
  }

  // Cob
  const cob = new THREE.Mesh(
    new THREE.CapsuleGeometry(3, 8, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0xffd700, flatShading: true })
  );
  cob.position.z = 25;
  cob.position.x = 4;
  cob.rotation.y = 0.3;
  stalk.add(cob);

  return stalk;
}

function SpinachPatch(tileIndex: number) {
  const patch = new THREE.Group();
  patch.position.x = tileIndex * tileSize;

  // Cluster of leaves
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8, 0),
      new THREE.MeshLambertMaterial({ color: 0x2e5a1c, flatShading: true })
    );
    leaf.position.x = (Math.random() - 0.5) * 15;
    leaf.position.y = (Math.random() - 0.5) * 15;
    leaf.position.z = 12 + Math.random() * 5;
    leaf.scale.set(1, 1, 0.4);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    patch.add(leaf);
  }

  return patch;
}

function Garden(rowIndex: number, type: "fruit" | "maize" | "spinach") {
  const garden = Grass(rowIndex);
  
  // Adjust grass color based on garden type
  let grassColor = 0x96e33b; // Default vibrant green
  if (type === "maize") grassColor = 0xa8d14a; // Slightly more yellowish
  if (type === "spinach") grassColor = 0x82c433; // Slightly darker

  garden.children.forEach((child: any) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
      if (child.material.color.getHex() === 0xbaf455) {
        child.material.color.setHex(grassColor);
      }
    }
  });

  // Add decorative elements
  const itemCount = type === "fruit" ? 25 : 15;
  for (let i = 0; i < itemCount; i++) {
    const isFruit = type === "fruit" && Math.random() > 0.6;
    const color = isFruit 
      ? randomElement([0xff0000, 0xffa500, 0xffff00]) 
      : randomElement([0xffffff, 0xff69b4, 0xba55d3]); // White, Pink, Purple flowers
    
    const size = isFruit ? 3 : 2;
    const geometry = isFruit 
      ? new THREE.SphereGeometry(size, 6, 6)
      : new THREE.BoxGeometry(size, size, size);

    const item = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color, flatShading: true })
    );
    item.position.x = (Math.random() - 0.5) * tilesPerRow * tileSize;
    item.position.y = (Math.random() - 0.5) * tileSize;
    item.position.z = isFruit ? 11.5 : 11;
    garden.add(item);
  }
  return garden;
}

function Grass(rowIndex: number) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * tileSize;

  const createSection = (color: number | string) =>
    new THREE.Mesh(
      new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 10),
      new THREE.MeshLambertMaterial({ color, flatShading: true })
    );

  const middle = createSection(0xbaf455);
  middle.position.z = 5;
  middle.receiveShadow = true;
  grass.add(middle);

  // Add some grass tufts for texture
  for (let i = 0; i < 10; i++) {
    const tuft = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 4),
      new THREE.MeshLambertMaterial({ color: 0x99c846, flatShading: true })
    );
    tuft.position.x = (Math.random() - 0.5) * tilesPerRow * tileSize;
    tuft.position.y = (Math.random() - 0.5) * tileSize;
    tuft.position.z = 12;
    grass.add(tuft);
  }

  const left = createSection(0x99c846);
  left.position.x = -tilesPerRow * tileSize;
  left.position.z = 5;
  grass.add(left);

  const right = createSection(0x99c846);
  right.position.x = tilesPerRow * tileSize;
  right.position.z = 5;
  grass.add(right);

  // Add bridge walls to grass too for continuity
  const bridge = Bridge(rowIndex);
  grass.add(bridge);

  return grass;
}

function Road(rowIndex: number, linePosition: "top" | "center" | "none" = "top") {
  const road = new THREE.Group();
  road.position.y = rowIndex * tileSize;

  const createSection = (color: number | string) =>
    new THREE.Mesh(
      new THREE.PlaneGeometry(tilesPerRow * tileSize, tileSize),
      new THREE.MeshLambertMaterial({ color })
    );

  const middle = createSection(0x454a59);
  middle.receiveShadow = true;
  road.add(middle);

  // Add white dashed lines
  if (linePosition !== "none") {
    const lineGeometry = new THREE.PlaneGeometry(15, 2);
    const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (let i = -8; i <= 8; i++) {
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.x = i * tileSize;
      line.position.y = linePosition === "top" ? tileSize / 2 - 1 : 0;
      line.position.z = 0.1;
      road.add(line);
    }
  }

  const left = createSection(0x333333);
  left.position.x = -tilesPerRow * tileSize;
  road.add(left);

  const right = createSection(0x333333);
  right.position.x = tilesPerRow * tileSize;
  road.add(right);

  // Add bridge walls
  const bridge = Bridge(rowIndex);
  road.add(bridge);

  return road;
}

function Bridge(rowIndex: number) {
  const bridge = new THREE.Group();

  const bridgeMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
  
  // Left Bridge Wall
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(tileSize * 3, tileSize, 80),
    bridgeMaterial
  );
  leftWall.position.x = -tilesPerRow * tileSize / 2 - tileSize * 2;
  leftWall.position.z = 40;
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  bridge.add(leftWall);

  // Right Bridge Wall
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(tileSize * 3, tileSize, 80),
    bridgeMaterial
  );
  rightWall.position.x = tilesPerRow * tileSize / 2 + tileSize * 2;
  rightWall.position.z = 40;
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  bridge.add(rightWall);

  // Tunnel roof overhang
  const roofGeometry = new THREE.BoxGeometry(tileSize * 3, tileSize, 15);
  
  const leftRoof = new THREE.Mesh(roofGeometry, bridgeMaterial);
  leftRoof.position.x = -tilesPerRow * tileSize / 2 - tileSize * 2;
  leftRoof.position.z = 80;
  bridge.add(leftRoof);

  const rightRoof = new THREE.Mesh(roofGeometry, bridgeMaterial);
  rightRoof.position.x = tilesPerRow * tileSize / 2 + tileSize * 2;
  rightRoof.position.z = 80;
  bridge.add(rightRoof);

  // Bridge pillar/detail
  const pillarGeometry = new THREE.BoxGeometry(4, tileSize, 80);
  const leftPillar = new THREE.Mesh(pillarGeometry, bridgeMaterial);
  leftPillar.position.x = -tilesPerRow * tileSize / 2 - tileSize * 0.5;
  leftPillar.position.z = 40;
  bridge.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeometry, bridgeMaterial);
  rightPillar.position.x = tilesPerRow * tileSize / 2 + tileSize * 0.5;
  rightPillar.position.z = 40;
  bridge.add(rightPillar);

  return bridge;
}

function Player() {
  const player = new THREE.Group();

  // Main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 15),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  body.position.z = 12;
  body.castShadow = true;
  body.receiveShadow = true;
  player.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(12, 12, 12),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  head.position.z = 24;
  head.position.y = 2;
  head.castShadow = true;
  head.receiveShadow = true;
  player.add(head);

  // Comb (Cap)
  const comb = new THREE.Mesh(
    new THREE.BoxGeometry(2, 6, 4),
    new THREE.MeshLambertMaterial({
      color: 0xf0619a,
      flatShading: true,
    })
  );
  comb.position.z = 32;
  comb.position.y = 2;
  comb.castShadow = true;
  comb.receiveShadow = true;
  player.add(comb);

  // Beak
  const beak = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 4),
    new THREE.MeshLambertMaterial({ color: 0xffa500 })
  );
  beak.position.y = 9;
  beak.position.z = 22;
  player.add(beak);

  // Wings
  const wingGeometry = new THREE.BoxGeometry(3, 8, 8);
  const wingMaterial = new THREE.MeshLambertMaterial({ color: "white", flatShading: true });
  
  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.position.x = -9;
  leftWing.position.z = 12;
  player.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.position.x = 9;
  rightWing.position.z = 12;
  player.add(rightWing);

  // Legs
  const legGeometry = new THREE.BoxGeometry(2, 2, 6);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0xffa500 });

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.x = -4;
  leftLeg.position.z = 3;
  player.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.x = 4;
  rightLeg.position.z = 3;
  player.add(rightLeg);

  // Eyes
  const eyeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.x = -4;
  leftEye.position.y = 8;
  leftEye.position.z = 26;
  player.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.x = 4;
  rightEye.position.y = 8;
  rightEye.position.z = 26;
  player.add(rightEye);

  const playerContainer = new THREE.Group();
  playerContainer.add(player);

  return playerContainer;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateForesMetadata() {
  const occupiedTiles = new Set();
  const trees = Array.from({ length: 4 }, () => {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);

    const height = randomElement([20, 45, 60]);

    return { tileIndex, height };
  });

  return { type: "forest", trees };
}

function generateCarLaneMetadata(rowIndex: number, linePosition: "top" | "center" | "none" = "center") {
  const direction = randomElement([true, false]);
  // Gradual speed increase: base speed increases with rowIndex
  const speed = randomElement([80, 100, 120]) + (rowIndex * 2);

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: 3 }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);

    const color = randomElement([
      0xef4444, // Red
      0x22c55e, // Green
      0xeab308, // Yellow
      0xf97316, // Orange
      0x3b82f6, // Blue
    ]);

    return { initialTileIndex, color, ref: null as THREE.Group | null };
  });

  return { type: "car", direction, speed, vehicles, linePosition };
}

function generateTruckLaneMetadata(rowIndex: number, linePosition: "top" | "center" | "none" = "center") {
  const direction = randomElement([true, false]);
  // Gradual speed increase
  const speed = randomElement([80, 100, 120]) + (rowIndex * 2);

  const occupiedTiles = new Set();

  const vehicles = Array.from({ length: 2 }, () => {
    let initialTileIndex;
    do {
      initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 2);
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);
    occupiedTiles.add(initialTileIndex + 2);

    const color = randomElement([
      0xef4444, // Red
      0x22c55e, // Green
      0xeab308, // Yellow
      0xf97316, // Orange
      0x3b82f6, // Blue
    ]);

    return { initialTileIndex, color, ref: null as THREE.Group | null };
  });

  return { type: "truck", direction, speed, vehicles, linePosition };
}

function generateRow(rowIndex: number) {
  const type = randomElement(["car", "truck", "forest"]);
  if (type === "car") return generateCarLaneMetadata(rowIndex, "center");
  if (type === "truck") return generateTruckLaneMetadata(rowIndex, "center");
  return generateForesMetadata();
}

function generateGardenMetadata(lap: number) {
  const gardenTypeIdx = lap % 3;
  const gardenTypes: ("fruit" | "maize" | "spinach")[] = ["fruit", "maize", "spinach"];
  const gardenType = gardenTypes[gardenTypeIdx];
  
  const obstacles = [];
  const occupiedTiles = new Set();

  const obstacleCount = gardenType === "fruit" ? 6 : 8; // More obstacles in maize/spinach

  for (let i = 0; i < obstacleCount; i++) {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);
    
    if (gardenType === "fruit") {
      obstacles.push({ tileIndex, height: THREE.MathUtils.randInt(40, 60), isFruitTree: true });
    } else {
      obstacles.push({ tileIndex });
    }
  }

  return { type: "garden", gardenType, obstacles };
}

function generateLevelCycle(startRowIndex: number, lap: number) {
  const rows = [];
  let currentIdx = startRowIndex;

  const speedBoost = lap * 40; // Increase speed per lap

  // 1. Starting Grass (2 rows)
  for (let i = 0; i < 2; i++) {
    rows.push(generateForesMetadata());
    currentIdx++;
  }

  // 2. Road 1: One lane (1 row)
  rows.push(generateCarLaneMetadata(currentIdx, "center"));
  rows[rows.length - 1].speed += speedBoost;
  currentIdx++;

  // 3. Grass Divider (2 rows)
  for (let i = 0; i < 2; i++) {
    rows.push(generateForesMetadata());
    currentIdx++;
  }

  // 4. Road 2: Two lanes (2 rows)
  rows.push(generateCarLaneMetadata(currentIdx, "top"));
  rows[rows.length - 1].speed += speedBoost;
  currentIdx++;
  rows.push(generateTruckLaneMetadata(currentIdx, "none"));
  rows[rows.length - 1].speed += speedBoost;
  currentIdx++;

  // 5. Grass Divider (2 rows)
  for (let i = 0; i < 2; i++) {
    rows.push(generateForesMetadata());
    currentIdx++;
  }

  // 6. Road 3: Four lanes (Highway) (4 rows)
  const highwayBaseSpeed = 160 + speedBoost;
  for (let i = 0; i < 4; i++) {
    const linePos = i === 3 ? "none" : "top";
    const lane = i % 2 === 0 ? generateCarLaneMetadata(currentIdx, linePos) : generateTruckLaneMetadata(currentIdx, linePos);
    lane.speed = highwayBaseSpeed + (i * 15); 
    rows.push(lane);
    currentIdx++;
  }

  // 7. Garden Section (7 rows total: 1 buffer + 5 garden + 1 buffer)
  rows.push(generateForesMetadata()); // Buffer
  currentIdx++;
  for (let i = 0; i < 5; i++) {
    rows.push(generateGardenMetadata(lap));
    currentIdx++;
  }
  rows.push(generateForesMetadata()); // Buffer
  currentIdx++;

  return rows;
}

function generateRows(amount: number, startRowIndex: number) {
  const rows = [];
  let currentIdx = startRowIndex;
  
  while (rows.length < amount) {
    const lap = Math.floor(currentIdx / 20); // Approximate lap length
    const cycle = generateLevelCycle(currentIdx, lap);
    rows.push(...cycle);
    currentIdx += cycle.length;
  }
  
  return rows.slice(0, amount);
}

// --- Main Component ---

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game State Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const mapRef = useRef<THREE.Group | null>(null);
  const metadataRef = useRef<any[]>([]);
  const positionRef = useRef({ currentRow: 0, currentTile: 0 });
  const movesQueueRef = useRef<string[]>([]);
  const clockRef = useRef(new THREE.Clock());
  const moveClockRef = useRef(new THREE.Clock(false));
  const frameIdRef = useRef<number>(0);

  const endsUpInValidPosition = (currentPosition: { rowIndex: number, tileIndex: number }, moves: string[]) => {
    const finalPosition = moves.reduce((pos, direction) => {
      if (direction === "forward") return { rowIndex: pos.rowIndex + 1, tileIndex: pos.tileIndex };
      if (direction === "backward") return { rowIndex: pos.rowIndex - 1, tileIndex: pos.tileIndex };
      if (direction === "left") return { rowIndex: pos.rowIndex, tileIndex: pos.tileIndex - 1 };
      if (direction === "right") return { rowIndex: pos.rowIndex, tileIndex: pos.tileIndex + 1 };
      return pos;
    }, currentPosition);

    if (finalPosition.rowIndex === -1 || finalPosition.tileIndex === minTileIndex - 1 || finalPosition.tileIndex === maxTileIndex + 1) {
      return false;
    }

    const finalRow = metadataRef.current[finalPosition.rowIndex - 1];
    if (finalRow && (finalRow.type === "forest" || finalRow.type === "garden")) {
      const obstacles = finalRow.type === "forest" ? finalRow.trees : finalRow.obstacles;
      if (obstacles.some((obs: any) => obs.tileIndex === finalPosition.tileIndex)) {
        return false;
      }
    }

    return true;
  };

  const queueMove = (direction: string) => {
    console.log("Queueing move:", direction);
    if (gameOver) return;
    const isValidMove = endsUpInValidPosition(
      { rowIndex: positionRef.current.currentRow, tileIndex: positionRef.current.currentTile },
      [...movesQueueRef.current, direction]
    );
    if (!isValidMove) return;
    movesQueueRef.current.push(direction);
  };

  const renderRow = (rowData: any, rowIndex: number) => {
    if (rowData.type === "forest" || rowData.type === "garden") {
      const row = rowData.type === "garden" ? Garden(rowIndex, rowData.gardenType) : Grass(rowIndex);
      const items = rowData.type === "forest" ? rowData.trees : rowData.obstacles;
      
      items.forEach((itemData: any) => {
        let item;
        if (rowData.type === "forest") {
          item = Tree(itemData.tileIndex, itemData.height);
        } else if (rowData.gardenType === "fruit") {
          item = Tree(itemData.tileIndex, itemData.height, true);
        } else if (rowData.gardenType === "maize") {
          item = MaizeStalk(itemData.tileIndex);
        } else {
          item = SpinachPatch(itemData.tileIndex);
        }
        row.add(item);
      });
      mapRef.current?.add(row);
    } else if (rowData.type === "car") {
      const row = Road(rowIndex, rowData.linePosition);
      rowData.vehicles.forEach((vehicle: any) => {
        const car = Car(vehicle.initialTileIndex, rowData.direction, vehicle.color);
        vehicle.ref = car;
        row.add(car);
      });
      mapRef.current?.add(row);
    } else if (rowData.type === "truck") {
      const row = Road(rowIndex, rowData.linePosition);
      rowData.vehicles.forEach((vehicle: any) => {
        const truck = Truck(vehicle.initialTileIndex, rowData.direction, vehicle.color);
        vehicle.ref = truck;
        row.add(truck);
      });
      mapRef.current?.add(row);
    }
  };

  const addRows = () => {
    const startIndex = metadataRef.current.length;
    const newMetadata = generateRows(20, startIndex + 1);
    metadataRef.current.push(...newMetadata);

    newMetadata.forEach((rowData, index) => {
      const rowIndex = startIndex + index + 1;
      renderRow(rowData, rowIndex);
    });
  };

  const initializeGame = () => {
    // Reset Player
    if (playerRef.current) {
      playerRef.current.position.x = 0;
      playerRef.current.position.y = 0;
      playerRef.current.children[0].position.z = 0;
      playerRef.current.children[0].rotation.z = 0;
    }
    positionRef.current = { currentRow: 0, currentTile: 0 };
    movesQueueRef.current = [];
    setScore(0);
    setGameOver(false);

    // Reset Map
    if (mapRef.current) {
      mapRef.current.clear();
      metadataRef.current = [];
      for (let rowIndex = 0; rowIndex > -10; rowIndex--) {
        const grass = Grass(rowIndex);
        mapRef.current.add(grass);
      }
      
      // Initial Level Structure
      const levelMetadata = generateRows(40, 1);
      metadataRef.current.push(...levelMetadata);
      levelMetadata.forEach((rowData, index) => {
        const rowIndex = index + 1;
        renderRow(rowData, rowIndex);
      });
    }
  };

  const animate = () => {
    const delta = clockRef.current.getDelta();

    // Animate Vehicles
    metadataRef.current.forEach((rowData) => {
      if (rowData.type === "car" || rowData.type === "truck") {
        const beginningOfRow = (minTileIndex - 2) * tileSize;
        const endOfRow = (maxTileIndex + 2) * tileSize;
        rowData.vehicles.forEach(({ ref }: any) => {
          if (!ref) return;
          if (rowData.direction) {
            ref.position.x = ref.position.x > endOfRow ? beginningOfRow : ref.position.x + rowData.speed * delta;
          } else {
            ref.position.x = ref.position.x < beginningOfRow ? endOfRow : ref.position.x - rowData.speed * delta;
          }
        });
      }
    });

    // Animate Player
    if (movesQueueRef.current.length) {
      if (!moveClockRef.current.running) moveClockRef.current.start();
      const stepTime = 0.2;
      const progress = Math.min(1, moveClockRef.current.getElapsedTime() / stepTime);

      const startX = positionRef.current.currentTile * tileSize;
      const startY = positionRef.current.currentRow * tileSize;
      let endX = startX;
      let endY = startY;

      if (movesQueueRef.current[0] === "left") endX -= tileSize;
      if (movesQueueRef.current[0] === "right") endX += tileSize;
      if (movesQueueRef.current[0] === "forward") endY += tileSize;
      if (movesQueueRef.current[0] === "backward") endY -= tileSize;

      if (playerRef.current) {
        playerRef.current.position.x = THREE.MathUtils.lerp(startX, endX, progress);
        playerRef.current.position.y = THREE.MathUtils.lerp(startY, endY, progress);
        playerRef.current.children[0].position.z = Math.sin(progress * Math.PI) * 8;

        let endRotation = 0;
        if (movesQueueRef.current[0] === "forward") endRotation = 0;
        if (movesQueueRef.current[0] === "left") endRotation = Math.PI / 2;
        if (movesQueueRef.current[0] === "right") endRotation = -Math.PI / 2;
        if (movesQueueRef.current[0] === "backward") endRotation = Math.PI;
        playerRef.current.children[0].rotation.z = THREE.MathUtils.lerp(playerRef.current.children[0].rotation.z, endRotation, progress);
      }

      if (progress >= 1) {
        const direction = movesQueueRef.current.shift();
        if (direction === "forward") positionRef.current.currentRow += 1;
        if (direction === "backward") positionRef.current.currentRow -= 1;
        if (direction === "left") positionRef.current.currentTile -= 1;
        if (direction === "right") positionRef.current.currentTile += 1;

        if (positionRef.current.currentRow > metadataRef.current.length - 10) addRows();
        setScore(positionRef.current.currentRow);
        setHighScore(prev => Math.max(prev, positionRef.current.currentRow));
        moveClockRef.current.stop();
      }
    }

    // Hit Test
    const row = metadataRef.current[positionRef.current.currentRow - 1];
    if (row && (row.type === "car" || row.type === "truck")) {
      const playerBoundingBox = new THREE.Box3().setFromObject(playerRef.current!);
      row.vehicles.forEach(({ ref }: any) => {
        if (!ref) return;
        const vehicleBoundingBox = new THREE.Box3().setFromObject(ref);
        if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
          setGameOver(true);
        }
      });
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current && playerRef.current) {
      // Update camera position to follow player
      // Offset the lookAt target ahead of the player to bring the road "down" to the middle
      const cameraOffset = 300;
      const lookAheadOffset = 80; 
      
      cameraRef.current.position.x = playerRef.current.position.x + cameraOffset;
      cameraRef.current.position.y = playerRef.current.position.y - cameraOffset;
      cameraRef.current.lookAt(playerRef.current.position.x, playerRef.current.position.y + lookAheadOffset, 0);

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    frameIdRef.current = requestAnimationFrame(animate);
  };

  // Stable ref for keyboard handler to avoid stale closures
  const queueMoveRef = useRef(queueMove);
  queueMoveRef.current = queueMove;

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setError(e.message);
      console.error("Runtime error:", e.error);
    };
    window.addEventListener('error', handleError);

    console.log("App useEffect running");
    if (!canvasRef.current) {
      console.error("Canvas ref is null");
      return;
    }

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Player
    const player = Player();
    playerRef.current = player;
    scene.add(player);

    // Map
    const map = new THREE.Group();
    mapRef.current = map;
    scene.add(map);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(-100, -100, 200);
    dirLight.up.set(0, 0, 1);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -400;
    dirLight.shadow.camera.right = 400;
    dirLight.shadow.camera.top = 400;
    dirLight.shadow.camera.bottom = -400;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 400;
    scene.add(dirLight);

    // Camera
    const camera = createCamera();
    cameraRef.current = camera;
    scene.add(camera);

    // Renderer
    console.log("Initializing renderer");
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: canvasRef.current!,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    initializeGame();
    console.log("Game initialized, starting animation");
    frameIdRef.current = requestAnimationFrame(animate);

    // Ensure window has focus for keyboard events
    window.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === "ArrowUp" || key === "w" || key === "W") { e.preventDefault(); queueMoveRef.current("forward"); }
      else if (key === "ArrowDown" || key === "s" || key === "S") { e.preventDefault(); queueMoveRef.current("backward"); }
      else if (key === "ArrowLeft" || key === "a" || key === "A") { e.preventDefault(); queueMoveRef.current("left"); }
      else if (key === "ArrowRight" || key === "d" || key === "D") { e.preventDefault(); queueMoveRef.current("right"); }
    };
    window.addEventListener("keydown", handleKeyDown);

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        const size = 300;
        const viewRatio = window.innerWidth / window.innerHeight;
        const width = viewRatio < 1 ? size : size * viewRatio;
        const height = viewRatio < 1 ? size / viewRatio : size;
        cameraRef.current.left = width / -2;
        cameraRef.current.right = width / 2;
        cameraRef.current.top = height / 2;
        cameraRef.current.bottom = height / -2;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    const handleWindowClick = () => {
      window.focus();
    };
    window.addEventListener("click", handleWindowClick);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  useEffect(() => {
    window.focus();
    const container = document.querySelector('.fixed.inset-0');
    if (container instanceof HTMLElement) container.focus();
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden bg-slate-900 flex items-center justify-center outline-none"
      tabIndex={0}
      autoFocus
    >
      {error && (
        <div className="absolute inset-0 z-[5000] bg-red-900 text-white p-10 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Runtime Error Detected</h1>
          <pre className="bg-black/50 p-4 rounded">{error}</pre>
          <button onClick={() => window.location.reload()} className="mt-4 bg-white text-black px-4 py-2 rounded">Reload Page</button>
        </div>
      )}
      <canvas ref={canvasRef} className="game w-full h-full block" />
      
      <div id="controls" className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none w-full">
        <div className="grid grid-cols-3 gap-2 pointer-events-auto">
          <button id="forward" className="col-span-3 w-full h-10 bg-white border border-gray-300 shadow-[3px_5px_0px_0px_rgba(0,0,0,0.75)] cursor-pointer text-xl flex items-center justify-center" onClick={() => queueMove("forward")}>▲</button>
          <button id="left" className="w-12 h-10 bg-white border border-gray-300 shadow-[3px_5px_0px_0px_rgba(0,0,0,0.75)] cursor-pointer text-xl flex items-center justify-center" onClick={() => queueMove("left")}>◀</button>
          <button id="backward" className="w-12 h-10 bg-white border border-gray-300 shadow-[3px_5px_0px_0px_rgba(0,0,0,0.75)] cursor-pointer text-xl flex items-center justify-center" onClick={() => queueMove("backward")}>▼</button>
          <button id="right" className="w-12 h-10 bg-white border border-gray-300 shadow-[3px_5px_0px_0px_rgba(0,0,0,0.75)] cursor-pointer text-xl flex items-center justify-center" onClick={() => queueMove("right")}>▶</button>
        </div>

        <div className="z-[50] bg-black/50 text-white p-3 rounded-lg border border-white/20 w-[95%] max-w-[400px] sm:w-auto sm:max-w-none pointer-events-auto">
          <h2 className="text-xs sm:text-sm font-bold mb-1 uppercase tracking-widest text-center">Chicken Road Cross</h2>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] opacity-70 hidden sm:block text-center">Use Arrows or Buttons to Move</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="px-2 py-0.5 bg-white/20 rounded border border-white/50 text-[10px] font-bold text-white uppercase">
                SCORE: {score}
              </div>
              <div className="px-2 py-0.5 bg-yellow-500/20 rounded border border-yellow-500/50 text-[10px] font-bold text-yellow-400 uppercase">
                LAP {Math.floor(score / 20) + 1}
              </div>
              <div className="px-2 py-0.5 bg-green-500/20 rounded border border-green-500/50 text-[10px] font-bold text-green-400 uppercase">
                {(() => {
                  const lap = Math.floor(score / 20);
                  const types = ["Fruit Orchard", "Maize Field", "Spinach Garden"];
                  return types[lap % 3];
                })()}
              </div>
              <div className="px-2 py-0.5 bg-blue-500/20 rounded border border-blue-500/50 text-[10px] font-bold text-blue-400 uppercase">
                BEST: {highScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameOver && (
        <div id="result-container">
          <div id="result">
            <h1>Game Over</h1>
            <p>Your score: <span id="final-score">{score}</span></p>
            <button id="retry" onClick={initializeGame}>Retry</button>
          </div>
        </div>
      )}

    </div>
  );
}
