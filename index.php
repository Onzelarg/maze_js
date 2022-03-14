<?
	require('maze.php');
?>
<!doctype html>

<html>
<head>
<meta charset="UTF-8">
<title>Maze</title>
<link rel="stylesheet" id="normal" href="maze.css" type="text/css" media="all" />
</head>

<body>

<table class="inpt">
	<tr>		
		<td>Cell Size
			<input type="text" class="inp" id="r" value="25">
		</td>
		
		<td>
			<input type="submit" value="Draw" onclick=draw()>
		</td>
    	<td>
			<input type="submit" value="ReDraw" onclick=redraw()>
		</td>
		<td>
			<input type="submit" value="Clear" onclick=clear_c()>
		</td>
		<td>
			<input type="submit" value="Cube" onclick=cube()>
		</td>
		<td>
			<input type="submit" value="Debu" onclick=debu()>
		</td>
		<td>
			<input type="submit" value="Run" onclick=fill_maze()>
		</td>
		<td>
			<input type="submit" value="Stop" onclick=maze_finished()>
		</td>
		<td>
			<input type="submit" value="Hide" onclick=hide()>
		</td>
		<td>
			<input type="submit" value="Start" onclick=start_game()>
		</td>
		
		<td>Canvas Width
			<input type="text" class="inp" id="canvas_w" value="640">
		</td>
		<td>Height
			<input type="text" class="inp" id="canvas_h" value="360">
		</td>
		<td>
			<input type="submit" value="Canvas 3D" onclick="draw_3d()">
		</td>
		<td>
		  <input type="submit" value="Save Maze" onclick=save_maze()>
		</td>
		<td>
			<input type="submit" value="Load Maze" onclick=load_maze()>
		</td>
		<td>
			<input type="submit" value="Draw save maze" onclick=draw_maze_image()>
		</td>
		
	</tr>
</table>


	<div id="canvas_div" class="maze"><canvas id="myCanvas" width="500" height="500" style="border: 1px solid"></canvas> </div>
<div id="3d_maze_div" class="maze"><!--<canvas id="3d_canvas" width="640" height="360" style="border: 1px solid"></canvas> --></div>
<div id="deb"></div>
<table class="maze_tb">
	<tr>
		<td><b>Maze information</b></td>
	</tr>
	<tr>
		<td>Steps: </td><td id="steps">0</td>
	</tr>
	<tr>
		<td>Max distance: </td><td id="distance">0</td>
	</tr>
	<tr>
		<td>Time took to generate: </td><td id="time">0</td>
	</tr>
	<tr>
		<td><b>Floor information: </b></td>
	</tr>
	<tr>
		<td>Level: </td><td id="floor_lvl">0</td>
	</tr>
	<tr>
		<td>Starting point: </td><td>X</td><td id="start_x">0</td><td>Y</td><td id="start_y">0</td>
	</tr>
	<tr>
		<td>Exit: </td><td>X</td><td id="exit_x">0</td><td>Y</td><td id="exit_y">0</td>
	</tr>
	<tr>
		<td><b>Cell information: </b></td>
	</tr>
	<tr>
		<td>Id: </td><td id="cell_id">0</td>
	</tr>
	<tr>
		<td>Coordinates: </td><td id="cell_coord">0</td>
	</tr>
	<tr>
		<td>3D: </td><td id="3d_coord">0</td>
	</tr>
  <!--<tr>
	

	</tr>-->
</table>
<div id="load_canvas" class="load"> <canvas id="canvas_load" width="500" height="20"></canvas></div>
<div id="output" class="loadc">
Canvas Size: 500x500 Rows: 20 Columns: 20<br>$500$500$20$20$#<br>2aaaac6aac6aaaaaaec46aaac3b86956c2ac6939<br>56ac3aea96953aa93c6839696a96a92d6eaaa954<br>6a9296c56aa9516aaa9556aaa9397aac3a92ec2d<br>556aec685683aaae95697954555693eaae83c53c<br>5695553bac56c16a93ad556d53aac5553c3c2ea9<br>539156aa9393c3c3c3c456aa93c2eeaa943c3c55<br>556c6c3c556ec3c3a955579393c555153a96aa95<br>5546aa9553c7aaa96aed5553c2e938556eac5451<br>53b83c3aaa951569393c56aac7c6c6c3a952eac5<br>53c69139393ac43c3c3d3a93aaaaaaaa93aba929<br>#
</div>
<input type="range" id="slider" min="0" max="28" value="0" style="width: 505px; position: absolute; left: 7px; top: 577px">
	<div id="sout" style="width: 505px; position: absolute; left: 8px; top: 598px"></div>
<div id="mpic_div" style="position: absolute; left: 7px; top: 900px;"><canvas id="mpic"></canvas></div>
	<img src="slime.svg" width="130" height="130 "id="slime"></img>
<p>
  <script type="text/javascript" src="maze.js" ></script>
</p>

<script>
draw();
load_maze();
start_coord(380);
setup();
start_game();
canvas_structures[2].sight();
pers_test();
</script>
</body>
</html>