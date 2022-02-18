"use strict";

// condition pour fonctionnement du jeu.
let game = true;

// stockages toutes les positions des lasers.
let position_laser = [];

// Stockage du nombre de kill.
let nombre_kill = 0;

// variables pour les monstres.
let monster = false;
let position_monster = []; // stockage stats sous forme de dictionnaire.
let total_monster = 0;

// variables pour les météorites.
let meteorite = false;
let position_meteorite = []; // stockage stats sous forme de dictionnaire.

// Dictionnaire stockant les touches, ainsi que s'il elles sont actives ou non.
let touches = {"ArrowUp": false, "z": false,
			   "ArrowDown": false, "s": false,
	           "ArrowLeft": false, "q": false,
	           "ArrowRight": false, "d": false,
	           32: false};



/**
 * Fonction pour calculer la position de l'avion.
 * Cette fonction envera ensuite cette information à la fonction
 * dessin_joueur.
 * @function calc_position
 * @param {canvas} graphique - Le canvas du fichier HTML.
 * @param {array} mouvement - direction vers laquelle se dirige l'avion.
 * @param {array} position_avion - la position actuelle de l'avion.
 * @param canvas_context - context du canvas
 */

function calc_position(graphique, mouvement, position_avion, canvas_context){
	for (let i = 0; i < 2; i++){
		if (position_avion[i] + mouvement[i] <= 590 && position_avion[i] + mouvement[i] >= 10){
			position_avion[i] += mouvement[i];
		}

	}
	dessin_joueur(graphique, position_avion,canvas_context);
}


/**
 * Fonction dessinant l'avion pour chacun des changements
 * de position.
 * @function dessin_joueur
 * @param {canvas} graphique - Le canvas du fichier HTML.
 * @param {array} position_avion - la position actuelle de l'avion.
 * @param canvas_context - context du canvas
 */

function dessin_joueur(graphique, position_avion, canvas_context){

	canvas_context.beginPath();
	canvas_context.globalAlpha = 1;
	canvas_context.strokeStyle = 'white';
	canvas_context.fillStyle='white';
	canvas_context.arc(position_avion[0],position_avion[1],10,0,2*Math.PI);
	canvas_context.fill();
	canvas_context.stroke();
	for(let i = 0; i < 2; i++){
		canvas_context.beginPath();
		if (i == 0){
			canvas_context.fillStyle="red";
			canvas_context.arc(position_avion[0]+6,position_avion[1]-8,4,0,2*Math.PI);
		}else{
			canvas_context.fillStyle="blue";
			canvas_context.arc(position_avion[0]-6,position_avion[1]-8,4,0,2*Math.PI);
		}
		
		canvas_context.fill();
		canvas_context.stroke();
	}
}

/**
 * Fonctions secondaires qui donnent des positions aléatoires
 * utilisées pour les météorites et aliens.
 */

function getRandom_y(){
	return Math.floor(Math.random() * (200 - 10) ,10);
}

function getRandom_x(){
	let temp = 0;
	temp = Math.floor(Math.random() * 2);
	if (temp == 0){
		return 10;
	}else{return 590;}
}

function getRandomPos(){
	return Math.floor(Math.random() * (55 - 15) ,15);
}

/**
 * Fonction principale du programme. La fonction boucle jeu, fait 
 * fonctionner tout le programme.
 * @function boucle_jeu
 * @param {canvas} graphique - Le canvas du fichier HTML.
 * @param {array} mouvement - direction vers laquelle se dirige l'avion.
 * @param {array} position_avion - la position actuelle de l'avion.
 */

