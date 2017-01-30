<?php
require("vars.php");

if(!isset($_COOKIE[$cookie_name])) {
	$cookie_value = sha1(uniqid(rand(), true));
	setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day
	$id = $cookie_value;
	//echo "Cookie named '" . $cookie_name . "' is not set!";
} else {
    //echo "Cookie '" . $cookie_name . "' is set!<br>\n";
    //echo "Value is: " . $_COOKIE[$cookie_name]."\n";
	$id = $_COOKIE[$cookie_name];
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$distance = (int) $_POST['distance'];
	$sql = "INSERT INTO data (id, distance) VALUES ('$id', $distance) ON DUPLICATE KEY UPDATE
	distance = IF(distance < $distance, $distance, distance)";
	$result = $conn->query($sql);
	echo $result;
}else if($_SERVER['REQUEST_METHOD'] === 'GET'){
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
