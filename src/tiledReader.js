'use strict';

const fs = require('fs');
const path = require('path');
const { extrudeTilesetToImage } = require("tile-extruder");

/**
 *
 * @param mapPath string
 * @returns {Promise<void>}
 */
async function readMap(mapPath, outputDir, extrusion, color) {
    let rawdata = JSON.parse(fs.readFileSync(mapPath));

    let tilesets = rawdata.tilesets;
    if (tilesets === undefined) {
        throw new Error('No tilesets found in map');
    }

    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    for (let tileset of tilesets) {
        console.log("Processing ",tileset.image);
        let imagePath = await processTileset(tileset, extrusion, color, path.dirname(mapPath), outputDir);
        tileset.image = imagePath;
        tileset.spacing = extrusion * 2;
        tileset.margin = extrusion;
    }

    console.log("Rewriting map");
    let data = JSON.stringify(rawdata);
    fs.writeFileSync(path.resolve(outputDir, path.basename(mapPath)), data);
}

async function processTileset(tileset, extrusion, color, mapDir, outputDir) {
    if (tileset.spacing != 0) {
        console.log('Tileset "'+tileset.image+'" is already extruded.');
        return;
    }

    // Let's extrude!
    let outputImagePath = path.resolve(outputDir, tileset.image);
    await extrudeTilesetToImage(tileset.tilewidth, tileset.tileheight, path.resolve(mapDir, tileset.image), outputImagePath, {
        margin: tileset.margin,
        spacing: tileset.spacing,
        extrusion,
        color,
    });
    return outputImagePath;
}

module.exports = { readMap };
