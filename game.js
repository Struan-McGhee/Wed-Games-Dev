// create the game object (width : 800px and height : 600px)
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

var player;
var bullets;
var bulletTime = 0;
var ammunition = 10;
var ammunitionText;
var cursors;
var fireButton;
var rockets;
var platforms;
var bar; // health bar
var lifeMax = 1000;
var currentLife = lifeMax;
var scaleBarX = 2; // factor to extend the bar
var score = 0;
var scoreText;
var gameOver; // text
var restartText;
var timer;
var loopRocket;
var highScore = 0;
var highScoreText;
var counter = 1; // related to the number of rockets that appear
var start = 0; // 0 means the game isn't started yet

function preload() { // one of the three phaser main function

    game.load.image('bg', 'assets/bg.jpg'); //background
    game.load.image('ground', 'assets/ground.jpg');
    game.load.image('bar', 'assets/bar.png');
    game.load.image('bullet','assets/bullet.png');
    game.load.spritesheet('yoshi', 'assets/yoshi.png', 36, 34);
    game.load.spritesheet('bill', 'assets/bill.png', 28, 20);

}

function createPlayer() {
    player = game.add.sprite(120, game.world.height - 150, 'yoshi');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    player.body.gravity.y = 300; // the highest the number is the fastest our player will fall down
    player.body.collideWorldBounds = true;

    player.animations.add('right', [0, 1], 10, true);
    player.animations.add('up', [2], 10, true); // jump animation
}

function createRocket(){
    // create a rocket at the right border and at a random height between 0 (the top) and the game height - 100px (the ground height)
    rocket = rockets.create(790, game.rnd.integerInRange(0, game.world.height - 100), 'bill');
    game.physics.arcade.enable(rocket);

    // give the rocket a random speed
    rocket.body.velocity.x = game.rnd.integerInRange(-300, -50);

    rocket.animations.add('bill', [0, 1], 10, true);
    rocket.animations.play('bill');
}

function createTimer(){
    // create a loop calling the function updateScore() every second
    timer = game.time.events.loop(Phaser.Timer.SECOND, updateScore, this);
}

function createLoopRocket(){
    // create a loop sending one rocket per second
    loopRocket = game.time.events.loop(Phaser.Timer.SECOND, createRocket, this);
}

function collideRocket (player, rocket) { // when the player collide a rocket ...
    rocket.kill();   // destroy the rocket

    healthbar.kill(); // destroy the healthbar
    currentLife -= 200; // remove some life
    scaleBarX = (0.002 * currentLife);
    healthbar = bar.create(0, game.world.height - 36, 'bar'); // recreate the healthbar
    healthbar.scale.setTo(scaleBarX, 1); // we give it the right width
}

function collisionHandler (bullet, rocket) {

    //  When a bullet hits a rocket we kill them both
    bullet.kill();
    rocket.kill();

    //  Increase the score
    score += 20;
    scoreText.text = 'Score : ' + score; // rewrite the text
}

function updateScore(){
    score += 1;
    scoreText.text = 'Score : ' + score; // rewrite the text
}

function removeText() {
    gameOver.text = '';
    restartText.text = '';

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            if (ammunition > 0){
                //  And fire it
                bullet.reset(player.x + 20, player.y + 20);
                bullet.body.velocity.x = 400;
                bulletTime = game.time.now + 200;

                ammunition--; // decrease ammunition
                ammunitionText.text = 'Ammunition : ' + ammunition; // update ammunition text
            }
        }
    }
}

function create() { // one of the three phaser main function

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    bg = game.add.tileSprite(0, 0, 800, 600, 'bg');

    //  The platforms group contains the ground
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true); // kill if outside the bounds of game

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 95, 'ground');

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    bar = game.add.group();

    healthbar = bar.create(0, game.world.height - 36, 'bar');

    healthbar.scale.setTo(scaleBarX, 1);  // extend the size of the bar so it takes all the width

    rockets = game.add.group();
    rockets.enableBody = true;

    //  The score
    scoreText = game.add.text(20, 520, 'Score : 0', { fontSize: '32px', fill: '#000' });
    highScoreText = game.add.text(600, 520, 'Best : 0', { fontSize: '32px', fill: '#000' });

    ammunitionText = game.add.text(260, 520, 'Ammunition : ' + ammunition, { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Texts displayed at the end
    gameOver = game.add.text(150, 106, '', {fontSize: '50px', fill: '#fff'});
    restartText = game.add.text(150, 350, 'Press Down to start', {fontSize: '25px', fill: '#fff'});

    
}

function update(){   // one of the three phaser main function

    if (start == 0){ // when the game has not started yet
        if(cursors.down.isDown){ // we launch the game when the user press down
            start = 1;
            createLoopRocket();
            createTimer();
            createPlayer();
            removeText();
        }
    }

    if (score == 3 * counter){ // every three seconds
        game.time.events.remove(loopRocket); // remove the rocket loop
        // we create another loop sending more rockets than previously
        loopRocket = game.time.events.loop(Phaser.Timer.SECOND / ((counter + 3) / 3), createRocket, this);
        counter ++;
    }

    //  Collide the player with the platforms
    game.physics.arcade.collide(player, platforms);

    //  Checks to see if the player overlaps with any of the rockets and if so calls the collide function
    game.physics.arcade.overlap(player, rockets, collideRocket, null, this);

    game.physics.arcade.overlap(bullets, rockets, collisionHandler, null, this);

    if (start == 1){ // when the game start and during all the game

        // Move the background
        bg.tilePosition.x -= (score + 100) / 100; // accelerate with the time
        
        if (cursors.up.isDown) // allow to jump
        {
            player.body.velocity.y = -200;

            player.animations.play('up');
        }
        else 
        {
            player.animations.play('right');
        }

        if (fireButton.isDown)
        {
            fireBullet();
        }
    }

    if (currentLife <= 0){ // when life is over
        rockets.removeAll();
        healthbar.kill();
        player.kill();
        game.time.events.remove(timer); // stop the timer
        game.time.events.remove(loopRocket); // stop the rocket loop
        counter = 1; // reset the counter
        gameOver.text = 'Game Over, your score is ' + score;
        restartText.text = 'Press Down to try again';
        if (score > highScore){
            highScore = score;
            highScoreText.text = 'Score : ' + highScore;
        }
        if (cursors.down.isDown) // restart the game
        {
            removeText();
            createPlayer();
            score = 0; // reset the score
            createLoopRocket(); // restart the rocket loop
            createTimer(); // restart the timer
            currentLife = lifeMax;
            scaleBarX = (0.002 * currentLife);
            healthbar = bar.create(0, game.world.height - 36, 'bar');
            healthbar.scale.setTo(scaleBarX, 1);
        }
    }
}