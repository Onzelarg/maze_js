var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var c3d,ctx3d;
var load_c = document.getElementById("canvas_load");
var ctx_load = load_c.getContext("2d");
var x=0,y=0,w=10,h=10;
var r=c.width/w;
var co=c.height/h;
var cells=[],cell_stack=[];
var deb=document.getElementById('deb');
var unvisited="#99ccff",visited="#66ff99",nn="#ff6666",player_color="#cc0099",exit="#000066",cside="#6d91b5";
//#6d91b5 #9c5211 87E264
var row_size=c.width/w;
var column_size=c.height/h;
var timer,generator;
var id=0,steps=0;
var canvas_div=document.getElementById('canvas_div');
var canvas_3d=document.getElementById('3d_maze_div');
var load_div=document.getElementById('load_canvas');
document.addEventListener('keydown', key_press);
var max_stack=start_time=player_size=player_shift=floor_lvl=0;
var floors=[];
var player_last_loc=0;
var max_steps=0;
var player;
var maze_fin=false;

var o_id=[-r,1,r,-1];
//UP RIGHT BOTTOM LEFT
var wall_orientaion=[[3,1,0],[0,2,1],[1,3,2],[2,0,3]];

var slider=document.getElementById('slider');
var sout=document.getElementById('sout');

var steps_tb=document.getElementById('steps');
var distance_tb=document.getElementById('distance');
var time=document.getElementById('time');
var start_x=document.getElementById('start_x');
var start_y=document.getElementById('start_y');
var exit_x=document.getElementById('exit_x');
var exit_y=document.getElementById('exit_y');
var cell_id=document.getElementById('cell_id');
var cell_coord=document.getElementById('cell_coord');
var floor_tb=document.getElementById('floor_lvl');
var d_coord=document.getElementById('3d_coord');
var out=document.getElementById('output');

var c_maze=document.getElementById("mpic");
var maze_pic=c_maze.getContext("2d");

var mouse_x,mouse_y;
c.addEventListener('mousemove',img_locator);
c.addEventListener('click',id_locator);

let points=[];
let canvas_structures=[];

slider.oninput = function() {
  canvas_structures[this.value].draw();
	sout.innerHTML=this.value;
}

function debu(){
	
}
// ********************************************************************************************************
//													Cell Object
// ********************************************************************************************************
function cell(x,y,xl,yl){
	this.coord=[x,y,Number(x)+Number(w),Number(y)+Number(h)];
	this.loc=[xl,yl];
	this.visited=false;
	this.walls=[true,true,true,true];
	this.sty=unvisited;
	
	this.draw = function() {
		ctx.beginPath();
		ctx.moveTo(this.coord[0], this.coord[1]);
		//Top
		if(this.walls[0]){ctx.lineTo(this.coord[2], this.coord[1]);}else{ctx.moveTo(this.coord[2], this.coord[1]);}
		//Right
		if(this.walls[1]){ctx.lineTo(this.coord[2], this.coord[3]);}else{ctx.moveTo(this.coord[2], this.coord[3]);}
		//Bottom
		if(this.walls[2]){ctx.lineTo(this.coord[0], this.coord[3]);}else{ctx.moveTo(this.coord[0], this.coord[3]);}
		//Left
		if(this.walls[3]){ctx.lineTo(this.coord[0], this.coord[1]);}
		ctx.stroke();
		ctx.lineWidth=3;
		ctx.fillStyle = this.sty;
		ctx.fillRect(this.coord[0], this.coord[1], w, h);
		ctx.closePath();
	};
	
	this.neighbor = function(current){
		let neighbors=[];
		let top=current-row_size,right=current+1,bottom=current+row_size,left=current-1;
		//Top
		if(top>=0 && !cells[top].visited){neighbors.push([0,top,2]);}
		//Right
		if(cells[current].loc[0]!=row_size-1 && !cells[right].visited){neighbors.push([1,right,3]);}
		//Bottom
		if(cells[current].loc[1]<column_size-1 && !cells[bottom].visited){neighbors.push([2,bottom,0]);}
		//Left
		if(cells[current].loc[0]!=0 && !cells[left].visited){neighbors.push([3,left,1]);}
		
		let next_rand=Math.round(Math.random() * neighbors.length);
		if(next_rand>neighbors.length-1){next_rand--;}
		let next=0;
		if(neighbors.length>0){
			next=neighbors[next_rand][1];
			cells[current].walls[neighbors[next_rand][0]]=false;cells[next].walls[neighbors[next_rand][2]]=false;
			cell_stack.push(next);
		}else{
			next=cell_stack.pop();
		}
		
		
		cells[next].sty=nn;
		cells[current].draw();cells[next].draw();
		let deb_out="Steps: ";
		deb_out+=++steps;
		steps_tb.innerHTML=deb_out;
		this.distance=cell_stack.length;
		if(max_stack<cell_stack.length){max_stack=cell_stack.length;}
		distance_tb.innerHTML=max_stack;
		return next;

	};
	this.check_wall = function(side){
		return this.walls[side];		
	};
	
	this.rerun = function(id){
		let top=id-row_size,right=id+1,bottom=id+row_size,left=id-1;
		let del=Math.round(Math.random() * 3);
		let neighbors=[[0,top,2],[1,right,3],[2,bottom,0],[3,left,1]];
		if((del==0 && top>=0) || (del==1 && cells[id].loc[0]!=row_size-1) || (del==2 && cells[id].loc[1]<column_size-1) || (del==3 && cells[id].loc[0]!=0)){
			let next=neighbors[del][1];
			cells[id].walls[neighbors[del][0]]=false;cells[next].walls[neighbors[del][2]]=false;
		}
	}
}