function boucle_jeu(graphique, mouvement, position_avion){

	let canvas_context = graphique.getContext("2d");
	canvas_context.clearRect(0,0,graphique.width,graphique.height);

	dessin_laser(graphique,canvas_context);

	nb_monster();

	statistiques(graphique,canvas_context);


	if (game && nombre_kill < 300){
		box_collider(position_avion);

		for(let j = 0; j < position_meteorite.length; j++){
			dessin_meteorite(graphique,j,canvas_context);
		}

		for(let i = 0; i < position_monster.length; i++){
			dessin_monster(graphique,i,canvas_context);
		}

		if(touches.ArrowUp || touches.z){
			calc_position(graphique,[0,-1], position_avion,canvas_context);
		}if(touches.ArrowDown || touches.s){
			calc_position(graphique,[0,1], position_avion,canvas_context);
		}if(touches.ArrowLeft || touches.q){
			calc_position(graphique,[-1,0], position_avion,canvas_context);
		}if(touches.ArrowRight || touches.d){
			calc_position(graphique,[1,0], position_avion,canvas_context);
		}if(touches["32"]){
			position_laser.push({
			position_x: position_avion[0],
			position_y: position_avion[1]-10,
			const_y: position_avion[1],
			vitesse: 1,
			life: true});
			touches["32"] = false;}

		calc_position(graphique,mouvement, position_avion,canvas_context);

	}else if(game == false && nombre_kill < 300){
		gameover(graphique,canvas_context);
	}else if(nombre_kill >= 300){
		gagner(graphique,canvas_context);}
}

/**
 * Affichage du nombre de kills total
 */

function statistiques(graphique,canvas_context){

	canvas_context.globalAlpha = 1;
	canvas_context.fillStyle = "white";
	canvas_context.font = "12px sans-serif";
	if(nombre_kill < 2){
		canvas_context.fillText(nombre_kill + " Alien tué",5,graphique.height-10,500);
	}else{canvas_context.fillText(nombre_kill + " Aliens tués",5,graphique.height-10,500);}
	if(total_monster <2){
		canvas_context.fillText(total_monster + " Alien en vie",graphique.width-80,graphique.height-10,500);	
	}else{canvas_context.fillText(total_monster + " Aliens en vie",graphique.width-92,graphique.height-10,500);}
	

}


function nb_monster(){
	total_monster = 0;
	for(let i = 0; i < position_monster.length; i++){
		if (position_monster[i].life == true){
			total_monster += 1;
		}
	}
	
}

/**
 * Création de la box collider (boite de collision),
 * c'est grace à cette fonction que les aliens disparaissent
 * quand on leur tire dessus ou qu'on meurt quand on percute
 * un alien.
 */

function box_collider(position_avion){

	for(let i = 0; i < position_monster.length; i++){
		if (position_monster[i].life){
			let x = position_monster[i].position_x;
			let y = position_monster[i].position_y;
			for (let j = 0; j < position_laser.length; j++){
				if(position_laser[j].life){
					if (x <= [position_laser[j].position_x] && [position_laser[j].position_x] <= x+20 && y <= [position_laser[j].position_y] && [position_laser[j].position_y] <= y+20){
						position_monster[i].life = false;
						position_laser[j].life = false;
						nombre_kill += 1;
					}
					if (position_avion[0]+10 >= position_laser[j].position_x && position_avion[0]-10 <= position_laser[j].position_x &&
						position_avion[1]-10 <= position_laser[j].position_y && position_avion[1]+10 >= position_laser[j].position_y){
						game = false;
					}
				}
			}
			if ((x <= position_avion[0]+10 && x >= position_avion[0]-10 && y <= position_avion[1]+10 && y >= position_avion[1]-10) ||  
				(x+20 <= position_avion[0]+10 && x+20 >= position_avion[0]-10 && y <= position_avion[1]+10 && y >= position_avion[1]-10) ||
				(x <= position_avion[0]+10 && x >= position_avion[0]-10 && y+20 <= position_avion[1]+10 && y+20 >= position_avion[1]-10) ||
				(x+20 <= position_avion[0]+10 && x+20 >= position_avion[0]-10 && y+20 <= position_avion[1]+10 && y+20 >= position_avion[1]-10)){
				game = false;
			}
		}
	}

	for(let j = 0; j < position_meteorite.length; j++){
		if(position_meteorite[j].life){
			let a = position_meteorite[j].position_x;
			let b = position_meteorite[j].position_y;
			if ((a+5 <= position_avion[0]+10 && a+5 >= position_avion[0]-10 && b+5 <= position_avion[1]+10 && b+5 >= position_avion[1]-10)||
				(a+5 <= position_avion[0]+10 && a+5 >= position_avion[0]-10 && b-5 <= position_avion[1]+10 && b-5 >= position_avion[1]-10)||
				(a-5 <= position_avion[0]+10 && a-5 >= position_avion[0]-10 && b-5 <= position_avion[1]+10 && b-5 >= position_avion[1]-10)||
				(a-5 <= position_avion[0]+10 && a-5 >= position_avion[0]-10 && b+5 <= position_avion[1]+10 && b+5 >= position_avion[1]-10)){
				game = false;

			}
		}
	}
}

