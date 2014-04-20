function Chunk(x, y) {
	this.x = x;
	this.y = y;

	this.empty = true;
	this.inner = [];
}

Chunk.prototype.addInner = function(i) {
	this.inner.push(i);
	this.empty = false;
	i.chunk = this;
}

function Island(minX, minY, maxX, maxY) {
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;

	this.grassTiles = [];
	this.sandTiles = [];

	this.name = 'Ye Lonesome Isle';
	this.chunk = null;
}

Island.prototype.name = function(strIn) {
	if (strIn)
		this.name = strIn;
	else
		return this.name;	
}

Island.prototype.grassTiles = function(arrIn) {
	if (arrIn)
		this.grassTiles = arrIn;
	else
		return this.grassTiles;
}

Island.prototype.sandTiles = function(arrIn) {
	if (arrIn)
		this.sandTiles = arrIn;
	else
		return this.sandTiles;
}

World = {
	worldMap: [],
	worldWidth: 10,
	worldHeight: 10,

	chunkWidth: 24,
	chunkHeight: 24,

	numIslands: 0,
	inhabitedChance: 1/10,
	islandToOceanRatio: 1/10,
	islands: [],
	ports: [],

	mapModal: $('#world-map-modal'),
	mapModalOpen: false,

	init: function() {
		for (var x=0; x<this.worldWidth; x++) {
			this.worldMap[x] = new Array(this.worldWidth);
			for (var y=0; y<this.worldHeight; y++) {
				this.worldMap[x][y] = new Chunk(x, y);
			}
		}

		this.numIslands = Math.floor((this.worldWidth * this.worldHeight * this.islandToOceanRatio)
							+ (Math.random() * 3) - 1);
		console.log('Generating', this.numIslands, 'islands');

		this.generate();
	},

	destroy: function() {
		this.worldMap = [];
		this.islands = [];
		this.ports = [];
	},

	buildMapModal: function() {
		var map = $('#world-map-div');
		map.empty();

		var playerChunkX = Math.floor(Game.player.x/Game.map_grid.tile.width/this.chunkWidth);
		var playerChunkY = Math.floor(Game.player.y/Game.map_grid.tile.height/this.chunkHeight);

		for (var y=0; y<this.worldHeight; y++) {
			for (var x=0; x<this.worldWidth; x++) {
				var innerHtml = '';

				if (x == playerChunkX && y == playerChunkY) {
					innerHtml = '<img src="img/playerMapTile.png"</img>';
				} else if (!this.worldMap[x][y].empty) {
					innerHtml = '<img src="img/islandTile.png"</img>';
				} else {
					innerHtml = '<img src="img/oceanTile.png"</img>';
				}
				map.append('<div class="map-cell">' + innerHtml + '</div>');
			}
			map.append('<br style="clear: left;" />');
		}
	},

	mapModalIsOpen: function() {
		return this.mapModalOpen;
	},

	toggleMapModal: function() {
		console.log("toggling map modal");
		if (this.mapModalOpen) {
			this.mapModalOpen = false;
			this.mapModal.modal('hide');
		} else {
			this.mapModalOpen = true;
			this.buildMapModal();
			this.mapModal.modal('show');
		}
	},

	generateIsland: function(chunkX, chunkY) {
		var offX = chunkX * this.chunkWidth;
		var offY = chunkY * this.chunkHeight;

		var grassTiles = [];
		var sandTiles = [];
		var shallowWaterTiles = [];

		var spirals = Math.floor(Math.random() * 2) + 2; // 2-4 spirals

		var islandBaseWidth = Math.floor(Math.random() * this.chunkWidth/2);
		var islandBaseHeight = Math.floor(Math.random() * this.chunkHeight/2);
		var islandMaxWidth = islandBaseWidth + spirals;
		var islandMaxHeight = islandBaseHeight + spirals;

		var startX = Math.floor(Math.random() * (this.chunkWidth-(islandMaxWidth/2)) + (islandMaxWidth/2)) + offX;
		var endX = startX + islandBaseWidth;
		var startY = Math.floor(Math.random() * (this.chunkHeight-(islandMaxHeight/2)) + islandMaxHeight/2) + offY;
		var endY = startY + islandBaseHeight;

		var island = new Island(startX, startX + islandMaxWidth, startY, startY + islandMaxHeight);

		for (var x=startX; x<endX; x++) {
			for (var y=startY; y<endY; y++) {
				var tile = Crafty.e('Grass').at(x, y);
				Game.addObject(tile);
				grassTiles.push(tile);
			}
		}

		// Now travel outwards in a circle
		var counter = 0;
		var landChanceBonusPerSurroundingTile = 1/8;
		var landThreshold = .65;

		for (var counter = 0; counter < spirals; counter++) {
			startX--;
			startY--;

			var landChance = 0;
			landChanceBonusPerSurroundingTile *= .95;

			for (var x = startX; x < endX; x++) {
				landChance = Math.random()-Math.random();
				Game.forEachNeighbor(x, startY, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(x, startY);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			for (var y = startY; y < endY; y++) {
				landChance = Math.random();
				Game.forEachNeighbor(endX, y, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(endX,y);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			for (var x = endX; x > startX; x--) {
				landChance = Math.random();
				Game.forEachNeighbor(x, endY, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(x,endY);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			for (var y = endY; y > startY; y--) {
				landChance = Math.random();
				Game.forEachNeighbor(startX, y, function(neighbor) {
					if (neighbor !== 'null' && neighbor.has('Grass'))
						landChance += landChanceBonusPerSurroundingTile;
				});

				if (landChance > landThreshold) {
					var tile = Crafty.e('Grass').at(startX,y);
					Game.addObject(tile);
					grassTiles.push(tile);
				}
			}

			endX++;
			endY++;
		}

		var inhabitableTiles = [];

		// mark all land tiles touching water to be sand
		for (var i = 0; i < grassTiles.length; i++) {
			var touchingWater = false;
			var numSand = 0;

			var quads = {
				upLeft: 'Grass',
				upRight: 'Grass',
				downLeft: 'Grass',
				downRight: 'Grass'
			};

			Game.forEachNeighbor(grassTiles[i].at().x, grassTiles[i].at().y, function(neighbor, key, index) {
				if (neighbor === 'null') {

					switch (key) {
						case 'upLeft':
							quads.upLeft = 'Sand';
							numSand++;
							break;
						case 'up':
							quads.upLeft = 'Sand';
							quads.upRight = 'Sand';
							numSand += 2;
							break;
						case 'upRight':
							quads.upRight = 'Sand';
							numSand++;
							break;
						case 'left':
							quads.upLeft = 'Sand';
							quads.downLeft = 'Sand';
							numSand += 2;
							break;
						case 'right':
							quads.upRight = 'Sand';
							quads.downRight = 'Sand';
							numSand += 2;
							break;
						case 'downLeft':
							quads.downLeft = 'Sand';
							numSand++;
							break;
						case 'down':
							quads.downLeft = 'Sand';
							quads.downRight = 'Sand';
							numSand += 2;
							break;
						case 'downRight':
							quads.downRight = 'Sand';
							numSand++;
							break;
					}
				}
			}, true);

			var newQuad = Crafty.e('MapQuad')
					.at(grassTiles[i].at().x, grassTiles[i].at().y)
					.setQuadrants(quads);

			Game.addObject(newQuad);

			grassTiles[i].destroy();

			// decide if this tile is inhabitable
			if (numSand > 1) {
				inhabitableTiles.push(newQuad);
			}
		}

		// decide whether or not this island should be inhabited
		if (Math.random() > this.inhabitedChance) {
			// select a random inhabitable tile
			var tile = inhabitableTiles[Math.floor(Math.random() * inhabitableTiles.length)];

			var newPort = Crafty.e('Port').at(tile.at().x, tile.at().y);
			this.ports.push(newPort);
			Game.addObject(newPort);
		}

		// now stuff all this data into an island and add it to the map
		this.worldMap[chunkX][chunkY].addInner(island);
		this.islands.push(island);
	},

	generate: function() {
		this.occupied = new Array(Game.map_grid.width);
		Game.mapObjects = new Array(Game.map_grid.width);
		for (var i=0; i<Game.map_grid.width; i++) {
			this.occupied[i] = new Array(Game.map_grid.height);
			Game.mapObjects[i] = new Array(Game.map_grid.height);
			for (var k=0; k<Game.map_grid.height; k++) {
				this.occupied[i][k] = false;
				Game.mapObjects[i][k] = [];
			}
		}

		for (var i=0; i<this.numIslands-1; i++) {
			do {
				x = Math.floor(Math.random() * this.worldWidth);
				y = Math.floor(Math.random() * this.worldHeight);
			} while (!this.worldMap[x][y].empty);

			this.generateIsland(x,y);
		}

		// add player
		var startPort = this.ports[Math.floor(Math.random() * this.ports.length)];
		var placeX = 0; var placeY = 0; var distance = 2;

		do {
			placeX = Math.floor(Math.random() * distance) - distance/2 + startPort.at().x;
			placeY = Math.floor(Math.random() * distance) - distance/2 + startPort.at().y;
			distance++;
		} while (Game.mapObjects[placeX][placeY].has && Game.mapObjects[placeX][placeY].has('Solid'));

		Game.player = Crafty.e('PlayerCharacter').at(placeX, placeY);
		Crafty.viewport.follow(Game.player, 0, 0);
	},

	findChunk: function(entity) {
		if (!entity.has || !entity.has('Grid')) {
			return;
		}

		var x = entity.at().x;
		var y = entity.at().y;

		return {
			x: Math.floor(x/this.chunkWidth),
			y: Math.floor(y/this.chunkHeight)
		};
	},

	// spawn enemy within two chunks of player
	spawnEnemy: function() {
		var eligibleChunks = [];
		var playerChunk = this.findChunk(Game.player);

		for (var x = playerChunk.x-2; x < playerChunk.x+2; x++) {
			for (var y = playerChunk.y-2; y < playerChunk.y+2; y++) {
				if (x >= 0 && x < this.worldWidth && y >= 0 && y < this.worldHeight)
					eligibleChunks.push(this.worldMap[x][y]);
			}
		}

		var chunk = eligibleChunks[Math.floor(Math.random() * eligibleChunks.length)];
		var placeX, placeY;

		do {
			placeX = Math.floor(Math.random() * this.chunkWidth) + (chunk.x * this.chunkWidth);
			placeY = Math.floor(Math.random() * this.chunkHeight) + (chunk.y * this.chunkHeight);
		} while (Game.mapObjects[placeX][placeY].has && Game.mapObjects[placeX][placeY].has('Solid'));

		Game.enemies.push(Crafty.e('Enemy').at(placeX, placeY));
	}
}