// ********************************************************************************************************
//													Floor Object
// ********************************************************************************************************
function floor(start){
	this.level=++floor_lvl;
	this.start=start;
	this.exit_distance=-1;
	this.exit_id=0;
	floor_tb.innerHTML=this.level;
	
	this.exit_f = function(){
		let min=0,max=0;
		if(player.difficulty==0){min=0.1;max=0.4;}
		if(player.difficulty==1){min=0.2;max=0.6;}
		if(player.difficulty==2){min=0.2;max=0.8;}
		this.exit_distance=Math.floor(Math.floor(Math.random()*(max_stack*min))+(max_stack*max));
		let exit_cell_id=0;
		while(cells[exit_cell_id].distance!=this.exit_distance){exit_cell_id++;}
		this.exit_id=exit_cell_id;
		redraw_cell(exit_cell_id,exit);
		
		exit_x.innerHTML=cells[this.exit_id].loc[0];
		exit_y.innerHTML=cells[this.exit_id].loc[1];
	}
}

// ********************************************************************************************************
//													Player Object
// ********************************************************************************************************
function player(start){
	this.start=start;
	this.last_loc=0;
	this.difficulty=0;
	this.orientation=[[0,-1],[1,0],[0,1],[-1,0]];
	this.actual_orientation=0;
	// 0,-1 N		1,0 E 		0,1 S 		-1,0 W
	
	this.draw_player = function(){
		let player_x=cells[this.start].coord[0]+player_shift,player_y=cells[this.start].coord[1]+player_shift;
		ctx.beginPath();
		ctx.moveTo(player_x,player_y);
		ctx.fillStyle = player_color;
		ctx.fillRect(player_x, player_y, w-player_shift*2, h-player_shift*2);
		let playercenter_x=player_x+((w-player_shift*2)/2);
		let playercenter_y=player_y+((h-player_shift*2)/2);
		ctx.moveTo(playercenter_x,playercenter_y);
		let ori_line_x=playercenter_x+(15*this.orientation[this.actual_orientation][0]);
		let ori_line_y=playercenter_y+(15*this.orientation[this.actual_orientation][1]);
		ctx.lineTo(ori_line_x,ori_line_y);
		ctx.stroke();
		ctx.closePath();
		this.last_loc=this.start;
	};
}



// ********************************************************************************************************
//													
// ********************************************************************************************************

function get_size(){
	w = document.getElementById('x').value;
	h = document.getElementById('y').value;
	r=c.width/w;
	co=c.height/h;
}
function redraw(){
	let cell_l=cells.length;
	for (let i=0;i<cell_l; i++){
	
  	cells[id++].draw();
  
 }
	id=0;
}

function fill_maze(){
	steps=0;
	max_stack=0;
	start_time=Date.now();
	if(generator) {return};
	if(!maze_fin){
  		generator= setInterval(cube, 0.001);
	}else{
		generator= setInterval(cube_rerun, 0.001);
	}
	if(timer) {return};
  timer= setInterval(timer_f, 1);
}

function maze_finished() {
	clearInterval(generator);
	clearInterval(timer);
	timer= null;
	generator= null;
	maze_fin=true;
	id=0;
}

function timer_f(){
	let time_now=Date.now();
	time_now-=start_time;
	let sec=Math.floor(time_now/1000);
	time_now-=sec*1000;
	time.innerHTML=sec+" s "+time_now+" ms";
}

