function areCoordsEqual (coords_1, coord_2) {
	let coordsEqual =
	(
		coords_1[0] === coord_2[0] &&
		coords_1[1] === coord_2[1] &&
		coords_1[2] === coord_2[2]
	);
	return coordsEqual;
}