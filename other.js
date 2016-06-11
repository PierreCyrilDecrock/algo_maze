    var container;
    var blendMesh, helper, camera, scene, renderer, controls;
    var lookAtScene = true;

    /////////////////

    var maze = Mazes.create(20,30);

    /////////////////

    var lastNode;
    var visited = [];
    var etape;
    var countStep;
    var done = false;
    var mainRow;
    var mainCol;
    var fov = maze.width;
    var killRecursive;
    var chemin;

    start(maze);

    function start(maze){
        // Réinitialisation des valeurs
        chemin = [];
        lastNode = [];
        etape = [];
        countStep = 0;
        mainRow = 0;
        mainCol = 0;

        for (var i = 1;i<maze.cells.length+1; i++) {
            visited[i] = false;
        }
        done = false;

        // On redessine notre labyrinthe
        $('canvas').remove();
        init(maze);
        animate();

        // Evite la surcharge pour la fonction récursive
        while(!done){
            killRecursive = 0;
            solve(maze,mainRow,mainCol);
        }

        // Dessin solution
        for(var i = 0; i<chemin.length; i++){
            var visite = new THREE.BoxGeometry( 10, 10, 10 );
            var blue = new THREE.MeshLambertMaterial( { color: 0x55acee, overdraw: 0.5 } );
            var bloc = new THREE.Mesh( visite, blue );

            bloc.position.x = chemin[i][1] * 20 - (maze.width)*10 +10;
            bloc.position.y = 10;
            bloc.position.z = chemin[i][0] * 20 - (maze.height)*10 + 10;

            scene.add(bloc);
        }

    }

    function init(maze) {

        scene = new THREE.Scene();

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false });
        renderer.setClearColor( 0xcccccc );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.autoClear = true;

        document.body.appendChild( renderer.domElement );

        var aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera( 45, aspect, 1, 10000 );

        // Adapte la caméra en fonction de la taille du labyrinthe
        if(maze.width - maze.height < 0)
            fov = maze.height;
        camera.position.set( 0, 30*fov, 0 );
        controls = new THREE.OrbitControls( camera );
        controls.target.set( 0, 0, 0 );
        controls.update();



        // Densité du cadrillage
        var step = 20;
        // Taille du cadrillage
        var size = maze.width*10;

        var geometry = new THREE.Geometry();

        for ( var i = - size; i <= size; i += step ) {

            geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
            geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

            geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
            geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

        }

        var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

        var line = new THREE.LineSegments( geometry, material );
        scene.add( line );

        // Cubes

        var vertical_wall = new THREE.BoxGeometry( 3, 20, 20 );
        var horizontal_wall = new THREE.BoxGeometry( 20, 20, 3 );
        var floor_form = new THREE.BoxGeometry( maze.width*20, 1, maze.height*20 );
        var red = new THREE.MeshLambertMaterial( { color: 0xff0000, overdraw: 0.5 } );
        var black = new THREE.MeshLambertMaterial( { color: 0x000000, overdraw: 0.5 } );
        var row = 0;

        var floor = new THREE.Mesh( floor_form, black );
        floor.position.x = 0
        floor.position.y = 0;
        floor.position.z = 0
        scene.add(floor);

        for ( var i = 1; i <= maze.cells.length; i ++ ) {
            // Remplir la première ligne avec des murs en haut
            if(row == 0){
                var top_wall = new THREE.Mesh( horizontal_wall, red );

                top_wall.position.x = (-100+20)+(i-1)*20+((row)*(-2*size)-(maze.width-10)*10)-10;
                top_wall.position.y = 10;
                top_wall.position.z = (-100+10)+row*20-10-(maze.height-10)*10;

                scene.add(top_wall);
            }
            // Mur de droit
            if(maze.cells[i-1].right == true){
                var right_wall = new THREE.Mesh( vertical_wall, red );

                right_wall.position.x = (-100+20)+(i-1)*20+((row)*(-2*size)-(maze.width-10)*10);
                right_wall.position.y = 10;
                right_wall.position.z = (-100+10)+row*20-(maze.height-10)*10;

                scene.add(right_wall);

            }
            // Mur du bas
            if(maze.cells[i-1].down == true){
                var down_wall = new THREE.Mesh( horizontal_wall, red );

                down_wall.position.x = (-100+20)+(i-1)*20+((row)*(-2*size)-(maze.width-10)*10)-10;
                down_wall.position.y = 10;
                down_wall.position.z = (-100+10)+row*20+10-(maze.height-10)*10;

                scene.add(down_wall);

            }
            // Les mur de gauche de la première collone
            if (i % maze.width == 0 && i < maze.cells.length){
                row++;

                var left_wall = new THREE.Mesh( vertical_wall, red );

                left_wall.position.x = (-100+20)+(i-1)*20+((row)*(-2*size)-(maze.width-10)*10);
                left_wall.position.y = 10;
                left_wall.position.z = (-100+10)+row*20-(maze.height-10)*10;

                scene.add(left_wall);
            }

        }


        // Lumières

        var ambientLight = new THREE.AmbientLight( 0x909090 );
        scene.add( ambientLight );

        // Trois lumière pour faire les effet de face sombre
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set(1,0,0);
        scene.add( directionalLight );

        var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.3  );
        directionalLight2.position.set(0,1,0);
        scene.add( directionalLight2 );

        var directionalLight3 = new THREE.DirectionalLight( 0xffffff, 0.1  );
        directionalLight3.position.set(0,0,1);
        scene.add( directionalLight3 );

    }

    function animate() {

        requestAnimationFrame( animate,  renderer.domElement );
        renderer.render( scene, camera );

    }

    //--------------//
    //  Solve Maze  //
    //--------------//

    function solve(maze,row,col) {
        var left = true;
        var right = true;
        var up = true;
        var down = true;
        var countWall = 0;

        //Check de l'existance des murs

        if(col != 0){
            left = maze.cells[row * maze.width + col-1].right;
        }
        if(row != 0){
            up = maze.cells[(row-1) * maze.width + col].down;
        }

        right = maze.cells[row * maze.width + col].right;
        down = maze.cells[row * maze.width + col].down;

        //Check si les cellule voisine ont été visitées
        leftVisited = visited[(row*maze.width)+(col-1)];
        upVisited = visited[((row-1)*maze.width)+(col)];
        rightVisited = visited[(row*maze.width)+(col+1)];
        downVisited = visited[((row+1)*maze.width)+(col)];

        // Est ce qu'on est à la fin ?
        if (row == maze.height-1 && col == maze.width-1) {
            console.log("fini");
            done = true;
            chemin.push([row,col]);
            return;
        }

        // Je marque la cellule actuelle comme visité
        // console.log("position=> ("+row +":"+col+")");
        visited[(row*maze.width)+(col)] = true;
        chemin.push([row,col]);
        countStep++;

        // Je compte le nombre de mur
        if(left == false && leftVisited == false){countWall++;}
        if(right == false && rightVisited == false){countWall++;}
        if(up == false && upVisited == false){countWall++;}
        if(down == false && downVisited == false){countWall++;}


        // J'ajoute le noeu dans la liste
        if(countWall > 1){
            lastNode.push([row,col]);
            etape.push(countStep)
        }

        // Pour éviter la surcharge on sort de la boucle pour y revenir plus tard
        killRecursive++;
        if(killRecursive == 500){
            mainRow = row;
            mainCol = col;
            return;
        }
        // Celon les murs je vais dans une nouvelle direction

        if (left == false && leftVisited == false) {
            // console.log("LEFT");
            return solve(maze,row,col-1);
        }
        if (up == false && upVisited == false) {
            // console.log("UP");
            return solve(maze,row-1,col);
        }
        if (right == false && rightVisited == false) {
            // console.log("RIGHT");
            return solve(maze,row,col+1);
        }
        if (down == false && downVisited == false) {
            // console.log("DOWN");
            return solve(maze,row+1,col);
        }

        // si aucune condition n'est réuni, on revient à la dernière cellule qui avait plusieurs sorties

        row = lastNode[lastNode.length-1][0];
        col = lastNode[lastNode.length-1][1];

        // On l'enlève de la liste
        lastNode.pop();
        // Je supprime toutes les étapes inutile de mon chemin
        countStep = etape.pop();
        while(chemin.length > countStep){
            chemin.pop();
        }

        return solve(maze,row,col);
    }

    THREE.Object3D.prototype.clear = function(){
        var children = this.children;
        for(var i = children.length-1;i>=0;i--){
            var child = children[i];
            child.clear();
            this.remove(child);
        };
    };

    //-------------//
    // Import JSON //
    //-------------//

    JsonObj = null;

    function uploadJSON(evt) {
        var files = evt.target.files;
        f = files[0];
        var reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                JsonObj = JSON.parse(e.target.result);
            };
        })(f);

        reader.readAsText(f);
        scene.clear();
        setTimeout(function(){ start(JsonObj); }, 3000);

    }

    document.getElementById('json').addEventListener('change', uploadJSON, false);

    //-------------//
    // Export JSON //
    //-------------//

    var obj = maze;
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

    var a = document.createElement('a');
    a.href = 'data:' + data;
    a.download = 'mazePC.json';
    a.innerHTML = 'Tu veux le récupérer pour chez toi ? Aller clic !';

    var container = document.getElementById('container');
    container.appendChild(a);
