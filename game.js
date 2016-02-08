var game = new Phaser.Game(700, 500, '', Phaser.CANVAS, {preload: preload, create: create, update: update, render: render});

var acting_sprite;

function preload(){
    game.load.image('blue_archer', 'sprites/blue_archer.png');
    game.load.image('blue_knight', 'sprites/blue_knight.png');
    game.load.image('blue_mage', 'sprites/blue_mage.png');
    game.load.image('board', 'sprites/board.png');
    game.load.image('red_archer', 'sprites/red_archer.png');
    game.load.image('red_knight', 'sprites/red_knight.png');
    game.load.image('red_mage', 'sprites/red_mage.png');
    game.load.image('terrain_1', 'sprites/terrain_1.png');
    game.load.image('terrain_2', 'sprites/terrain_2.png');
    game.load.image('terrain_3', 'sprites/terrain_3.png');
    game.load.image('terrain_4', 'sprites/terrain_4.png');
    game.load.image('terrain_5', 'sprites/terrain_5.png');
    game.load.image('terrain_6', 'sprites/terrain_6.png');
    game.load.spritesheet('move_target', 'sprites/move_target.png', 100, 100, 5);
}

function create(){
    game.add.sprite(0, 0, 'board');

    move_targets = game.add.group();

    // "extended sprite"
    MoveTarget = function(game, x, y){
        Phaser.Sprite.call(this, game, x, y, 'move_target');

        this.animations.add('blink');
        this.animations.play('blink', 8, true);
        this.anchor.setTo(0.5);

        this.inputEnabled = true;
        this.input.useHandCursor = true;
        this.events.onInputDown.add(submit_move, this);
    }

    MoveTarget.prototype = Object.create(Phaser.Sprite.prototype);
    MoveTarget.prototype.constructor = MoveTarget;

    for (var i = 0; i < 8; i++) {
        move_target = new MoveTarget(game, 0, 0);
        move_targets.add(game.add.existing(move_target));
        move_targets.setAll('exists', false);
    };

    blue_archer = game.add.sprite(150, 50, 'blue_archer');
    blue_knight = game.add.sprite(350, 50, 'blue_knight');
    blue_mage = game.add.sprite(550, 50, 'blue_mage');
    red_archer = game.add.sprite(550, 450, 'red_archer');
    red_knight = game.add.sprite(350, 450, 'red_knight');
    red_mage = game.add.sprite(150, 450, 'red_mage');

    all_units = [
        blue_archer,
        blue_knight,
        blue_mage,
        red_archer,
        red_knight,
        red_mage
    ];

    for (var i = 0; i < all_units.length; i++) {
        all_units[i].anchor.setTo(0.5);
        all_units[i].health = 2;
        all_units[i].addChild(game.add.text(-4, -12, all_units[i].health, {fontSize: 16}));
    };

    terrain_1 = game.add.sprite(150, 150, 'terrain_1');
    terrain_2 = game.add.sprite(350, 150, 'terrain_2');
    terrain_3 = game.add.sprite(550, 150, 'terrain_3');
    terrain_4 = game.add.sprite(150, 350, 'terrain_4');
    terrain_5 = game.add.sprite(350, 350, 'terrain_5');
    terrain_6 = game.add.sprite(550, 350, 'terrain_6');

    all_terrain = [
        terrain_1,
        terrain_2,
        terrain_3,
        terrain_4,
        terrain_5,
        terrain_6
    ];

    for (var i = 0; i < all_terrain.length; i++) {
        all_terrain[i].anchor.setTo(0.5);
    };

    all_sprites = all_units.concat(all_terrain);
}

function update(){
    for (var i = 0; i < all_units.length; i++) {
        all_units[i].children[0].setText(all_units[i].health);
    };
}

function render(){

}

function occupied(x, y){
    // accepts a point (x, y coords)
    // loop through all sprites, compare coords
    // if point argument matches any sprite coords
    // return true, else false
    for (var i = 0; i < all_sprites.length; i++) {
        if (x === all_sprites[i].x && y === all_sprites[i].y){
            return true;
        }
    };

    return false;
}

function move(unit){
    var n = [unit.x, unit.y - 100];
    var e = [unit.x + 100, unit.y];
    var s = [unit.x, unit.y + 100];
    var w = [unit.x - 100, unit.y];

    var valid_tiles = [];

    if (n[0] >= 0 && n[0] <= game.world.width && n[1] >= 0 && n[1] <= game.world.height && !occupied(n[0], n[1])){
        valid_tiles.push(n);
    }

    if (e[0] >= 0 && e[0] <= game.world.width && e[1] >= 0 && e[1] <= game.world.height && !occupied(e[0], e[1])){
        valid_tiles.push(e);
    }

    if (s[0] >= 0 && s[0] <= game.world.width && s[1] >= 0 && s[1] <= game.world.height && !occupied(s[0], s[1])){
        valid_tiles.push(s);
    }

    if (w[0] >= 0 && w[0] <= game.world.width && w[1] >= 0 && w[1] <= game.world.height && !occupied(w[0], w[1])){
        valid_tiles.push(w);
    }

    acting_sprite = unit;
    add_move_sprites(valid_tiles);
}

function add_move_sprites(tiles){
    for (var i = 0; i < tiles.length; i++) {
        move_targets.getFirstExists(false, false, tiles[i][0], tiles[i][1]);
    };
}

function submit_move(){
    acting_sprite.x = this.x;
    acting_sprite.y = this.y;

    move_targets.setAll('exists', false);
}