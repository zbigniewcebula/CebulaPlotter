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
	$gray	= null;
	$user	= null;

	if (isset($_GET["base"])) {
		$base = base64_decode($_GET["base"]);
		$base = json_decode($base, true);
		if (array_key_exists("data", $base)) {
			$_GET["data"]	= $base["data"];
		}
		if (array_key_exists("pal", $base)) {
			$_GET["pal"]	= $base["pal"];
		}
		if (array_key_exists("gray", $base)) {
			$_GET["gray"]	= $base["gray"];
		}
		if (array_key_exists("user", $base)) {
			$_GET["user"]	= $base["user"];
		}
	}

	//Downloading stuff from GET
	if (isset($_GET["data"]) && isset($_GET["pal"])) {
		$data	= fileGet($_GET["data"]);
		$pal	= fileGet($_GET["pal"]);
	}
	if (isset($_GET["gray"])) {
		$gray	= fileGet($_GET["gray"]);
	}
	if (isset($_GET["user"])) {
		$user	= $_GET["user"];
	}
?>
<!-- Yea and here goes HTML -->
<!doctype html>
<html>
	<head>
		<!-- ( ͡° ͜ʖ ͡°) -->
		<meta charset="utf-8">
		<!-- Damn you cache! -->
		<meta http-equiv="cache-control" content="max-age=0" />
		<meta http-equiv="cache-control" content="no-cache" />
		<meta http-equiv="expires" content="0" />
		<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
		<meta http-equiv="pragma" content="no-cache" />

		<!-- Me <3 -->
		<title>CebulaPlotter by zbigniewcebula (2018)</title>
<?php
//Passing downloaded date to JS scripts
echo "<script>";
echo "var USER = null;";
echo "var GRAY = null;";
echo "var DATA = null;";
echo "var PAL = null;";
echo "var SIZE = null;";
echo "var NAME = null;";
if ($data != null && $pal != null) {
	$size	= strlen($data);
	$data	= prepareToParse($data);
	$pal	= prepareToParse($pal);

	echo "DATA = new Array();";
	for($i = 0; $i < count($data); $i += 1) {
		echo "DATA.push(\"" . $data[$i] . "\");";
	}
	echo "PAL = new Array();";
	for($i = 0; $i < count($pal); $i += 1) {
		echo "PAL.push(\"" . $pal[$i] . "\");";
	}
	echo "SIZE = " . $size . ";";
	$name	= explode("/", $_GET["data"]);
	$name	= $name[count($name) - 1];
	echo "NAME = \"" . $name . "\";";
}
if ($gray != null) {
	$gray	= prepareToParse($gray);
	echo "GRAY = new Array();";
	for($i = 0; $i < count($gray); $i += 1) {
		echo "GRAY.push(\"" . $gray[$i] . "\");";
	}
}
if ($user != null) {
	echo "USER = '" . $user . "';";
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
		<script src="generateMesh.js"></script>
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

		<!-- Color disabling/enabling -->
		<div id="colors">
			<table id="colors_table">
				
			</table>
		</div>
	</body>
	<!-- I run this s**t -->
	<script src="main.js"></script>
</html>