function draw(){
	clear_c();
	cells=[];
	cell_stack=[];
	w=document.getElementById('r').value;
	h=document.getElementById('r').value;
	r=c.width/w;
	co=c.height/h;
	steps=0;
	draw_3d();
	
	player_size=Math.floor(w*0.6);
	if(player_size%2==1){player_size-=1;}
	player_shift=Math.floor(w-player_size)/2;
	
	for(let i=0;i<co;i++ ){
		for(let j=0;j<r;j++){
			x=j*w;y=i*h;
			let cell_ob=new cell(x,y,j,i);
			cells.push(cell_ob);
			cell_ob.draw();
			if(j==13){
				deb.innerHTML="Hi";
			}
			if(i*j==co*r){maze_finished();}
		}
	}
	deb.innerHTML=cells.length;
	max_steps=(cells.length*2)-2;
	clear_load(0,load_c.width);
	
}

function cube(){
	for(let i=0;i<50;i++){
		draw_load();
		row_size=Number(c.width/w);
		column_size=Number(c.height/h);
		let current=0;
		if(cell_stack.length>0){current=cell_stack[cell_stack.length-1];}else{current=Math.floor(Math.random() * cells.length);start_coord(current);}
		cells[current].sty=visited;
		cells[current].visited=true;
		cells[current].neighbor(current);
		if(cell_stack.length==0){maze_finished();}
	}
}

function cube_rerun(){
	for(let i=0;i<50;i++){
		draw_load();
		row_size=Number(c.width/w);
		column_size=Number(c.height/h);
		cells[id].rerun(id);
		cells[id].draw();
		id++;
	}
	if(id>=cells.length){maze_finished();}
}

function draw_load(){
	let load=0;
	load=(steps/max_steps);
	let load_per=Math.round(load*100);
	load_per+=" %";
	load=load*load_c.width;
	ctx_load.moveTo(0,0);
	ctx_load.fillStyle=visited;
	clear_load(load,load_c.width-load);
	//fillrect()
	// x , y , width , height
	ctx_load.fillRect(0,0,load,20);
	ctx_load.fillStyle=exit;
	ctx_load.textAlign = "center";
	ctx_load.font="16px Calibri";
	ctx_load.fillText(load_per, load_c.width/2, 15);
	
}
function clear_load(x,w){
	ctx_load.clearRect(x,0,w,20);	
}

function start_coord(id){
	let floor_l=new floor(id);
	floors.push(floor_l);
	start_x.innerHTML=cells[id].loc[0];
	start_y.innerHTML=cells[id].loc[1];
}

function start_game(){
	player=new player(floors[0].start);
	//if(floors[floor_lvl-1].exit_distance==-1){floors[floor_lvl-1].exit_f();}
	floors[0].exit_distance=140;
	//hide();
	redraw_cell(floors[0].start,visited);
	player.draw_player();
}
function redraw_cell(id,color){
	cells[id].sty=color;
	cells[id].draw();
}


function clear_c(){
	ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	cells=[];
}

function hide(){
	ctx.fillStyle = unvisited;
	ctx.fillRect(0, 0, c.width, c.height);
	
}

function setup(){
	row_size=Number(c.width/w);
	r=row_size;	
	o_id=[-r,1,r,-1];
	max_stack=200;
}

// ********************************************************************************************************
//													3D Canvas Object
// ********************************************************************************************************

