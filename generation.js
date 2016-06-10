// Objet général qui regroupera toutes nos foncitonnalitées
var Mazes = (function() {

    // Objet Cellule
    function Cell() {
        // On décide si oui on non la cellule a un mur pour chaque côté (true = un mur)
        // Au début chaque cellule est totalement fermé
        this.down = true;
        this.right = true;
    }

    // Objet Labyrinthe
    function Maze(width, height) {
        this.width = width;
        this.height = height;

        // Le paramètre "cells" va contenir un tableau de toutes les cellules de notre labyrinthe
        // On en crée donc autant qu'il en faut en fonction de la taille de notre labyrinthe
        this.cells = [];
        for (var i = 0; i < width * height; i++) {
            this.cells[i] = new Cell();
        }

        // Le paramètre "at" permet de récupérer une cellule plus facilement en fonction des lignes et colonnes du labyrinthe
        this.at = function(row, column) {
            return this.cells[row * this.width + column];
        }
    }

    // Construction du labyrinthe
    function eller(width, height) {
        // Création d'un nouveau labyrinthe
        var maze = new Maze(width, height);

        var L = [];
        var R = [];

        // initialisation
        for (var c = 0; c < width; c++) {
            L[c] = c;
            R[c] = c;
        }

        // Pour chaque ligne du labyrinthe sauf la dernière
        for (var r = 0; r < height - 1; r++) {
            // Et pour chaque colonne de la ligne
            // console.log("--------- Ligne : "+r+" ----------");
            for (var c = 0; c < width; c++) {
                // Est ce que je connecte la cellule avec celle adjacente ?
                // Si -> ce n'est pas la dernière cellule
                //    -> la cellule suivante est différente
                //    -> le random est OK
                // console.log("[Case "+ c +"]");

                if (c != width-1 && c+1 != R[c] && Math.random() < 0.5) {
                    // console.log("* J'ouvre un mur (case+1 != R["+c+"])");

                    R[L[c+1]] = R[c];
                    L[R[c]] = L[c+1];
                    R[c] = c+1;
                    L[c+1] = c;

                    // console.log("  ==> R: "+R+"\n  ==> L: "+L);

                    // On casse les murs (#1989)
                    maze.at(r, c).right = false;
                }

                // Est ce que je connecte la cellule avec celle en dessous ?
                if (c != R[c] && Math.random() < 0.5) {
                    R[L[c]] = R[c];
                    L[R[c]] = L[c];
                    R[c] = c;
                    L[c] = c;
                    // console.log("* No passage bottom (case != R["+c+"]):\n  ==> R: "+ R+"\n  ==> L: "+ L);


                } else {
                    // On casse encore les murs
                    maze.at(r, c).down = false;
                }
            }

        }

        // Conditin spécial pour la dernière ligne
        for (var c = 0; c < width; c++) {
            if (c != width-1 && c+1 != R[c] && (c == R[c] || Math.random() < 0.5)) {
                R[L[c+1]] = R[c];
                L[R[c]] = L[c+1];
                R[c] = c+1;
                L[c+1] = c;

                maze.at(height-1, c).right = false;
            }

            R[L[c]] = R[c];
            L[R[c]] = L[c];
            R[c] = c;
            L[c] = c;
        }

        // Sortie du labyrinthe
        maze.at(height-1, width-1).right = false;

        return maze;
    }

    return {
        create: eller
    }
})();
