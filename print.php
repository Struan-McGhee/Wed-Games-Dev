<?php
    $basename = '';
    $user = '';
    $password = '';

	$db = new PDO ('mysql:host=localhost; dbname='.$basename, $user, $password);
	$req = $db->query("SELECT * FROM game_highscores ORDER BY score DESC LIMIT 10");
	$rank = 1;
	echo '<table border=1>';
    echo '<tr><td>Rank</td><td>Name</td><td>Score</td></tr>';
	while ($values = $req->fetch()) {
	    echo '<tr><td>'.$rank.'</td><td>';
	    echo $values['name'];
	    echo "</td><td>";
	    echo $values['score'];
	    echo '</td></tr>';
	    $rank++;
	}
	echo '</table>';
?>