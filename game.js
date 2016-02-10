var game = new Phaser.Game(700, 500, '', Phaser.CANVAS, {preload: preload, create: create, update: update, render: render});

var acting_sprite,
    target_sprite;

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
    game.load.spritesheet('move_target', 'sprites/move_target.png', 100, 100, 6);
    game.load.spritesheet('hit_target', 'sprites/hit_target.png', 100, 100, 6);
    game.load.spritesheet('rotate_target', 'sprites/rotate_target.png', 100, 100, 6);
}

function create(){
    Phaser.Sprite.prototype.is_terrain = false;
    Phaser.Sprite.prototype.team = 'blue';

    game.add.sprite(0, 0, 'board');

    move_targets = game.add.group();
    hit_targets = game.add.group();
    rotate_targets = game.add.group();

    // "extended sprite"
    Target = function(game, x, y, key){
        Phaser.Sprite.call(this, game, x, y, key);

        this.animations.add('blink');
        this.animations.play('blink', 8, true);
        this.anchor.setTo(0.5);

        this.inputEnabled = true;
        this.input.useHandCursor = true;
    };

    Target.prototype = Object.create(Phaser.Sprite.prototype);
    Target.prototype.constructor = Target;

    MoveTarget = function(game, x, y, key){
        Target.call(this, game, x, y, key);

        this.events.onInputDown.add(submit_move, this);
    };

    MoveTarget.prototype = Object.create(Target.prototype);
    MoveTarget.prototype.constructor = MoveTarget;

    HitTarget = function(game, x, y, key){
        Target.call(this, game, x, y, key);

        this.events.onInputDown.add(submit_hit, this);
    };

    HitTarget.prototype = Object.create(Target.prototype);
    HitTarget.prototype.constructor = HitTarget;

    RotateTarget = function(game, x, y, key){
        Target.call(this, game, x, y, key);

        this.events.onInputDown.add(submit_rotate, this);
    };

    RotateTarget.prototype = Object.create(Target.prototype);
    RotateTarget.prototype.constructor = RotateTarget;

    for (var i = 0; i < 8; i++) {
        move_target = new MoveTarget(game, 0, 0, 'move_target');
        move_targets.add(game.add.existing(move_target));
        move_targets.setAll('exists', false);
    };

    for (var i = 0; i < 3; i++) {
        hit_target = new HitTarget(game, 0, 0, 'hit_target');
        hit_targets.add(game.add.existing(hit_target));
        hit_targets.setAll('exists', false);
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
        all_terrain[i].is_terrain = true;
    };

    for (var i = 0; i < all_terrain.length; i++) {
        rotate_target = new RotateTarget(game, all_terrain[i].x, all_terrain[i].y, 'rotate_target');
        rotate_targets.add(game.add.existing(rotate_target));
        rotate_targets.setAll('exists', false);
    };

    blue_archer = game.add.sprite(150, 50, 'blue_archer');
    blue_knight = game.add.sprite(350, 50, 'blue_knight');
    blue_mage = game.add.sprite(550, 50, 'blue_mage');
    red_archer = game.add.sprite(550, 450, 'red_archer');
    red_archer.team = 'red';
    red_knight = game.add.sprite(350, 450, 'red_knight');
    red_knight.team = 'red';
    red_mage = game.add.sprite(150, 450, 'red_mage');
    red_mage.team = 'red';

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

    all_sprites = all_units.concat(all_terrain);

    game.world.bringToTop(move_targets);
    game.world.bringToTop(hit_targets);
    game.world.bringToTop(rotate_targets);
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

function in_bounds(x, y){
    if (x >= 0 && x <= game.world.width && y >= 0 && y <= game.world.height){
        return true;
    }

    return false;
}

function sprite_from_point(x, y){
    for (var i = 0; i < all_sprites.length; i++) {
        if (all_sprites[i].x === x && all_sprites[i].y === y){
            return all_sprites[i];
        }
    }

    return undefined;
}

function move(unit){
    var n = [unit.x, unit.y - 100];
    var e = [unit.x + 100, unit.y];
    var s = [unit.x, unit.y + 100];
    var w = [unit.x - 100, unit.y];

    var valid_tiles = [];

    if (in_bounds(n[0], n[1]) && !occupied(n[0], n[1])){
        valid_tiles.push(n);
    }

    if (in_bounds(e[0], e[1]) && !occupied(e[0], e[1])){
        valid_tiles.push(e);
    }

    if (in_bounds(s[0], s[1]) && !occupied(s[0], s[1])){
        valid_tiles.push(s);
    }

    if (in_bounds(w[0], w[1]) && !occupied(w[0], w[1])){
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

function knight_attack(unit){
    var n = [unit.x, unit.y - 100];
    var e = [unit.x + 100, unit.y];
    var s = [unit.x, unit.y + 100];
    var w = [unit.x - 100, unit.y];

    var n_sprite = sprite_from_point(n[0], n[1]);
    var e_sprite = sprite_from_point(e[0], e[1]);
    var s_sprite = sprite_from_point(s[0], s[1]);
    var w_sprite = sprite_from_point(w[0], w[1]);

    var valid_tiles = [];

    acting_sprite = unit;

    if (in_bounds(n[0], n[1]) && occupied(n[0], n[1]) && !n_sprite.is_terrain && n_sprite.team !== acting_sprite.team){
        valid_tiles.push(n);
    }

    if (in_bounds(e[0], e[1]) && occupied(e[0], e[1]) && !e_sprite.is_terrain && e_sprite.team !== acting_sprite.team){
        valid_tiles.push(e);
    }

    if (in_bounds(s[0], s[1]) && occupied(s[0], s[1]) && !s_sprite.is_terrain && s_sprite.team !== acting_sprite.team){
        valid_tiles.push(s);
    }

    if (in_bounds(w[0], w[1]) && occupied(w[0], w[1]) && !w_sprite.is_terrain && w_sprite.team !== acting_sprite.team){
        valid_tiles.push(w);
    }

    add_hit_sprites(valid_tiles);
}

function add_hit_sprites(tiles){
    for (var i = 0; i < tiles.length; i++) {
        hit_targets.getFirstExists(false, false, tiles[i][0], tiles[i][1]);
    };
}

function submit_hit(){
    target_sprite = sprite_from_point(this.x, this.y);
    target_sprite.health--;

    hit_targets.setAll('exists', false);
}

function mage_special(){
    rotate_targets.setAll('exists', true);
}

function submit_rotate(){
    target_sprite = sprite_from_point(this.x, this.y);
    target_sprite.angle += 90;

    rotate_targets.setAll('exists', false);
}