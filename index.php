<?php
	//I don't want server to collapse and create black hole
	set_time_limit(30);

	//CURL <3
	function fileGet($addr) {
		$ch		= curl_init();
		curl_setopt($ch, CURLOPT_URL, $addr);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		$out	= curl_exec($ch);
		curl_close($ch);
		return $out;
	}

	//Parse preparation, easy and fast for later JS processing
	function prepareToParse($str) {
		$str	= addslashes($str);
		$str	= str_replace("\r\n", "\n", $str);
		$str	= str_replace("\r", "\n", $str);
		$str	= str_replace("\t", " ", $str);
		$str	= explode("\n", $str);
		return $str;
	}

	$data	= null;
	$pal	= null;

	//Downloading stuff from GET
	if (isset($_GET["data"]) && isset($_GET["pal"])) {
		$data	= fileGet($_GET["data"]);
		$pal	= fileGet($_GET["pal"]);
	}
?>
<!-- Yea and here goes HTML -->
<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<!-- Me <3 -->
		<title>CebulaPlotter by zbigniewcebula (2018)</title>
<?php
//Passing downloaded date to JS scripts
echo "<script>";
if ($data != null && $pal != null) {
	$size	= strlen($data);
	$data	= prepareToParse($data);
	$pal	= prepareToParse($pal);

	echo "var DATA = new Array();";
	for($i = 0; $i < count($data); $i += 1) {
		echo "DATA.push(\"" . $data[$i] . "\");";
	}
	echo "var PAL = new Array();";
	for($i = 0; $i < count($pal); $i += 1) {
		echo "PAL.push(\"" . $pal[$i] . "\");";
	}
	echo "var SIZE = " . $size . ";";
	$name	= explode("/", $_GET["data"]);
	$name	= $name[count($name) - 1];
	echo "var NAME = \"" . $name . "\";";
} else {
	echo "var DATA = null;";
	echo "var PAL = null;";
	echo "var SIZE = null;";
	echo "var NAME = null;";
}
echo "</script>";

?>
		<!-- includes/imports EVERYWHERE -->
		<script src="three.min.js"></script>
		<!-- my stuff, blyatifull -->
		<script src="declarations.js"></script>
		<script src="functions.js"></script>
		<script src="events.js"></script>
		<script src="threeHelpFuncs.js"></script>
		<script src="loadingFunctions.js"></script>
		<!-- things have to look fancy -->
		<link rel="stylesheet" type="text/css" href="./style.css">
	</head>
	<body>
		<!-- Structure -->
		<div id="container">
		</div>
		<div id="logo_div">
			<a href="http://onionmilk.org">
				<img id="logo" src="./img/onionmilk.png" alt="OnionMilk.org" />
			</a>
		</div>
		<div id="data_div">
			<div id="upload_info"></div>
			<br /><br /><br /><br />
			<div id="parse_info"></div>
			<br /><br /><br /><br />
			<div id="ray_info"></div>
		</div>
		<div id="log"></div>

		<!-- Instruction for people -->
		<div id="controls">
			<table>
				<tr>
					<td>Movement:</td><td>WSAD+QE<br />Arrows+PgUpPgDown</td>
				</tr>
				<tr>
					<td>Look:</td><td>Left Mouse Button + Mouse Movement</td>
				</tr>
				<tr>
					<td>Zoom in/out:</td><td>+ / - / Scroll Wheel</td>
				</tr>
				<tr>
					<td>Camera reset:</td><td>Space</td>
				</tr>
				<tr>
					<td>Generate Random Set:</td><td>` (~)</td>
				</tr>
				<tr><td></td><td></td></tr>
				<tr>
					<td>Scale points:</td><td>&lt;&nbsp;&gt;&nbsp;&nbsp;&nbsp;,&nbsp;.</td>
				</tr>
			</table>
		</div>
	</body>
	<!-- I run this s**t -->
	<script src="main.js"></script>
</html>