function structure(name,id,x,y,shape,color){
	this.name=name;
	this.id=id;
	this.shape=shape;
	if(!color){this.color="#000000";}else{this.color=color;}
	this.x=x;
	this.y=y;
	
	this.draw = function(){
		if(this.id==2){this.color=exit;}
		ctx3d.beginPath();
		ctx3d.fillStyle=this.color;
		if(this.shape=="trapezoid"){
			ctx3d.fillRect(this.x[0],this.y[0],this.x[1],this.y[1]);
		}else if(this.shape=="line"){
			ctx3d.moveTo(this.x[0],this.y[0]);
			ctx3d.lineTo(this.x[1],this.y[1]);
			ctx3d.stroke();		
		}else{
			ctx3d.moveTo(this.x[0],this.y[0]);
			for(let i=1;i<this.x.length;i++){
				ctx3d.lineTo(this.x[i],this.y[i]);
			}
			ctx3d.fill();
			ctx3d.moveTo(this.x[1],this.y[1]);
			ctx3d.lineTo(this.x[1],this.y[2]);
			ctx3d.stroke();
		}
		ctx3d.closePath();
		this.draw_id();
	}
	
	this.draw_id = function(){
		let tx=this.x[0]+((this.x[1]-this.x[0])*0.5);
		let ty=this.y[1]+((this.y[2]-this.y[1])*0.5);
		ctx3d.textAlign = "center";
		ctx3d.font="16px Calibri";
		ctx3d.fillStyle=exit;
		ctx3d.fillText(this.id, tx,ty);
	}
	
	this.clear = function(){
		ctx3d.globalCompositeOperation = "destination-out";
		this.draw();
		ctx3d.globalCompositeOperation = "destination-over";
		canvas_structures[0].draw();
		canvas_structures[1].draw();
		canvas_structures[2].draw();
		ctx3d.globalCompositeOperation = "source-over";
		if(!this.last){
			canvas_structures[this.id-8].corridor();
		}
	}
	
	this.corridor = function(){
		ctx3d.beginPath();
		if(this.color==cside){ctx3d.fillStyle=unvisited;}else{ctx3d.fillStyle=this.color;}
		let width=canvas_structures[this.id+8].x[0]-this.x[0];
		let height=this.y[3]-this.y[0];
		ctx3d.fillRect(this.x[0],this.y[0],width,height);
		ctx3d.rect(this.x[0],this.y[0],width,height);
		ctx3d.stroke();
		ctx3d.closePath();
	}
	
	this.sight = function(){
		//r=row size, orientation last_loc=cell id , far_wall.max_lv=to check
		let nowall=true;
		let wall_checked=0;
		let f_id=player.last_loc;
		let move_check=o_id[player.actual_orientation];
		let wall_o=wall_orientaion[player.actual_orientation];
		let side_start=3+4*canvas_structures[2].max_lv;
		//0		f-r		l-1		r+1
		//1		f+1		l-r		r+r
		//2		f+r		l+1		r-1
		//3		f-1		l+r		r-r
		
		while(nowall){
			for(let i=0;i<3;i++){
				if(i<2 && cells[f_id].walls[wall_o[i]]==false){
					if(i==0){
						canvas_structures[side_start+wall_checked*2].clear();
					}else{
						canvas_structures[side_start+wall_checked*2+1].clear();
					}
				}
				if(i==2 && wall_checked<4 && cells[f_id].walls[wall_o[i]]==true){
					nowall=false;
					canvas_structures[2].far_wall(wall_checked);
				}
			}
			
			f_id+=move_check;
			wall_checked++;
			if(wall_checked==canvas_structures[2].max_lv+1){
				nowall=false;
			}
		}		
	}
	
	
	this.color_change = function(col){
		this.color=col;
		this.draw();
	}
}


// ********************************************************************************************************
//													3D Canvas Creation
// ********************************************************************************************************

function create_canvas(x,y){
	c3d = document.createElement('canvas');
	ctx3d = c3d.getContext("2d");
	c3d.id = "3d_canvas";
	c3d.width = x;
	c3d.height = y;
	c3d.style.border = "1px solid";
	canvas_3d.appendChild(c3d);
	c3d.addEventListener('mousemove',img_locator2);
} 

function get_fv(mode,a,b,c,d,e){
	if(mode==0){return Math.round((a*d-a*b)/(c-b));}
	if(mode==1){return Math.round((((e-d)*(c-a))+((b-a)*d))/(b-a));}
}

