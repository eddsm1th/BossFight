var height = window.innerHeight;
var width = window.innerWidth;

var game = new Phaser.Game(1400, 800, Phaser.CANVAS, '', { preload: preload, create: create, update: update});
game.debugMode = true;

function preload(){
	game.load.image('player', 'assets/pokeball.png');
	game.load.image('background', 'assets/background.jpg');
	game.load.image('ground', 'assets/ground.png');
	game.load.image('platform', 'assets/platform.png');
	game.load.image('dmg', 'assets/damageBlock.png');
	game.load.image('dmg2', 'assets/damageBlock2.png');
	game.load.image('healthBar', 'assets/healthBar.png');
	game.load.image('maxHealthBar', 'assets/healthBarMax.png');
	game.load.image('attack', 'assets/attackHitBox.png');
}

var platforms;
var ledges;
var attacks;
var jumpButton;
var leftButton;
var rightButton;
var downButton;
var attackButton;

function create(){
	background = game.add.sprite(0, 0, 'background');

	platforms = game.add.group();
	platforms.enableBody = true;

	ground = platforms.create(0, game.world.height - 60, 'ground');
	ground.body.immovable = true;

	ledges = game.add.group();
	ledges.enableBody = true;

	ledge2 = ledges.create(400, 590, 'platform');
	ledge2.body.immovable = true;
	
	

	player = game.add.sprite(200, 200, 'player');
	game.physics.arcade.enable(player);
	player.body.gravity.y = 4000;
	player.body.collideWorldBounds = true;


	//DAMAGE BLOCKS

	attacks = game.add.group();
	attacks.enableBody = true;

	damageBlock = attacks.create(-200, -200, 'dmg');
	damageBlock.body.collideWorldBounds = true;

	boulder1 = attacks.create(-200, -200, 'dmg2');
	boulder2 = attacks.create(-200, -200, 'dmg2');
	boulder3 = attacks.create(-200, -200, 'dmg2');
	boulder4 = attacks.create(-200, -200, 'dmg2');


	//PLAYER STATS

	maxHealthBar = game.add.sprite(20, 20, 'maxHealthBar');
	healthBar = game.add.sprite(20, 20, 'healthBar');


	jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
	rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
	downButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
	attackButton = game.input.keyboard.addKey(Phaser.Keyboard.W);

	setTimeout(function(){
		getBossAttack();	
	}, 2000)
}

//PLAYER VARIABLES

var allowLedge = false;
var damagable = true;
var controlable = true;
var playerMaxHealth = 1000
var playerHealth = playerMaxHealth;
var direction;
var canAttack = true;
var playerKnockedBack = false;
var allowDoubleJump = false;
var playerAttacking = false;


function update(){

	if ( damageBlock.exists ) {
		if(damageBlock.body.position.x == damageBlock.width * -1){
			damageBlock.kill();
		}		
	}

	if ( attackButton.isDown && canAttack == true ) {

		canAttack = false;
		controlable = false;

		playerAttacking = true;

		attack = game.add.sprite(-40, -40, 'attack');
		attack.position.y = player.body.position.y;

		if ( direction == 1 ) {
			attack.position.x = player.body.position.x + player.width;
			
		} else {
			attack.position.x = player.body.position.x - attack.width;
		}

		setTimeout(function(){
			attack.kill();

			canAttack = true;
			controlable = true;
			playerAttacking = false;
		}, 300)
	}  

	//PLAYER CONTROLS
	var onGround = game.physics.arcade.collide(player, ground);
	
	if ( allowLedge == true && controlable == true ) {
		var onLedge = game.physics.arcade.collide(player, ledges);
	}
	
	var cursors = game.input.keyboard.createCursorKeys();

	if ( onLedge ) {
		allowDoubleJump = false;
	}

	if ( onGround ) {

		allowLedge = false;
		allowDoubleJump = false;
		
		if ( playerKnockedBack ) {
			player.body.velocity.x = 0;

			controlable = true;
			playerKnockedBack = false;
		}

		if ( playerAttacking ) {
			player.body.velocity.x = 0;
		}

	}

	if ( controlable ) {

		player.body.velocity.x = 0;

		if ( leftButton.isDown ) {
			player.body.velocity.x = -400;
			direction = -1;
		} else if ( rightButton.isDown ) {
			player.body.velocity.x = 400;
			direction = 1;
		}

		if ( onLedge && downButton.isDown ){
			canLedge(100);

			allowDoubleJump = true;
		}

		if ( jumpButton.isDown && player.body.touching.down && ( onGround || onLedge ) ) {
			player.body.velocity.y = -1000;

			canLedge(300);

			setTimeout(function(){
				allowDoubleJump = true;	
			},200)
		}

		if ( allowDoubleJump && jumpButton.isDown ) {
			player.body.velocity.y = -1000;
			allowDoubleJump = false;

			canLedge(300);
		}
	}

	if ( damagable ) {
		if ( checkOverlap(player, damageBlock) ) {
			playerTakeDamage(236, -600, -900);
		}

		if ( checkOverlap(player, boulder1) || checkOverlap(player, boulder2) || checkOverlap(player, boulder3) || checkOverlap(player, boulder4) ) {
			playerTakeDamage(112, -800, -1200);
		}
	}


	//ENEMY AI

}
140