/**
 * Fonction de fin de jeu (défaite)
 * elle affichera GAME OVER sur le plateau de jeu. 
 */

function gameover(graphique, canvas_context){

	canvas_context.clearRect(0,0,graphique.width,graphique.height);

	canvas_context.globalAlpha = 1;
	canvas_context.textAlign = "center";
	canvas_context.fillStyle = "white";
	canvas_context.font = "48px sans-serif";
	canvas_context.fillText("GAME OVER",graphique.width/2,graphique.height/2,500);
	canvas_context.font = "12px sans-serif";
	canvas_context.fillText("F5 pour rejouer",graphique.width/2,graphique.height/1.5,500);
	canvas_context.textAlign = "left";
	if(nombre_kill < 2){
	canvas_context.fillText(nombre_kill + " Alien tué",5,graphique.height-10,500);
	}else{canvas_context.fillText(nombre_kill + " Aliens tués",5,graphique.height-10,500);}
}

/**
 * Fonction de fin de jeu (victoire),
 * elle affichera Vous avez gagné sur le plateau de jeu.
 */

function gagner(graphique, canvas_context){

	canvas_context.clearRect(0,0,graphique.width,graphique.height);

	canvas_context.globalAlpha = 1;
	canvas_context.textAlign = "center";
	canvas_context.fillStyle = "white";
	canvas_context.font = "48px sans-serif";
	canvas_context.fillText("Vous avez gagné",graphique.width/2,graphique.height/2,500);
	canvas_context.font = "12px sans-serif";
	canvas_context.fillText("200 aliens tués",graphique.width/2,graphique.height/1.5,500);
}

/**
 * Fonction pour faire avancer le laser. 
 */

function dessin_laser(graphique,canvas_context){

	for (let i = 0; i < position_laser.length; i++){
		if(position_laser[i].life){

			canvas_context.beginPath();
			canvas_context.strokeStyle = 'white';
			canvas_context.globalAlpha = position_laser[i].vitesse;
			canvas_context.moveTo(position_laser[i].position_x,position_laser[i].position_y+10);
			position_laser[i].position_y -= position_laser[i].vitesse;
			position_laser[i].vitesse -= 0.0015;
			canvas_context.lineTo(position_laser[i].position_x,position_laser[i].position_y);
			canvas_context.fill();
			canvas_context.closePath();
			canvas_context.stroke();


			if((position_laser[i].const_y - position_laser[i].position_y) > 300){
			position_laser[i].life = false;
			}
		}
	}
 }

/**
 * Fonction pour fabriquer et faire avancer les monstres.
 */

function dessin_monster(graphique,i,canvas_context){

	if (position_monster[i].life){

		let y1 = getRandomPos()/100;
		let x1 = (y1*4);

		// On cherche à savoir si l'alien se trouve sur le mur de droite ou de gauche
		// pour savoir dans quelle direction ira-t-il.

		// Ici l'alien a spawn à droite, il ira donc à gauche.
		if (position_monster[i].mur_x == 590){
			// on cherche à savoir s'il faut changer cette position, c'est à dire,
			// que si l'alien de à atteint son côté opposé, il faudra changer la 
			// position de mur_y.
			if (position_monster[i].position_x < 10){
				position_monster[i].position_x = 590;
			}

			if (position_monster[i].mur_y == 0){
				// déplacement des aliens tout en prenant en compte l'accélération gagnée
				position_monster[i].position_y += (y1 + y1 * (position_monster[i].acceleration*0.10));
			}else{
				position_monster[i].position_y -= (y1 + y1 * (position_monster[i].acceleration*0.10));}

			position_monster[i].position_x -= (x1 + x1 * (position_monster[i].acceleration*0.10));
		}
		// Ici l'alien a spawn à gauche, il ira donc à droite.
		if (position_monster[i].mur_x == 10){
			if (position_monster[i].position_x > 590){
				position_monster[i].position_x = 10;
			}

			if (position_monster[i].mur_y == 0){
				position_monster[i].position_y += (y1 + y1 * (position_monster[i].acceleration*0.10));
			}else{position_monster[i].position_y -= (y1 + y1 * (position_monster[i].acceleration*0.10));}

			position_monster[i].position_x += (x1 + x1 *(position_monster[i].acceleration*0.10));
		}
		// Ici on va voir si oui ou non un vaisseau à toucher un côté en haut ou en bas
		// dans ce cas, on changer sa direction.
		if (position_monster[i].position_y > 590 && position_monster[i].mur_y == 0){
			position_monster[i].acceleration = position_monster[i].acceleration + 1;
			position_monster[i].mur_y = 1;
			if(position_monster[i].acceleration >= 3){
				position_monster[i].couleur = "red";
			}else{position_monster[i].couleur = "yellow";}
		}else if (position_monster[i].position_y < 10 && position_monster[i].mur_y == 1){
			position_monster[i].acceleration = position_monster[i].acceleration + 1;
			position_monster[i].mur_y = 0;
			if(position_monster[i].acceleration >= 3){
				position_monster[i].couleur = "red";
			}else{position_monster[i].couleur = "green";}
		}

		canvas_context.beginPath();
		canvas_context.globalAlpha = 1;
		canvas_context.fillStyle = position_monster[i].couleur;
		canvas_context.fillRect(position_monster[i].position_x,
								position_monster[i].position_y,
								20,20);
		canvas_context.fill();
		canvas_context.closePath();
		canvas_context.stroke();

	}
}

