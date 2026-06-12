// LES DUREES EN MINUTES (modifiables)


var durees = {
  pomodoro : 25,
  short    : 5,
  long     : 15
}


// LES VARIABLES DU TIMER


var modeActuel   = 'pomodoro'  // mode en cours
var tempsTotal   = 25 * 60     // temps total en secondes
var tempsRestant = 25 * 60     // temps qui diminue
var enMarche     = false       // est-ce que le timer tourne ?
var monInterval  = null        // pour stocker le setInterval
var nbSessions   = 0           // compteur de pomodoros termines


// AFFICHER LE TEMPS A L'ECRAN


function afficher() {

  // je calcule les minutes et les secondes
  var minutes  = Math.floor(tempsRestant / 60)
  var secondes = tempsRestant % 60

  // j'ajoute un zero si besoin (ex: 4 → 04)
  if (secondes < 10) { secondes = "0" + secondes }
  if (minutes < 10)  { minutes  = "0" + minutes  }

  // je mets a jour l'affichage
  document.getElementById("temps").textContent = minutes + ":" + secondes

  // je calcule le % pour la barre de progression
  var pourcentage = ((tempsTotal - tempsRestant) / tempsTotal) * 100
  document.getElementById("barre").style.width = pourcentage + "%"
}


// BOUTON START / PAUSE


function startPause() {

  // si le timer tourne → on met en pause
  if (enMarche) {
    clearInterval(monInterval)
    enMarche = false
    document.getElementById("btnPrincipal").textContent = "START"

  // sinon → on demarre
  } else {
    enMarche = true
    document.getElementById("btnPrincipal").textContent = "PAUSE"

    // toutes les secondes on enleve 1
    monInterval = setInterval(function() {

      tempsRestant = tempsRestant - 1
      afficher()

      // quand on arrive a 0
      if (tempsRestant <= 0) {
        clearInterval(monInterval)
        enMarche = false
        document.getElementById("btnPrincipal").textContent = "START"

        // si c'etait un pomodoro on incremente le compteur
        if (modeActuel === 'pomodoro') {
          nbSessions = nbSessions + 1
          document.getElementById("nbSessions").textContent = nbSessions
        }

        //  le soN de la fin de 
        jouerSon()

        // on change de mode automatiquement
        if (modeActuel === 'pomodoro') {
          changerMode('short')
        } else {
          changerMode('pomodoro')
        }
      }

    }, 1000)
  }
}


// BOUTON RESET


function reset() {
  // on arrete tout et on remet le temps du mode actuel
  clearInterval(monInterval)
  enMarche = false
  tempsRestant = tempsTotal
  document.getElementById("btnPrincipal").textContent = "START"
  afficher()
}


// CHANGER DE MODE (onglets)


function changerMode(mode) {

  // on arrete le timer si il tourne
  clearInterval(monInterval)
  enMarche = false
  document.getElementById("btnPrincipal").textContent = "START"

  // on met a jour le mode actuel
  modeActuel = mode

  // on met a jour les temps selon le mode
  tempsTotal   = durees[mode] * 60
  tempsRestant = durees[mode] * 60

  // on enleve la classe actif de tous les onglets
  document.getElementById("tabPomodoro").classList.remove("actif")
  document.getElementById("tabShort").classList.remove("actif")
  document.getElementById("tabLong").classList.remove("actif")

  // on ajoute la classe actif sur le bon onglet
  if (mode === 'pomodoro') { document.getElementById("tabPomodoro").classList.add("actif") }
  if (mode === 'short')    { document.getElementById("tabShort").classList.add("actif") }
  if (mode === 'long')     { document.getElementById("tabLong").classList.add("actif") }

  // on met a jour l'affichage
  afficher()
}


// FENETRE PARAMETRES


function ouvrirParametres() {
  // on met les valeurs actuelles dans les champs
  document.getElementById("inputPomodoro").value = durees.pomodoro
  document.getElementById("inputShort").value    = durees.short
  document.getElementById("inputLong").value     = durees.long
  // on met a jour le compteur de sessions dans la modale
  document.getElementById("nbSessions").textContent = nbSessions
  // on affiche la modale
  document.getElementById("overlay").classList.add("ouvert")
}

function fermerParametres() {
  // on cache la modale
  document.getElementById("overlay").classList.remove("ouvert")
}

function sauvegarder() {
  // on recupere les nouvelles valeurs
  durees.pomodoro = parseInt(document.getElementById("inputPomodoro").value) || 25
  durees.short    = parseInt(document.getElementById("inputShort").value)    || 5
  durees.long     = parseInt(document.getElementById("inputLong").value)     || 15

  // on ferme la modale
  fermerParametres()

  // on recharge le mode actuel avec la nouvelle duree
  changerMode(modeActuel)
}


// PLEIN ECRAN


function pleinEcran() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}


// SON DE FIN DE CYCLE

function jouerSon() {
  try {
    var ctx = new AudioContext()

    // les notes : [frequence, debut, duree]
    var notes = [
      [523,  0.00, 0.18],
      [659,  0.20, 0.18],
      [784,  0.40, 0.18],
      [1047, 0.60, 0.30],
      [784,  0.95, 0.18],
      [659,  1.15, 0.18],
      [523,  1.35, 0.50]
    ]

    // on joue chaque note
    for (var i = 0; i < notes.length; i++) {

      var freq  = notes[i][0]
      var debut = notes[i][1]
      var duree = notes[i][2]
      var t     = ctx.currentTime + debut

      // oscillateur principal (son fort)
      var osc1  = ctx.createOscillator()
      var gain1 = ctx.createGain()
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.type = 'triangle'
      osc1.frequency.value = freq
      gain1.gain.setValueAtTime(0.7, t)
      gain1.gain.exponentialRampToValueAtTime(0.001, t + duree)
      osc1.start(t)
      osc1.stop(t + duree)

      // oscillateur harmonique (pour enrichir le son)
      var osc2  = ctx.createOscillator()
      var gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2
      gain2.gain.setValueAtTime(0.25, t)
      gain2.gain.exponentialRampToValueAtTime(0.001, t + duree)
      osc2.start(t)
      osc2.stop(t + duree)
    }

  } catch(e) {
    console.log("son non disponible")
  }
}


// INITIALISATION AU CHARGEMENT DE LA PAGE

afficher()