function getBossAttack(){
	var atkID;

	console.log('    GETTING BOSS ATTACK')
	atkID = Math.floor(Math.random() * 2);
	// atkID = 1;

	if ( atkID == 0) {
		console.log('WAVE ATTACK');
		attackOne();
	} else if ( atkID == 1 ) {
		console.log('BOULDER ATTACK');
		attackTwo();
	}
}

var attackOneCount = 1;

function attackOne(){
	damageBlock.kill();
	damageBlock = attacks.create(1200, 648, 'dmg');
	damageBlock.body.velocity.x = -1600;

	attackOneCount ++;

	if ( attackOneCount <= 3 ) {
		game.time.events.add(1000, function(){
			attackOne();
		})
	} else {
		attackOneCount = 1;

		game.time.events.add(5000, function(){
			getBossAttack();
		})
	}
}

var boulderOneCanMove = true;
var boulderTwoCanMove = true;
var boulderThreeCanMove = true;
var boulderFourCanMove = true;

function attackTwo(){
	boulder1 = attacks.create(1200, 648, 'dmg2');
		boulder1.body.gravity.y = 2000;
		if ( boulderOneCanMove ) {
			boulder1.body.velocity.y = getRandVelocity();
			boulder1.body.velocity.x = getRandVelocity();
			boulderOneCanMove = false;		
		}

	boulder2 = attacks.create(1200, 648, 'dmg2');
		boulder2.body.gravity.y = 2000;
		if ( boulderTwoCanMove ) {
			boulder2.body.velocity.y = getRandVelocity();
			boulder2.body.velocity.x = getRandVelocity();
			boulderTwoCanMove = false;		
		}
	
	boulder3 = attacks.create(1200, 648, 'dmg2');
		boulder3.body.gravity.y = 2000;
		if ( boulderThreeCanMove ) {
			boulder3.body.velocity.y = getRandVelocity();
			boulder3.body.velocity.x = getRandVelocity();
			boulderThreeCanMove = false;		
		}

	boulder4 = attacks.create(1200, 648, 'dmg2');
		boulder4.body.gravity.y = 2000;
		if ( boulderFourCanMove ) {
			boulder4.body.velocity.y = getRandVelocity() * 1.2;
			boulder4.body.velocity.x = getRandVelocity();
			boulderFourCanMove = false;		
		}

	game.time.events.add(5000, function(){
		boulderOneCanMove = true;
		boulderTwoCanMove = true;
		boulderThreeCanMove = true;
		boulderFourCanMove = true;
		getBossAttack();
	})
}

function getRandVelocity(){
	return (Math.floor(Math.random() * 800) + 600) * -1;
}

function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);

}

function setPlayerHealth(){
	healthPercent = playerHealth/playerMaxHealth;

	if ( healthPercent < 0 ) {
		healthPercent = 0;
	}

	healthBar.scale.setTo(healthPercent, 1);
}

function playerTakeDamage(damageAmount, knockbackX, knockbackY){
	damagable = false;

	playerHealth -= damageAmount;

	setPlayerHealth();

	playerKnockback(knockbackX, knockbackY);

	setTimeout(function(){
		damagable = true;
	}, 1000)
}

function playerKnockback(knockbackX, knockbackY){

	// allowLedge = false;
	controlable = false;

	// player.body.velocity.y = 0;

	player.body.velocity.x = knockbackX;
	player.body.velocity.y = knockbackY;

	console.log('New velocityY: ' + player.body.velocity.y);

	setTimeout(function(){
		playerKnockedBack = true;
	}, 100)
}

function canLedge(delay){
	allowLedge = false;

	setTimeout(function(){
		allowLedge = true;
	}, delay)
}
