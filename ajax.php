<?php
require("vars.php");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	if(isset($_COOKIE[$cookie_name])){
		$id = $_COOKIE[$cookie_name];
		$distance = (int) $_POST['distance'];
		$sql = "INSERT INTO data (id, distance) VALUES ('$id', $distance) ON DUPLICATE KEY UPDATE
		distance = IF(distance < $distance, $distance, distance)";
		$result = $conn->query($sql);
		echo $result;
	}else{
		echo "Could not save the average distance, maybe cookies are disabled?";
	}
}else if($_SERVER['REQUEST_METHOD'] === 'GET'){
	if(!isset($_COOKIE[$cookie_name])) {
		$cookie_value = sha1(uniqid(rand(), true));
		setcookie($cookie_name, $cookie_value, time() + (31556926 * 2), "/"); // 31556926 = 1 year
		$id = $cookie_value;
		//echo "Cookie named '" . $cookie_name . "' is not set!";
	} else {
	    //echo "Cookie '" . $cookie_name . "' is set!<br>\n";
	    //echo "Value is: " . $_COOKIE[$cookie_name]."\n";
		$id = $_COOKIE[$cookie_name];
	}

	$sql = "SELECT AVG(distance) FROM data";
	$result = $conn->query($sql);
	echo $result->fetch_assoc()["AVG(distance)"];
}
//
//
// if ($result->num_rows > 0) {
//     // output data of each row
//     while($row = $result->fetch_assoc()) {
//         echo "id: " . $row["id"]. " - Distance: " . $row["distance"]."<br>";
//     }
// } else {
//     echo "0 results\n";
// }
$conn->close();