function draw_3d(){
	if(c3d){c3d.remove();canvas_structures=[];}
	let d_width=document.getElementById("canvas_w").value;
	let d_height=document.getElementById("canvas_h").value;
	create_canvas(d_width,d_height);
	
	let cw=c3d.width;
	let ch=c3d.height;
	let c_top_bottom=ch*0.45;
	let cwallh=ch*0.1;
	let cwallw=cwallh*1.5;
	let cwallcenter=Math.round((cw/2)-(cwallw/2));
	let x=[];
	let y=[];
	let id=0;
	let lines_counter=4;
	
	//Floor
	x=[0,cw];y=[ch-c_top_bottom,c_top_bottom]
	let strut=new structure("Floor",id++,x,y,"trapezoid",visited);
	canvas_structures.push(strut);
	
	//Ceiling
	x=[0,cw];y=[0,c_top_bottom];
	strut=new structure("Top",id++,x,y,"trapezoid",nn);
	canvas_structures.push(strut);
	
	//Far Wall
	x=[0,cw];y=[c_top_bottom,cwallh];
	strut=new structure("Far Wall",id++,x,y,"trapezoid",exit);
	strut.max_lv=lines_counter;
	
	strut.far_wall = function(lv){
		let start=3+4*this.max_lv;
		if(lv>=this.max_lv){
			this.color=exit;
			this.draw();
		}else{
			this.color=unvisited;
			let x=canvas_structures[start+lv*2].x[1];
			let y=canvas_structures[start+lv*2].y[1];
			let w=canvas_structures[start+lv*2+1].x[1]-x;
			let h=canvas_structures[start+lv*2].y[2]-y;
			ctx3d.beginPath();
			ctx3d.fillStyle=this.color;
			ctx3d.fillRect(x,y,w,h);
			ctx3d.rect(x,y,w,h);
			ctx3d.stroke();
			ctx3d.closePath();
		}
	}
	
	canvas_structures.push(strut);
	
	//Lines
		
	let sidet=ch*0.2;
	let sideb=ch-ch*0.2;
	let sidew=cw-(cw*0.55);
	
	//Left

	let side_lines=[]
	side_lines.push([sidew,sidet,c_top_bottom]);

	let lin=2;
	let linet=Math.round(c_top_bottom/lin);
	let lineb=Math.round(ch-c_top_bottom/lin);
	let lsides=[];
	let rsides=[];
	let lc_sides=[];
	let rc_sides=[];
	let c_size=0;
	for(let i=0;i<lines_counter;i++){
		let k=i*2;
		x=[0,cw];y=[linet,linet];
		strut=new structure("Top Line "+(i+1),id++,x,y,"line");
		canvas_structures.push(strut);
		x=[0,cw];y=[lineb,lineb];
		strut=new structure("Bottom Line "+(i+1),id++,x,y,"line");
		canvas_structures.push(strut);
		lin+=lin;
		linet+=Math.round(c_top_bottom/lin);
		lineb-=Math.round(c_top_bottom/lin);
		let mod_x=get_fv(0,side_lines[0][0],side_lines[0][1],side_lines[0][2],canvas_structures[3+k].y[0]);
		let mod_y=0;
		canvas_structures[3+k].x[0]=mod_x;
		canvas_structures[3+k].x[1]=cw-mod_x;
		canvas_structures[3+k+1].x[0]=mod_x;
		canvas_structures[3+k+1].x[1]=cw-mod_x;
		//name,x,y,width,height,x2,y2,line,color,tofill
		
		//function get_fv(x2,y1,y2,yc){
		if(i==0){
			x=[0,mod_x,mod_x,0];
			y=[sidet,canvas_structures[3+k].y[0],ch-canvas_structures[3+k].y[0],sideb];
			c_size=mod_x;
		}else{
			c_size=Math.round(c_size*0.6);
			x=[lsides[i-1].x[1],lsides[i-1].x[1]+c_size,lsides[i-1].x[1]+c_size,lsides[i-1].x[1]];
			mod_y=get_fv(1,lsides[i-1].x[1],side_lines[0][0],lsides[i-1].x[1]+c_size,lsides[i-1].y[1],side_lines[0][2]);
			y=[lsides[i-1].y[1],mod_y,ch-mod_y,lsides[i-1].y[2]];
			strut=new structure("Side Column L "+(lsides.length),-1,x,y,"cside",cside);
			lc_sides.push(strut);
			
			mod_x=get_fv(0,side_lines[0][0],side_lines[0][1],side_lines[0][2],canvas_structures[3+k].y[0]);
			x=[lc_sides[i-1].x[1],mod_x,mod_x,lc_sides[i-1].x[1]]
			y=[lc_sides[i-1].y[1],canvas_structures[3+k].y[0],ch-canvas_structures[3+k].y[0],lc_sides[i-1].y[2]];
		}
		//strut=new structure("Side Left "+(lines_counter-i),mod_x,canvas_structures[3+k].y[0],0,0,mod_x,ch-canvas_structures[3+k].y[0],true);
		//name,x,y,shape,color
		strut=new structure("Side Left "+(lsides.length),-1,x,y,"side",unvisited);
		lsides.push(strut);
		if(i+1==lines_counter){

			c_sizel=Math.round(c_size*0.6);
			x=[lsides[i].x[1],lsides[i].x[1]+c_sizel,lsides[i].x[1]+c_sizel,lsides[i].x[1]];
			mod_yl=get_fv(1,lsides[i].x[1],side_lines[0][0],lsides[i].x[1]+c_sizel,lsides[i].y[1],side_lines[0][2]);
			y=[lsides[i].y[1],mod_yl,ch-mod_yl,lsides[i].y[2]];
			strut=new structure("Side Column L "+(lsides.length-1),-1,x,y,"cside",cside);
			lc_sides.push(strut);
			
			x=[lc_sides[i].x[1],sidew,sidew,lc_sides[i].x[1]];
			y=[lc_sides[i].y[1],c_top_bottom,c_top_bottom+cwallh,lc_sides[i].y[2]];
			strut=new structure("Side Left "+(lsides.length),-1,x,y,"side",unvisited);
			strut.last=true;
			lsides.push(strut);
			
			
		}
		
		
		if(i==0){
			x=[cw,cw-mod_x,cw-mod_x,cw];
			y=[sidet,canvas_structures[3+k].y[0],ch-canvas_structures[3+k].y[0],sideb];
		}else{
			x=[rsides[i-1].x[1],rsides[i-1].x[1]-c_size,rsides[i-1].x[1]-c_size,rsides[i-1].x[1]];
			y=[rsides[i-1].y[1],mod_y,ch-mod_y,rsides[i-1].y[2]];
			strut=new structure("Side Column R "+(rsides.length),-1,x,y,"cside",cside);
			rc_sides.push(strut);
			
			mod_x=get_fv(0,side_lines[0][0],side_lines[0][1],side_lines[0][2],canvas_structures[3+k].y[0]);
			x=[rc_sides[i-1].x[1],cw-mod_x,cw-mod_x,rc_sides[i-1].x[1]];
			y=[rc_sides[i-1].y[1],canvas_structures[3+k].y[0],ch-canvas_structures[3+k].y[0],rc_sides[i-1].y[2]];
		}
		
		strut=new structure("Side Right "+(rsides.length),-1,x,y,"side",unvisited);
		rsides.push(strut);
		
		if(i+1==lines_counter){
			
			x=[rsides[i].x[1],rsides[i].x[1]-c_sizel,rsides[i].x[1]-c_sizel,rsides[i].x[1]];
			y=[rsides[i].y[1],mod_yl,ch-mod_yl,rsides[i].y[2]];
			strut=new structure("Side Column R "+(rsides.length-1),-1,x,y,"cside",cside);
			rc_sides.push(strut);
			
			
			x=[rc_sides[i].x[1],cw-sidew,cw-sidew,rc_sides[i].x[1]];
			y=[rc_sides[i].y[1],c_top_bottom,c_top_bottom+cwallh,rc_sides[i].y[2]];
			strut=new structure("Side Right "+(rsides.length),-1,x,y,"side",unvisited);
			strut.last=true;
			rsides.push(strut);

			
		}
	}
	
	for(let i=0;i<rc_sides.length;i++){
		lc_sides[i].id=id++;rc_sides[i].id=id++;
		canvas_structures.push(lc_sides[i]);
		canvas_structures.push(rc_sides[i]);		
	}
	
	for(let i=0;i<lsides.length;i++){
		lsides[i].type="left";rsides[i].type="right";
		lsides[i].id=id++;rsides[i].id=id++;
		canvas_structures.push(lsides[i]);
		canvas_structures.push(rsides[i]);
	}
	for(let i=0;i<canvas_structures.length;i++){
		canvas_structures[i].draw();
	}
		
}





