# Tiled map optimizer

This project contains a simple command line application (and a GitHub Action) that:

- takes in input a Tiled map
- scans all textures
- [extrude the textures](https://github.com/sporadic-labs/tile-extruder)
- rewrites the map

## Usage

### CLI usage

The map must be in Tiled JSON format.

```
$ bin/tile-optimizer -i my_map.json -o dist/
```

Parameters:

- `-i`: input file (the name of the map file in Tiled JSON format)
- `-o`: output directory. The JSON map file and all textures will be written back here

Limitations:

Tiles must be embedded in the map. This tool cannot read maps in TSX format.
