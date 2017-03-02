<?php
    $basename = '';
    $user = '';
    $password = '';

	$name = htmlspecialchars($_GET['name']);
	$score = $_GET['score'];

	$db = new PDO ('mysql:host=localhost; dbname='.$basename, $user, $password);
	$req = 'INSERT INTO game_highscores (name, score) VALUES ("'.$name.'", "'.$score.'")';
	$db->query($req);
?>