// ********************************************************************************************************
//														AS
// ********************************************************************************************************
function key_press(e) {
	let keys=[38,40,69,81,83,87];
	let no_break=false;
	for(let i=0;i<keys.length;i++){
		if(e.keyCode==keys[i]){no_break=true;}
	}
	if(!no_break){return;}
	//row_size=20;
	//r=20;
	//var o_id=[-r,1,r,-1];
	let to_check=player.actual_orientation;
	let up,down;
//	let up=player.start-row_size,
//		right=player.start+1,
//		down=player.start+row_size,
//		left=player.start-1;
//	let up=player.start+o_id[0],right=player.start+o_id[1],down=player.start+o_id[2],left=player.start+o_id[3];
	let to_draw=-1;
	let ori=0;
	//FW
	if(e.keyCode==87 || e.keyCode==38){
		up=player.start+o_id[player.actual_orientation];
		to_draw=up;
	}
	//BW
	if(e.keyCode==83 || e.keyCode==40){
		down=player.start-o_id[player.actual_orientation];
		to_draw=down;
		if(player.actual_orientation<=1){to_check=player.actual_orientation+2;}else{to_check=player.actual_orientation-2;}
	}
	/*
  	if(e.keyCode==87 || e.keyCode==38){to_draw=up;pass=0;}
	if(e.keyCode==68 || e.keyCode==39){to_draw=right;pass=1;ori=1;}
	if(e.keyCode==83 || e.keyCode==40){to_draw=down;pass=2;ori=2;}
	if(e.keyCode==65 || e.keyCode==37){to_draw=left;pass=3;ori=3;}
	*/
	if(e.keyCode==69){
		if(player.actual_orientation!=3){
			player.actual_orientation+=1;
		}else{
			player.actual_orientation=0;
		}
		player.draw_player();
	}
	if(e.keyCode==81){
		if(player.actual_orientation!=0){
			player.actual_orientation-=1;
		}else{
			player.actual_orientation=3;
		}
		player.draw_player();
	}	
	if((e.keyCode!=69 && e.keyCode!=81) && !cells[player.start].check_wall(to_check)){
		player.start=to_draw;
		redraw_cell(player.start,visited);
		redraw_cell(player.last_loc,visited);
		player.draw_player();
	}
	ctx3d.clearRect(0,0,c3d.width,c3d.height);
	for(let i=0;i<canvas_structures.length;i++){
			canvas_structures[i].draw();	
		}
	canvas_structures[2].sight();	
	//w 87 a 65 s 83 d 68
	//UP 38 LEFT 37 Right 39 Down 40
	//Q 81	E 69
}

