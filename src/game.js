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
	game.load.image('boss', 'assets/Boss.png');
	game.load.image('enemy', 'assets/Enemy.png');
	game.load.image('heart', 'assets/Heart.png');
	game.load.image('statborder', 'assets/statBackground.png')
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

	ledge2 = ledges.create(500, 590, 'platform');
	ledge2.body.immovable = true;

	//BOSS

	boss = game.add.sprite(1100, 490, 'boss');
	game.physics.arcade.enable(boss);

	//PLAYER

	player = game.add.sprite(200, 200, 'player');
	game.physics.arcade.enable(player);
	player.body.gravity.y = 4000;
	player.body.collideWorldBounds = true;

	attack = game.add.sprite(-40, -40, 'attack');


	//DAMAGE BLOCKS

	attacks = game.add.group();
	attacks.enableBody = true;

	damageBlock = attacks.create(-200, -200, 'dmg');
	damageBlock.body.collideWorldBounds = true;

	boulder1 = attacks.create(-200, -200, 'dmg2');
	boulder2 = attacks.create(-200, -200, 'dmg2');
	boulder3 = attacks.create(-200, -200, 'dmg2');
	boulder4 = attacks.create(-200, -200, 'dmg2');


	//ENEMIES

	enemy = game.add.sprite(700, 676, 'enemy');
	game.physics.arcade.enable(enemy);
	enemy.body.gravity.y = 4000;
	enemy.body.collideWorldBounds = true;

	//PLAYER STATS

	maxHealthBar = game.add.sprite(17, 17, 'statborder');
	healthBar = game.add.sprite(20, 20, 'maxHealthBar');

	maxstaminaBar = game.add.sprite(17, 37, 'statborder');
	staminaBar = game.add.sprite(20, 40, 'healthBar');

	bossMaxHealthBar = game.add.sprite(1027, 17, 'statborder');
	bossMaxHealthBar.scale.setTo(2, 1);
	bossHealthBar = game.add.sprite(1030, 20, 'maxHealthBar');
	bossHealthBar.scale.setTo(2.04, 1);


	heart = game.add.sprite(0, 0, 'heart');

	//CONTROLS

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
var playerMaxStamina = 1000;
var playerStamina = playerMaxStamina;

var direction;
var canAttack = true;
var playerKnockedBack = false;
var allowDoubleJump = false;
var playerAttacking = false;

//ENEMY VARIABLES

var enemyCanJump = true;
var enemyDirection = 0;
var enemyKnockedBack = false;
var enemyHealth = 200;

//BOSS VARIABLES

var bossMaxHealth = 5000;
var bossHealth = bossMaxHealth;
var charging = false;

function update(){

	if ( attackButton.isDown && canAttack ) {
		attack.kill();

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
			attack.position.x = 0;
			attack.position.y = 0;
			
			canAttack = true;
			controlable = true;
			playerAttacking = false;
		}, 150)
	}
	

	var boulderOneBounce = game.physics.arcade.collide(boulder1, ledges);
	var boulderTwoBounce = game.physics.arcade.collide(boulder2, ledges);
	var boulderThreeBounce = game.physics.arcade.collide(boulder3, ledges);

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

			canAttack = true;
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


	//PLAYER TAKING DAMAGE

	if ( damagable ) {

		if ( checkOverlap(player, damageBlock) ) {
			playerTakeDamage(194, -600, -900);
		}

		if ( checkOverlap(player, boulder1) || checkOverlap(player, boulder2) || checkOverlap(player, boulder3) || checkOverlap(player, boulder4) ) {
			playerTakeDamage(112, -800, -1200);
		}

		if ( checkOverlap(player, boss) && charging ) {
			playerTakeDamage(156, -200, -1200);
		}

		if ( checkOverlap(player, enemy) ) {
			playerTakeDamage(58, -500, -500);
		}

	}


	//ENEMY AI
	var enemyOnGround = game.physics.arcade.collide(enemy, ground);

	if ( enemyOnGround ) {
		if ( enemyKnockedBack ) {
			enemyKnockedBack = false;
			enemyCanMove = true;
		}
	}

	if ( player.position.x < enemy.position.x && enemyCanMove ) {
		enemy.body.velocity.x = -150;
		enemyDirection = -1;
	} else if ( player.position.x > enemy.position.x && enemyCanMove ) {
		enemy.body.velocity.x = 150;
		enemyDirection = 1;
	}

	if ( player.position.y + 80 < enemy.position.y && enemyOnGround && enemyCanJump && enemyCanMove ) {

		enemy.body.velocity.y = -700;
		enemyCanJump = false;

		setTimeout(function(){
			enemyCanJump = true;
		}, 1500)
	}

	//ATTACK REGISTRATIONS

	if ( checkOverlap(attack, enemy) ) {
		enemyTakeDamage();
	}

	if ( checkOverlap(attack, boss) ) {
		bossTakeDamage();
	}

	//HEART PICKUP

	if ( checkOverlap(player, heart) ) {
		pickupHeart();
	}
}