/**
 * création des météorites et mise en fonctionnement 
 */

function dessin_meteorite(graphique,j,canvas_context){
	if (position_meteorite[j].life){
		if (position_meteorite[j].mur == 590){
			position_meteorite[j].position_x -= 1;
			position_meteorite[j].position_y += 2;
		}else{
			position_meteorite[j].position_x += 1;
			position_meteorite[j].position_y += 2;	
		}
		if (position_meteorite[j].position_y > 590){
			position_meteorite[j].life = false;
		}

		canvas_context.beginPath();
		canvas_context.globalAlpha = 1;
		canvas_context.fillStyle = "brown";
		canvas_context.arc(position_meteorite[j].position_x,
								position_meteorite[j].position_y,
								10,0,2*Math.PI);
		canvas_context.fill();
		canvas_context.closePath();
		canvas_context.stroke();
	}
}

/**
 * Initialisation du dictionnaire monster dans lequel on
 * retrouve les informations de tous les monstres. 
 */

function ini_monster(){

	if (monster && game){

	let x_monster = getRandom_x();
	let y_monster = getRandom_y();
	position_monster.push({
		position_x: x_monster,
		position_y: y_monster,
		couleur: "green",
		acceleration: 0,
		mur_x:x_monster,
		mur_y: 0,
		life: true
		});
	}
}

/**
 * Initialisation du dictionnaire meteorite dans lequel on
 * retrouve les informations de toutes les météorites. 
 */

function ini_meteorite(){
	if (game && meteorite){
		let x_meteorite = getRandom_x();
		let y_meteorite = getRandom_y();
		position_meteorite.push({
			position_x: x_meteorite,
			position_y: y_meteorite,
			mur:x_meteorite,
			life: true
		});
	}
}

/**
 * Fonction qui permet au programme de fonctionner
 * car dés le lancement du navigateur, cette fonction
 * sera active. 
 */


window.onload = function() {

	const graphique = document.getElementById("game_area");

	let mouvement = [0,0]; // mouvement de l'avion
	let position_avion = [300,590]; // position avion

	window.setInterval(() => boucle_jeu(graphique, mouvement, position_avion), 1);
	// création d'un monstre à chaque intervalle
	window.setInterval(() => ini_monster(),2000);
	// création d'une météorite à chaque intervalle
	window.setInterval(() => ini_meteorite(), 3000);

	
	//fonction qui se lance lorsqu'une touche est pressée. /active les touches/.
	window.onkeydown = function(touche_down){
		if (touche_down.key in touches){ 
			meteorite = true; // mise en route des obstacles
			monster = true; // mise en route des obstacles
			touches[touche_down.key] = true;
		}if (touche_down.keyCode in touches){
			touches[touche_down.keyCode] = true;
		}
	};

	//fonction qui se lance lorsqu'une touche est lachée.  /desactive les touches/.
	window.onkeyup = function(touche_up){
		if (touche_up.key in touches){ 
			touches[touche_up.key] = false;
		}if (touche_up.keyCode in touches){
			touches[touche_up.keyCode] = false;
		}
	};
};