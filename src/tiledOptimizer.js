'use strict';

const fs = require('fs');
const path = require('path');
const { extrudeTilesetToImage } = require("tile-extruder");

let alreadyProcessed = new Set();

/**
 *
 * @param mapPath string
 * @param outputDir
 * @param extrusion
 * @param color
 * @param alreadyExtrudedTilesets An array of tilesets that have already been extruded (maybe by another map?)
 * @returns {Promise<void>}
 */
async function optimizeMap(mapPath, outputDir, extrusion, color, alreadyHandledTilesets = []) {
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
        try {
            let inputImage = path.resolve(path.dirname(mapPath), tileset.image);
            if (!alreadyHandledTilesets.find(path => path === inputImage)) {
                await processTileset(tileset, extrusion, color, path.dirname(mapPath), outputDir);
                alreadyHandledTilesets.push(inputImage);
            }
            //tileset.image = imagePath;
            tileset.spacing = extrusion * 2;
            tileset.margin = extrusion;
            tileset.imagewidth = tileset.imagewidth + Math.floor(tileset.imagewidth / tileset.tilewidth) * extrusion * 2;
            tileset.imageheight = tileset.imageheight + Math.floor(tileset.imageheight / tileset.tileheight) * extrusion * 2;
        } catch (e) {
            let outputImagePath = path.resolve(outputDir, tileset.image);
            let imagePath = path.resolve(path.dirname(mapPath), tileset.image);
            if (imagePath !== outputImagePath) {
                fs.copyFileSync(imagePath, outputImagePath);
            }
            console.error('Failed to extrude tileset for image "'+tileset.image+'"');
            console.error('Got error: ', e);
        }
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

    let imagePath = path.resolve(mapDir, tileset.image);
    if (alreadyProcessed.has(imagePath)) {
        console.log('Tileset image "', imagePath, '" already processed (in a previous map)');
        return outputImagePath;
    }
    alreadyProcessed.add(imagePath);

    await extrudeTilesetToImage(tileset.tilewidth, tileset.tileheight, imagePath, outputImagePath, {
        margin: tileset.margin,
        spacing: tileset.spacing,
        extrusion,
        color,
    });
    return outputImagePath;
}

/**
 * Returns whether the file is a JSON Tile map or not.
 * @param mapPath
 * @return boolean
 */
function isJsonTiledMap(mapPath) {
    try {
        let rawdata = JSON.parse(fs.readFileSync(mapPath));

        let tilesets = rawdata.tilesets;
        if (tilesets === undefined) {
            return false;
        }
        return true;
    } catch (err) {
        console.error('The file '+mapPath+' does not appear to be a JSON Tile map. Error: ', err);
        return false;
    }
}
module.exports = { optimizeMap, isJsonTiledMap };