function getBossAttack(){
	var atkID;

	atkID = Math.floor(Math.random() * 3);

	if ( atkID == 0) {
		attackOne();
	} else if ( atkID == 1 ) {
		attackTwo();
	} else if ( atkID == 2 ) {
		attackThree();
	}
}

var attackOneCount = 1;

function attackOne(){
	damageBlock.kill();
	damageBlock = attacks.create(1200, 648, 'dmg');
	damageBlock.body.velocity.x = -1200;

	attackOneCount ++;

	if ( attackOneCount <= 3 ) {
		game.time.events.add(1250, function(){
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
			boulder1.body.bounce.set(0.4);
			boulderOneCanMove = false;		
		}

	boulder2 = attacks.create(1200, 648, 'dmg2');
		boulder2.body.gravity.y = 2000;
		if ( boulderTwoCanMove ) {
			boulder2.body.velocity.y = getRandVelocity();
			boulder2.body.velocity.x = getRandVelocity();
			boulder2.body.bounce.set(0.4);
			boulderTwoCanMove = false;		
		}
	
	boulder3 = attacks.create(1200, 648, 'dmg2');
		boulder3.body.gravity.y = 2000;
		if ( boulderThreeCanMove ) {
			boulder3.body.velocity.y = getRandVelocity();
			boulder3.body.velocity.x = getRandVelocity();
			boulder3.body.bounce.set(0.4);
			boulderThreeCanMove = false;		
		}

	game.time.events.add(5000, function(){
		boulderOneCanMove = true;
		boulderTwoCanMove = true;
		boulderThreeCanMove = true;
		boulderFourCanMove = true;
		getBossAttack();
	})
}

function attackThree(){

	setTimeout(function(){
		charging = true;

		boss.body.velocity.x = -400;
		setTimeout(function(){
			boss.body.velocity.x = 400;

			setTimeout(function(){
				boss.body.velocity.x = 0;

				charging = false

				setTimeout(function(){
					getBossAttack();
				}, 5000)

			}, 2700)

		}, 2700)

	},2700)

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
	canAttack = false;

	// player.body.velocity.y = 0;

	player.body.velocity.x = knockbackX;
	player.body.velocity.y = knockbackY;

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

var enemyCanMove = true;
var enemyCanTakeDamage = true;

function enemyTakeDamage(){
	if ( enemyCanTakeDamage ) {
		enemyHealth -= 80 + (Math.random() * 20) - 10;
		enemyCanTakeDamage = false
	}

	enemyKnockBack();

	setTimeout(function(){
		enemyCanTakeDamage = true;
	}, 500)

	if ( enemyHealth <= 0 ) {
		spawnHeart();

		enemy.body.gravity.y = 0;
		enemy.position.x = 1400;
		enemy.position.y = 0;

		setTimeout(function(){
			getNewEnemy();
		}, 10000)
	}
}

function spawnHeart(){
	heart.kill();
	heart = game.add.sprite(enemy.position.x, enemy.position.y, 'heart');
}

function getNewEnemy(){
	enemyHealth = 200;

	enemy.body.gravity.y = 4000;
}

function enemyKnockBack(){
	enemyCanMove = false;
	
	if ( enemyDirection == -1 ) {
		enemy.body.velocity.x = 500;	
	} else {
		enemy.body.velocity.x = -500;
	}
	enemy.body.velocity.y = -500;

	setTimeout(function(){
		enemyKnockedBack = true;
	}, 100)
}

var bossCanTakeDamage = true;

function bossTakeDamage(){
	if ( bossCanTakeDamage ) {
		bossHealth -= 80 + (Math.random() * 20) - 10;
		bossCanTakeDamage = false;
		console.log("    BOSS CAN'T TAKE DAMAGE");

		setBossHealth();

		setTimeout(function(){
			console.log("BOSS CAN TAKE DAMAGE");
			bossCanTakeDamage = true;
		}, 200)
	}
	
	console.log(bossHealth);	
}

function setBossHealth(){
	healthPercent = bossHealth/bossMaxHealth;

	if ( healthPercent < 0 ) {
		healthPercent = 0;
	}

	bossHealthBar.scale.setTo(healthPercent*2, 1);
}

function pickupHeart(){
	playerHealth += 100;

	if ( playerHealth > playerMaxHealth ) {
		playerHealth = playerMaxHealth
	}

	setPlayerHealth();

	heart.position.x = 0;
	heart.position.y = 0;
}
