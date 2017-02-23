// create the game object (width : 800px and height : 600px)
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

var player;
var bullets;
var bulletTime = 0;
var ammunition = 10;
var ammunitionText;
var reload;
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

    game.load.image('bg', 'assets/robot/bg.png'); // background
    game.load.image('ground', 'assets/ground.jpg');
    game.load.image('bar', 'assets/bar.png');
    game.load.image('bullet','assets/bullet.png');
    game.load.image('reload', 'assets/star.png');
    game.load.spritesheet('player', 'assets/robot/player.png', 79, 73);
    game.load.spritesheet('enemy', 'assets/robot/enemy.png', 97, 40);

}

function createPlayer() {
    player = game.add.sprite(120, game.world.height - 250, 'player');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    player.body.gravity.y = 350; // the highest the number is the fastest our player will fall down
    player.body.collideWorldBounds = true;

    /* player.animations.add('right', [0, 1], 10, true);
    player.animations.add('up', [2], 10, true); // jump animation */
}

function createRocket(){
    // create a rocket at the right border and at a random height between 0 (the top) and the game height - 100px (the ground height)
    rocket = rockets.create(790, game.rnd.integerInRange(0, game.world.height - 120), 'enemy');
    game.physics.arcade.enable(rocket);

    // give the rocket a random speed
    rocket.body.velocity.x = game.rnd.integerInRange(-300, -50);

    /* rocket.animations.add('enemy', [0, 1], 10, true);
    rocket.animations.play('enemy'); */
}

function createReload(){
    reload = reloads.create(game.rnd.integerInRange(200, game.world.width), 10, 'reload');
    game.physics.arcade.enable(reloads);
    reload.body.velocity.y = 100;
    reload.body.gravity.y = 200;
    reload.body.gravity.x = -30;
    reload.body.bounce.set(0.75);
}

function createTimer(){
    // create a loop calling the function updateScore() every second
    timer = game.time.events.loop(Phaser.Timer.SECOND, updateScore, this);
}

function createLoopRocket(){
    // create a loop sending one rocket per second
    loopRocket = game.time.events.loop(Phaser.Timer.SECOND, createRocket, this);
}

function createLoopReload(){
    loopReload = game.time.events.loop(Phaser.Timer.SECOND*8, createReload, this);
}

function collideRocket (player, rocket) { // when the player collide a rocket ...
    rocket.kill();   // destroy rocket

    healthbar.kill(); // destroy healthbar
    currentLife -= 200; // remove some life
    scaleBarX = (0.002 * currentLife);
    healthbar = bar.create(0, game.world.height - 36, 'bar'); // recreate healthbar
    healthbar.scale.setTo(scaleBarX, 1); // we give it the right width
}

function collideReload (player, reload) {
    reload.kill();
    ammunition += 5;
    ammunitionText.text = 'Ammunition : ' + ammunition; // update ammunition text
}

function collisionHandler (bullet, rocket) {

    //  When a bullet hits a rocket we kill them both
    bullet.kill();
    rocket.kill();

    //  Increase the score
    score += 20;
    scoreText.text = 'Score : ' + score; // rewrite text
}

function updateScore(){
    score += 1;
    scoreText.text = 'Score : ' + score;
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
                bullet.reset(player.x + 20, player.y + 25);
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

    // Here we create the ground
    var ground = platforms.create(0, game.world.height - 83, 'ground');

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    bar = game.add.group();

    healthbar = bar.create(0, game.world.height - 36, 'bar');

    healthbar.scale.setTo(scaleBarX, 1);  // extend the size of the bar so it takes all the width

    rockets = game.add.group();
    rockets.enableBody = true;

    reloads = game.add.group();
    reloads.enableBody = true;

    //  The score
    scoreText = game.add.text(20, 525, 'Score : 0', { fontSize: '32px', fill: '#000' });
    highScoreText = game.add.text(600, 525, 'Best : 0', { fontSize: '32px', fill: '#000' });

    ammunitionText = game.add.text(260, 525, 'Ammunition : ' + ammunition, { fontSize: '32px', fill: '#000' });

    //  Our controls
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Texts displayed at the end
    gameOver = game.add.text(150, 106, '', {fontSize: '50px', fill: '#fff'});
    restartText = game.add.text(150, 320, 'Press Up to jump\nPress Space to shoot\nPress Down to start', {fontSize: '25px', fill: '#fff'});

    
}

function update(){   // one of the three phaser main function

    if (start == 0){ // when the game has not started yet
        if(cursors.down.isDown){ // we launch the game when the user press down
            start = 1;
            createLoopRocket();
            createLoopReload();
            createTimer();
            createPlayer();
            removeText();
        }
    }

    if (score == 3 * counter){ // every three seconds
        game.time.events.remove(loopRocket); // remove rocket loop
        // we create another loop sending more rockets than previously
        loopRocket = game.time.events.loop(Phaser.Timer.SECOND / ((counter + 4) / 4), createRocket, this);
        counter ++;
    }

    //  Collide the player with the platforms
    game.physics.arcade.collide(player, platforms);

    game.physics.arcade.collide(reloads, platforms);

    //  Checks to see if the player overlaps with any of the rockets and if so calls the collide function
    game.physics.arcade.overlap(player, rockets, collideRocket, null, this);

    game.physics.arcade.overlap(bullets, rockets, collisionHandler, null, this);

    game.physics.arcade.overlap(player, reloads, collideReload, null, this);

    if (start == 1){ // when the game start and during all the game

        // Move background
        bg.tilePosition.x -= (score + 150) / 150; // accelerate with time
        
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
        reloads.removeAll();
        healthbar.kill();
        player.kill();
        game.time.events.remove(timer); // stop timer
        game.time.events.remove(loopRocket); // stop rocket loop
        game.time.events.remove(loopReload);
        counter = 1; // reset the counter
        gameOver.text = 'Game Over, your score is ' + score;
        restartText.text = 'Press Down to play again';
        if (score > highScore){
            highScore = score;
            highScoreText.text = 'Score : ' + highScore;
        }
        if (cursors.down.isDown) // restart game
        {
            score = 0; // reset score
            ammunition = 10; // reset ammunition
            ammunitionText.text = 'Ammunition : ' + ammunition; // update ammunition text
            removeText();
            createPlayer();
            createLoopRocket(); // restart rocket loop
            createLoopReload();
            createTimer(); // restart timer
            currentLife = lifeMax;
            scaleBarX = (0.002 * currentLife);
            healthbar = bar.create(0, game.world.height - 36, 'bar');
            healthbar.scale.setTo(scaleBarX, 1);
        }
    }
}