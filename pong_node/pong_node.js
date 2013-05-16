//set main namespace
goog.provide('pong_node');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.RoundedRect');
goog.require('lime.Circle');
goog.require('lime.scheduleManager');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');


// entrypoint
pong_node.start = function(){

    this.playerY = 0;
    this.RADIUS = 20;
    this.SPEED = .3;
    this.WIDTH = 600;
    this.HEIGHT = 400;

    this.WIDTH_PLAYER = 10;
    this.HEIGHT_PLAYER = 50;

    this.winning_score = 10;

    //Se define el stage
    var stage = new lime.Director(document.body,this.WIDTH,this.HEIGHT);

    //Se define la escena que se va mostrar en pantalla
    var scene = new lime.Scene();

    //Se definen el background ----------------------------------------------
    this.background = new lime.Layer().setPosition(0,0);
    this.img_background = new lime.RoundedRect().setSize(this.WIDTH,this.HEIGHT).setFill('assets/bg.jpg').setPosition(0,0).setAnchorPoint(0,0);

    this.background.appendChild(this.img_background);

    //Se define la capa de juego ---------------------------------------------
    this.game = new lime.Layer().setPosition(0,0);
    this.player_1 = new lime.RoundedRect().setSize(this.WIDTH_PLAYER*2,this.HEIGHT_PLAYER*2).setFill('assets/p1.png').setPosition(20,100);
    this.player_2 = new lime.RoundedRect().setSize(this.WIDTH_PLAYER*2,this.HEIGHT_PLAYER*2).setFill('assets/p2.png').setPosition(580,100);
    this.ball = new lime.Circle().setSize(this.RADIUS * 2, this.RADIUS * 2).setFill('assets/ball.png').setPosition(300,200);

    this.game.appendChild(this.player_1);
    this.game.appendChild(this.player_2);
    this.game.appendChild(this.ball);

    //Se define la capa de puntajes ------------------------------------------
    this.points = new lime.Layer().setPosition(0,0);
    
    this.lbl_left = new lime.Label().setText('0').setFontFamily('Verdana').
    setFontColor('#c00').setFontSize(16).setFontWeight('bold').setSize(150,30).setPosition(100,20);

    this.lbl_rigth = new lime.Label().setText('0').setFontFamily('Verdana').
    setFontColor('#c00').setFontSize(16).setFontWeight('bold').setSize(150,30).setPosition(500,20);

    this.points.appendChild(this.lbl_left);
    this.points.appendChild(this.lbl_rigth);

    //Se adicionan los eventos para mover los elementos ----------------------

    var dragPlayer = function(e){
        var position = this.getPosition();
        e.startDrag(true,new goog.math.Box(0,position.x, 600, position.x));
    };

    if(isServer){
        goog.events.listen(this.player_1,['mousedown','touchstart'],dragPlayer);
    }else{
        goog.events.listen(this.player_2,['mousedown','touchstart'],dragPlayer);
    }
    
    //se adicionan las capas a la escena -------------------------------------
    scene.appendChild(this.background);
    scene.appendChild(this.game);
    scene.appendChild(this.points);

    // Se pone la escena en el stage con transicion -----------------------------------
    stage.replaceScene(scene,lime.transitions.Dissolve,2);
    this.bg_size=this.img_background.getSize()

    //Se define un vector para la rotacion de la bola
    if(isServer){
        lime.scheduleManager.schedule(pong_node.animar,this);
        this.v = new goog.math.Vec2(Math.random() * .5, -.8).normalize();
    }
}

pong_node.setData=function(x,y){

    this.ball.setPosition(x,y);
}
pong_node.setPosPlayer=function(y){

    if(isServer){
        this.player_2.setPosition(this.player_2.getPosition().x,y);
    }else{
        this.player_1.setPosition(this.player_1.getPosition().x,y);
    }
}

pong_node.setPlayer=function(y){

    if(Math.abs(this.playerY-y) > 20){
        this.playerY = y;
        sendPlayer(y);
    }

}


pong_node.animar =function(dt){

    var delta =dt * this.SPEED;
    var pos = this.ball.getPosition();
    
    pos.x += this.v.x * delta;
    pos.y += this.v.y * delta;

    if(pos.x < 30+this.RADIUS && pos.y > this.player_1.getPosition().y-this.HEIGHT_PLAYER && pos.y < this.player_1.getPosition().y+this.HEIGHT_PLAYER){
        this.v.x *= -1;
        pos.x = 30+this.RADIUS;
    } else if(pos.x > this.bg_size.width-(30+this.RADIUS) && pos.y > this.player_2.getPosition().y-this.HEIGHT_PLAYER && pos.y < this.player_2.getPosition().y+this.HEIGHT_PLAYER){
        this.v.x *= -1;
        pos.x = this.bg_size.width-(30+this.RADIUS);
    } else if (pos.x < this.RADIUS) {
            // bounce off left wall
            this.v.x *= -1;
            pos.x = this.RADIUS;

            //Se le agregan los puntos al marcador
            this.lbl_rigth.setText(parseInt(this.lbl_rigth.getText())+this.winning_score)
        } else if (pos.x > this.bg_size.width - this.RADIUS) {
            // bounce off right wall
            this.v.x *= -1;
            pos.x = this.bg_size.width - this.RADIUS;

            //Se le agregan los puntos al marcador
            this.lbl_left.setText(parseInt(this.lbl_left.getText())+this.winning_score)
        }

        //Verifica que no supere los limites en Y
        if (pos.y < this.RADIUS) {
            // bounce off left wall
            this.v.y *= -1;
            pos.y = this.RADIUS;
        }
        else if (pos.y > this.bg_size.height - this.RADIUS) {
            // bounce off right wall
            this.v.y *= -1;
            pos.y = this.bg_size.height - this.RADIUS;
        }     

        sendCoordenadas(pos.x,pos.y);

        this.ball.setPosition(pos);
    }

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('pong_node.start', pong_node.start);