function img_locator(e){
	var position = getPosition(e);
	position.x=Math.floor(position.x/w);
	position.y=Math.floor(position.y/w);
	mouse_x=position.x;mouse_y=position.y;
	cell_coord.innerHTML = 'X: ' + position.x + ' Y: ' + position.y;
	
}

function img_locator2(e){
	var position = getPosition(e);
	d_coord.innerHTML= 'X: ' + Math.round(position.x) + ' Y: ' + Math.round(position.y);
	
}

function getPosition(e) {
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  return {x,y}
}

function id_locator(){
	let i=0;
	let x_id=mouse_x;
	let y_id=mouse_y;
	while(cells[i].loc[0]!=x_id || cells[i].loc[1]!=y_id){i++;
	}
	cell_id.innerHTML=i;
}

async function fetch_call(operation,file_name) {
	let url='maze.php';
	let filename=file_name;
	let bod="to_run="+operation+"&filename="+filename+"&maze="+out.innerHTML;
	let response_data="Failed";

	let fetcher=fetch(url, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		body: bod
		})
	let response=await fetcher;
	let data=response.text();
	return data;
}

// ********************************************************************************************************
//													Canvas
// ********************************************************************************************************

async function save_maze(){
	if(cells.length==0){return;}
	let outt="Canvas Size: "+c.width+"x"+c.height;
	outt+=" Rows: "+r+" Columns: "+co+"<br>";
	outt+="$"+c.width+"$"+c.height+"$"+r+"$"+co+"$";
	outt+="#<br>";
	let bin=0;
	for(let i=1;i<cells.length+1;i++){
		bin=0;
		if(cells[i-1].walls[0]==false){bin+=1;}
		if(cells[i-1].walls[1]==false){bin+=2;}
		if(cells[i-1].walls[2]==false){bin+=4;}
		if(cells[i-1].walls[3]==false){bin+=8;}
		outt+=bin.toString(16);
		if(i%(r*2)==0){outt+="<br>";}
	}
	outt+="#";
	out.innerHTML=outt;
	let result=await fetch_call("write","mazey.txt");
	console.log(outt);
	if(result=="Success"){console.log("Save succesful");}else{console.log("Save failed");}
}

function load_maze(){
	if(cells.length==0){return;}
	let intt=out.innerHTML;
	intt=intt.split("$");
	let canvas_width=intt[1];
	let canvas_height=intt[2];
	let rows=intt[3];
	let cols=intt[4];
	intt=intt[5].split("#");
	intt=intt[1].trim().split("<br>");
	let in_data=intt[0];
	for(let i=1;i<intt.length;i++){
		in_data+=intt[i];		
	}
	for(let i=0;i<in_data.length;i++){
		let value=in_data.charAt(i);
		value=parseInt(value,16);
		if(Math.floor(value/8)==1){cells[i].walls[3]=false;value-=8;}
		if(Math.floor(value/4)==1){cells[i].walls[2]=false;value-=4;}
		if(Math.floor(value/2)==1){cells[i].walls[1]=false;value-=2;}
		if(value==1){cells[i].walls[0]=false;}
		cells[i].sty=nn;
	}	
	redraw();	
}

function draw_maze_image(){
	let data=out.innerHTML;
	if(cells.length==0){return;}
	data=data.split("$");
	data=data[5].split("#");
	data=data[1].trim().split("<br>");
	let act_data=data[1];
	for(let i=0;i<data.length-1;i++){
		act_data+=data[i];
	}
	data=[];
	for(let i=0;i<act_data.length;i++){
		let value=act_data.charAt(i);
		data.push(parseInt(value,16));		
	}
	let pix=5;
	let mw=pix*r;
	let mh=pix*co;
	let x=0;
	let y=0;
	c_maze.width=mw;
	c_maze.height=mh;
	//color: hsl(0, 0%, 100%);
	maze_pic.beginPath;
	for(let i=0;i<data.length;i++){
		let hue=19*data[i];
		maze_pic.fillStyle="hsl("+hue+", 100%, 50%)";
		maze_pic.fillRect(x,y,pix,pix);
		x+=pix;
		if(x==mw){
			x=0;
			y+=pix;
		}
	}
	maze_pic.beginPath;
}
	
// ********************************************************************************************************
//													Renderer
// ********************************************************************************************************

