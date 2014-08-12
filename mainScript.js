var CutClass = (function(w, Kinetic){
	// varables de la imagen recortada
	var rect, imgW, imgH;
	
	//inicializar corte de imagen
	var letsCut = function (cutBtn, endBtn, idImg, idContainer){
		//crear selector del usuario
		var	cutBtn = '#' + cutBtn,
				endBtn = '#' + endBtn,
				idImg = '#' + idImg;

		$(cutBtn).fadeOut(); // ocultar boton de recortar
		$(endBtn).fadeIn();	// mostrar el boton de finalizar recorte
		$(idImg).fadeOut();	//ocultar la imagen, porque los retoques son con canvas

		//creamos la imagen para el canvas
		var urlImg = $(idImg).attr('src');
		var image = new Image();
		image.src = urlImg;

		//cuando la imagen termine de cargarse, creamos el canvas 
		image.onload = function (){
			var	imgWidth = this.width,
					imgHeight = this.height;
			///////////////
			//KINETIC : configuracion de escenario//
			///////////////
			var stage = new Kinetic.Stage({
				container: idContainer, // contenedor del canvas
				width: imgWidth,
				height: imgHeight
			});

			// capa de lienzo : crear imagen sobre canvas
			var	layer = new Kinetic.Layer(),
					imageLayer = new Kinetic.Image({
						x: 0,
						y: 0,
						image: this
					});

			// dibujar la imagen
			layer.add(imageLayer);
			stage.add(layer);

			// dibujar circulos de interaccion
			drawCircles(stage, layer, cutBtn, endBtn);
		};
	};

	// dibujar Circulos con Kinetic
	var drawCircles = function (stage, layer, cutBtn, endBtn){
		var circle1 = new Kinetic.Circle({
			x: 20,
			y: 20,
			radius: 20,
			fill: "#000",
			stroke: "#fff",
			strokeWidth: 2,
			draggable: true // !!OMG!!
		}),
		circle2 = new Kinetic.Circle({
			x: stage.getWidth()-20,
			y: stage.getHeight()-20,
			radius: 20,
			fill: "#000",
			stroke: "#fff",
			strokeWidth: 2,
			draggable: true // !!OMG!!
		});
		var shapes = [circle1, circle2];

		// el recuadro de interaccion solo se crea la primera vez
		if( isEmpty(rect) ){
			drawRect(shapes);
			// dibujar el recuadro de corte
			layer.add(rect);
			layer.draw(); //reseteo el stage con la nueva capa del layer
		}


		for (var i = 0, len = shapes.length; i < len; i++) {
			// cuando el usuario deje de mover el circulo
			shapes[i].on('dragend', function (event){
				//eliminar el rectangulo al soltar el circulo
				if( rect ){
					layer.remove(rect);
				}
				//redibujar el rectangulo
				layer.draw(); //reseteo el stage con la nueva capa del layer
				drawRect(shapes);
				// dibujar el recuadro de corte
				layer.add(rect);
				stage.add(layer);
			});
		}

		// finalizar el recorte
		$(endBtn).on('click', function (event){
			//eliminamos todos los elementos de interaccion del layer
			layer.remove(circle1);
			layer.remove(circle2);
			layer.remove(rect);
			
			// redibujamos la capa con solo la imagen recortada anteriormente
			layer.draw();

			// obtener la informacion de la imagen recortada, 
			var	miCanvas = document.getElementsByTagName('canvas'),
					/* NOTA: kinetic por defecto crea varios canvas (2)
						El que nos interesa es el tercero*/
					ctx = miCanvas[2].getContext('2d'),
					// obtener datos de los pixeles
					datosImagenRecortada = ctx.getImageData(rect.getX(), rect.getY(), -imgW, -imgH),
					trimImgCanvas = miCanvas[3],
					ctx2 = trimImgCanvas.getContext('2d');

			trimImgCanvas.height = datosImagenRecortada.height;
			trimImgCanvas.width = datosImagenRecortada.width;
			// manipular pixeles de la imagen: ctx.putImageData( [imageData], imgPosX, imgPosY);
			ctx2.putImageData(datosImagenRecortada, 0, 0);

			//imagen del canvas en formato Base 64 -> .png
			var dataUrl = trimImgCanvas.toDataURL();
			window.open(dataUrl);
		});

		//volvemos a dibujar los circulos
		layer.add(circle1);
		layer.add(circle2);
		stage.add(layer);
	};

	var drawRect = function (shapes){
		//capturar el espacio a recortar por el usuario
		imgW = shapes[0].getX() - shapes[1].getX();
		imgH = shapes[0].getY() - shapes[1].getY();

		//variable global
		rect = new Kinetic.Rect({
			x: shapes[0].getX(),
			y: shapes[0].getY(),
			width: -imgW,
			height: -imgH,
			fill: "rgba(0, 0, 0, 0.5)"
		});
	};

	var isEmpty = function (str) {
		return (!str || 0 === str.length);
	};

	//PATRON MODULO REVELADO
	return {
		letsCut: letsCut
	};
}(window, Kinetic));