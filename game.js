// create the game object (width : 800px and height : 600px)
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

var player;
var bullets;
var bulletTime = 0;
var ammunition = 10;
var ammunitionText;
var reload;
var health;
var cursors;
var fireButton;
var rockets;
var drills;
var platforms;
var bar; // health bar
var lifeMax = 1000;
var currentLife = lifeMax;
var scaleBarX = 2; // factor to extend the bar
var time = 0;
var score = 0;
var titleText;
var scoreText;
var gameOver; // text
var restartText;
var controlsText;
var storyText1;
var storyText2;
var storyText3;
var timer;
var loopDrill;
var loopRocket;
var loopHealth;
var loopReload;
var counter = 1; // related to the number of rockets that appear
var start = 0; // 0 means the game isn't started yet

function preload() { // one of the three phaser main function

    game.load.image('bg', 'assets/bg.png'); // background
    game.load.image('bg2', 'assets/bg2.png');
    game.load.image('bg3', 'assets/bg3.png');
    game.load.image('bg4', 'assets/bg4.png');
    game.load.image('bg5', 'assets/bg5.png');
    game.load.image('ground', 'assets/ground.jpg');
    game.load.image('bar', 'assets/bar.png');
    game.load.image('bullet','assets/bullet.png');
    game.load.image('reload', 'assets/ammo.png');
    game.load.image('health', 'assets/health.png');
    game.load.spritesheet('player', 'assets/player.png', 79, 73);
    game.load.spritesheet('drill', 'assets/drill.png', 97, 40);
    game.load.spritesheet('rocket', 'assets/rocket.png', 151, 40);
    game.load.text('part1', 'part1.txt');
    game.load.text('part2', 'part2.txt');
    game.load.text('part3', 'part3.txt');

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

function createDrill(){
    // create a drill at the right border and at the ground height
    drill = drills.create(790, game.world.height - 122, 'drill');
    game.physics.arcade.enable(drill);

    // give the drill a random speed
    drill.body.velocity.x = game.rnd.integerInRange(-300, -50);
}

function createRocket(){
    // create a rocket at the right border and at a random height between 0 (the top) and the game height - 200px
    rocket = rockets.create(790, game.rnd.integerInRange(0, game.world.height - 200), 'rocket');
    game.physics.arcade.enable(rocket);

    rocket.body.velocity.x = game.rnd.integerInRange(-300, -50);
}

function createReload(){
    reload = reloads.create(game.rnd.integerInRange(200, game.world.width), 10, 'reload');
    game.physics.arcade.enable(reloads);
    reload.body.velocity.y = 100;
    reload.body.gravity.y = 200;
    reload.body.gravity.x = -30;
    reload.body.bounce.set(0.75);
}

function createHealth(){
    health = healths.create(game.rnd.integerInRange(200, game.world.width), 10, 'health');
    game.physics.arcade.enable(healths);
    health.body.velocity.y = 100;
    health.body.gravity.y = 200;
    health.body.gravity.x = -30;
    health.body.bounce.set(0.75);
}

function createTimer(){
    // create a loop calling the function updateScore() every second
    timer = game.time.events.loop(Phaser.Timer.SECOND, updateScore, this);
}

function createLoopDrill(){
    // create a loop sending one drill per second
    loopDrill = game.time.events.loop(Phaser.Timer.SECOND, createDrill, this);
}

function createLoopRocket(){
    loopRocket = game.time.events.loop(Phaser.Timer.SECOND*2, createRocket, this);
}

function createLoopReload(){
    loopReload = game.time.events.loop(Phaser.Timer.SECOND*8, createReload, this);
}

function createLoopHealth(){
    loopHealth = game.time.events.loop(Phaser.Timer.SECOND*14, createHealth, this);
}

function collideDrill (player, drill) { // when the player collide a drill ...
    drill.kill();   // destroy drill
    healthbar.kill(); // destroy healthbar
    currentLife -= 200; // remove some life
    scaleBarX = (0.002 * currentLife);
    healthbar = bar.create(0, game.world.height - 36, 'bar'); // recreate healthbar
    healthbar.scale.setTo(scaleBarX, 1); // we give it the right width
}

function collideRocket (player, rocket) {
    rocket.kill();
    healthbar.kill();
    currentLife -= 200;
    scaleBarX = (0.002 * currentLife);
    healthbar = bar.create(0, game.world.height - 36, 'bar');
    healthbar.scale.setTo(scaleBarX, 1);
}

function collideReload (player, reload) {
    reload.kill();
    ammunition += 5;
    ammunitionText.text = 'Ammunition : ' + ammunition; // update ammunition text
}

function collideHealth (player, health) {
    health.kill();
    healthbar.kill();
    currentLife += 200; // give some life back
    if (currentLife > lifeMax){
        currentLife = lifeMax;
    }
    scaleBarX = (0.002 * currentLife);
    healthbar = bar.create(0, game.world.height - 36, 'bar'); // recreate healthbar
    healthbar.scale.setTo(scaleBarX, 1); // we give it the right width
}


function collisionHandler (bullet, enemy) {

    //  When a bullet hits an enemy we kill them both
    bullet.kill();
    enemy.kill();

    //  Increase the score
    score += 10;
    scoreText.text = 'Score : ' + score; // rewrite text
}

function updateScore(){
    score += 1;
    scoreText.text = 'Score : ' + score;
    time +=1;
}

function removeText() {
    gameOver.text = '';
    restartText.text = '';
    titleText.text = '';
    storyText3.text = '';
    controlsText.text = '';

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

    //  Load backgrounds
    bg = game.add.tileSprite(0, 0, 800, 600, 'bg');

    bg2 = game.add.tileSprite(0, 0, 800, 600, 'bg2');
    bg2.alpha = 0; // set the transparency to 0

    bg3 = game.add.tileSprite(0, 0, 800, 600, 'bg3');
    bg3.alpha = 0;

    bg4 = game.add.tileSprite(0, 0, 800, 600, 'bg4');
    bg4.alpha = 0;

    bg5 = game.add.tileSprite(0, 0, 800, 600, 'bg5');
    bg5.alpha = 0;

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

    drills = game.add.group();
    drills.enableBody = true;

    rockets = game.add.group();
    rockets.enableBody = true;

    reloads = game.add.group();
    reloads.enableBody = true;

    healths = game.add.group();
    healths.enableBody = true;

    //  The score
    scoreText = game.add.text(20, 525, 'Score : 0', { fontSize: '32px', fill: '#000' });

    ammunitionText = game.add.text(260, 525, 'Ammunition : ' + ammunition, { fontSize: '32px', fill: '#000' });

    //  Our controls
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    titleText = game.add.text(180, 20, 'Robot Runner', {font: '50px Revalia', fill: '#fff'});
    var part1 = game.cache.getText('part1');
    storyText1 = game.add.text(50, 150, part1, {font: '15px Revalia', fill: '#fff'});
    var part2 = game.cache.getText('part2');
    storyText2 = game.add.text(20, 300, part2, {font: '15px Revalia', fill: '#fff'});
    storyText3 = game.add.text(70, 150, '', {font: '15px Revalia', fill: '#fff'});

    // Texts displayed at the end
    gameOver = game.add.text(120, 200, '', {font: '30px Revalia', fill: '#fff'});
    restartText = game.add.text(225, 450, 'Press Up to continue', {font: '25px Revalia', fill: '#fff'});
    controlsText = game.add.text(220, 350, '', {font: '25px Revalia', fill: '#fff'});



}

function update(){   // one of the three phaser main function

    if (start === 0){ // when the game is on the first page of story
        if(cursors.up.isDown){  // we switch to second page of story and controls
            start = 1;
            restartText.text = '';
            controlsText.text = '  Press Up to jump\nPress Space to shoot\n Press Down to start';
            storyText1.text = '';
            storyText2.text = '';
            var part3 = game.cache.getText('part3');
            storyText3.text = part3;
        }
    }

    if (start === 1){ // when the game has not started yet
        if(cursors.down.isDown){ // we launch the game when the user press down
            start = 2;
            createLoopDrill();
            createLoopRocket();
            createLoopReload();
            createLoopHealth();
            createTimer();
            createPlayer();
            removeText();
        }
    }

    if (time == 3 * counter){ // every three seconds
        game.time.events.remove(loopDrill); // remove drill loop
        // we create another loop sending more drills than previously
        loopDrill = game.time.events.loop(Phaser.Timer.SECOND / ((counter + 15) / 30), createDrill, this);
        game.time.events.remove(loopRocket);
        loopRocket = game.time.events.loop(Phaser.Timer.SECOND / ((counter + 15) / 15), createRocket, this);
        counter ++;
    }

    //fade in the new backgrounds
    if (score >= 50){
        game.add.tween(bg2).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, false);

        if (score >= 150){
            game.add.tween(bg3).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, false);

            if (score >= 250){
                game.add.tween(bg4).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, false);

                if (score >= 400){
                    game.add.tween(bg5).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, false);
                }
            }
        }
    }

    //  Collide the player with the platforms
    game.physics.arcade.collide(player, platforms);

    game.physics.arcade.collide(reloads, platforms);

    game.physics.arcade.collide(healths, platforms);

    //  Checks to see if the player overlaps with any of the drills and if so calls the collide function
    game.physics.arcade.overlap(player, drills, collideDrill, null, this);

    game.physics.arcade.overlap(bullets, drills, collisionHandler, null, this);

    game.physics.arcade.overlap(player, rockets, collideRocket, null, this);

    game.physics.arcade.overlap(bullets, rockets, collisionHandler, null, this);

    game.physics.arcade.overlap(player, reloads, collideReload, null, this);

    game.physics.arcade.overlap(player, healths, collideHealth, null, this);

    if (start === 2){ // when the game start and during all the game

        // Move background
        bg.tilePosition.x -= (score + 150) / 150; // accelerate with time
        bg2.tilePosition.x -= (score + 150) / 150;
        bg3.tilePosition.x -= (score + 150) / 150;
        bg4.tilePosition.x -= (score + 150) / 150;
        bg5.tilePosition.x -= (score + 150) / 150;
        
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
        start = 1;
        drills.removeAll();
        rockets.removeAll();
        reloads.removeAll();
        healths.removeAll();
        healthbar.kill();
        player.kill();
        game.time.events.remove(timer); // stop timer
        game.time.events.remove(loopDrill); // stop drill loop
        game.time.events.remove(loopRocket);
        game.time.events.remove(loopHealth);
        game.time.events.remove(loopReload);
        counter = 1; // reset the counter
        gameOver.text = 'Game Over, your score is ' + score;
        restartText.text = 'Press Down to retry';

        if (cursors.down.isDown) // restart game
        {
            score = 0; // reset score
            time = 0;
            ammunition = 10; // reset ammunition
            ammunitionText.text = 'Ammunition : ' + ammunition; // update ammunition text
            currentLife = lifeMax;
            scaleBarX = (0.002 * currentLife);
            healthbar = bar.create(0, game.world.height - 36, 'bar');
            healthbar.scale.setTo(scaleBarX, 1);
            game.tweens.removeAll();
            bg2.alpha = 0; //reset background transparency
            bg3.alpha = 0;
            bg4.alpha = 0;
            bg5.alpha = 0;

        }
    }
}