var Renderer = {
	static_objects: [],
	non_static_objects: [],
	
    create_canvas: function (id,width,height,parent){
		let result=new this.canvas(id,width,height,parent);
		this[id]=result;
	},
	
	canvas: function (id,width,height,parent){
	this.id=id;
	this.width=width;
	this.height=height;
	if(parent){this.parent=parent;}else{this.parent=document.body;}
	this.canvas=document.createElement('canvas');
	this.canvas.id=this.id;
	this.canvas.width=this.width;
	this.canvas.height=this.height;
	this.ctx=this.canvas.getContext("2d");
	this.parent.appendChild(this.canvas);
	},
	
	create_div: function (id,parent,_class){
		let result=document.createElement('div');
		if(_class){result.createAttribute("class",_class);}
		if(!parent){parent=document.body;}
		result.id=id;
		parent.appendChild(result);
	},
	
	delete_element: function (id,parent){
		if(!parent){parent=document.body;}
		id=document.getElementById(id);
		parent.removeChild(id);
	},
	
	add_event: function(id,type,fv){
		document.getElementById(id).addEventListener(type,fv);		
	},
	
	add_property: function(id,property,values){
		document.getElementById(id).setAttribute(property,values);
	},
	
	add_pers: function (id,top_y,bottom_y,top_color,middle_color,bottom_color){
		let x=0,y=0;
		let object_id=this.static_objects.length;
		let middle_height=id.height-(top_y+bottom_y);
		//Floor
		x=[0,id.width];y=[id.height-bottom_y,bottom_y]
		let strut=new this.strutcures("Floor",object_id++,x,y,"trapezoid",bottom_color,id);
		this.static_objects.push(strut);
		//this.static_objects["floor"]=strut;
	
		//Ceiling
		x=[0,id.width];y=[0,top_y];
		strut=new this.strutcures("Top",object_id++,x,y,"trapezoid",top_color,id);
		this.static_objects.push(strut);
		//this.static_objects["ceiling"]=strut;

		//Far Wall
		x=[0,id.width];y=[top_y,middle_height];
		strut=new this.strutcures("Far Wall",object_id++,x,y,"trapezoid",middle_color,id);
		this.static_objects.push(strut);
		//this.static_objects["farwall"]=strut;
		id.top=top_y;id.bottom=bottom_y;
	},
	
	strutcures: function (name,id,x,y,shape,color,ctx){
		this.name=name;
		this.id=id;
		this.shape=shape;
		if(!color){this.color="#000000";}else{this.color=color;}
		this.x=x;
		this.y=y;
		this._ctx=ctx.ctx;

		this.draw = function(){
			if(this.id==2){this.color=exit;}
			this._ctx.beginPath();
			this._ctx.fillStyle=this.color;
			if(this.shape=="trapezoid"){
				this._ctx.fillRect(this.x[0],this.y[0],this.x[1],this.y[1]);
			}else if(this.shape=="line"){
				this._ctx.moveTo(this.x[0],this.y[0]);
				this._ctx.lineTo(this.x[1],this.y[1]);
				this._ctx.stroke();		
			}else{
				this._ctx.moveTo(this.x[0],this.y[0]);
				for(let i=1;i<this.x.length;i++){
					this._ctx.lineTo(this.x[i],this.y[i]);
				}
				this._ctx.fill();
				this._ctx.moveTo(this.x[1],this.y[1]);
				this._ctx.lineTo(this.x[1],this.y[2]);
				this._ctx.stroke();
			}
			this._ctx.closePath();
			//this.draw_id();
		}
	},
	
	draw_static: function(){
		for(let i=0;i<this.static_objects.length;i++){
			this.static_objects[i].draw();
		}
	},
}



// ********************************************************************************************************
//													
// ********************************************************************************************************



function pers_test(){
	Renderer.create_div("bob");
	Renderer.create_canvas("bb",1280,360,bob);
	let bb=document.getElementById("bb");
	let top=bb.height*0.45;
	let bottom=bb.height*0.45;
	Renderer.add_pers(Renderer.bb,top,bottom,nn,exit,visited);	
	Renderer.draw_static();
	segmenter(Renderer.bb.canvas,Renderer.bb.top,Renderer.bb.bottom,4,2);
}

function segmenter(id,top_height,bottom_height,segments,step){
	let canvas_height=id.height;
	let x=id.width,y=[];
	for(let i=0;i<segments;i++){
		if(i==0){
			y.push(top_height/step); // 81
			y.push(canvas_height-bottom_height/step); //279
		}else{
			let temp_step=(top_height-y[y.length-2])/step;
			y.push(y[y.length-2]+temp_step); //40,5
			y[y.length-1]=Math.round(y[y.length-1]*100)/100;
			y.push(y[y.length-2]-temp_step);
			y[y.length-1]=Math.round(y[y.length-1]*100)/100;
		}
	}
	Renderer.bb.ctx.beginPath();
	for(let i=0;i<y.length;i++){
		Renderer.bb.ctx.moveTo(0,y[i]);
		Renderer.bb.ctx.lineTo(x,y[i]);
	}
	Renderer.bb.ctx.stroke();
	Renderer.bb.ctx.closePath();
	console.log(y);
}
















































































