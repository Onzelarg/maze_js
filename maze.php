<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
	if($_POST['to_run']!=""){
    $fv=$_POST['to_run'];
	call_user_func($fv);
	}
}

function read(){
	if($_POST["filename"]){$file_name=$_POST["filename"];}else{$file_name="new.txt";}
	$myfile = fopen($file_name, "r+") or die("Unable to open file!");
	while(! feof($myfile)) {
		$line= fgets($myfile);
		$txt .= $line;
	}
	fclose($myfile);
	print $txt;
}

function write(){
	if($_POST["filename"]){$file_name=$_POST["filename"];}else{$file_name="new.txt";}
	$myfile = fopen($file_name, "w") or die("Unable to open file!");
	$txt = $_POST['maze'];
	file_put_contents($file_name,$txt);
	fclose($myfile);
	print "Success";
}


?>
