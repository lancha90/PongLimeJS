var usuario ='';
var isServer = true;

var main = function(){
	
	window.client = io.connect("http://192.168.3.36:3000/");
	
	usuario=prompt('Inserte su nombre');

	client.on('send', function (data) {
			pong_node.setData(data.posX,data.posY);
		});

	client.on('player', function (data) {
			pong_node.setPosPlayer(data.posY);
		});

	if(usuario!='diego'){
		isServer=false;
	}
}


var sendCoordenadas=function(_posX,_posY){

	window.client.emit('send',{
		posX : _posX,
		posY : _posY
	});
}
var sendPlayer=function(_posY){

	window.client.emit('player',{
		posY : _posY
	});
}


$(document).on("ready",main);