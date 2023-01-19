/**
 * Name: Benjamin Po
 * Date: July 27, 2022
 * Section: CSE 154 AB
 *
 * This is the pokedex.js file that is used by all pages in HW3.
 * It provides the funcions neccesary to get data from the web
 * services and display in the pokedex as well as run the pokemon
 * game.
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  let gameID;
  let playerID;
  let myPokemonHP;
  const POKEURL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
  const PLAYER1NUM = 4;
  const LOWHEALTH = 0.2;
  const FULLHP = 100;

  /**
   * Function that initializes the search button when the window
   * loads.
   */
  function init() {
    getPokemonNames();
  }

  /**
   * Fetches information from poke.api and utilizies that data to
   * display information about pokemon that the user searched for
   */
  function getPokemonNames() {
    const urlName = POKEURL + "pokedex.php?pokedex=all";
    fetch(urlName)
      .then(statusCheck)
      .then(res => res.text())
      .then((data) => {
        getPokemonSprites(data);
      })
      .catch(console.error);
  }

  /**
   * Method that takes parameter of all pokemon names and splits it into
   * individual pokemon names, then gets the sprite of all those pokemon
   * from the pokedex api and fills up the pokedex view with all sprites.
   * Makes the three starter pokemon selectable and found.
   * @param {string} pokemonNames - List of all pokemon names in pokedex
   */
  function getPokemonSprites(pokemonNames) {
    const urlSprite = POKEURL + "sprites/";
    let pokedexView = id('pokedex-view');
    let nameArray = pokemonNames.split("\n");
    for (let num = 0; num < nameArray.length; num++) {
      let currentLine = nameArray[num];
      let individualPoke = currentLine.split(":");
      let name = individualPoke[1];
      let pokemonImg = document.createElement('img');
      pokemonImg.src = urlSprite + name + ".png";
      pokemonImg.alt = "Picture of " + name;
      pokemonImg.classList.add('sprite');
      pokedexView.appendChild(pokemonImg);
      if (name === 'bulbasaur' || name === 'charmander' || name === 'squirtle') {
        pokemonImg.classList.add('found');
        pokemonImg.id = name;
        pokemonImg.addEventListener('click', showCard);
      }
    }
  }

  /**
   * Fetches information from the pokedex api and utilizies that data to
   * display information about the pokemon on the cards such as images,
   * type image, weakness image, moves and their images/dp.
   */
  function showCard() {
    let selectedPokemon = this.id;
    const urlCard = POKEURL + "pokedex.php?pokemon=" + selectedPokemon;
    fetch(urlCard)
      .then(statusCheck)
      .then(res => res.json())
      .then((data) => {
        showInfo(data, 0);
        showImages(data, 0);
        showMoves(data, 0);
        extraMove(data, 0);
        moveCount(data, 0);
      });
  }

  /**
   * Method that takes parameter of all pokemon names and splits it into
   * individual pokemon names, then gets the sprite of all those pokemon
   * from the pokedex api and fills up the pokedex view with all sprites.
   * Makes the three starter pokemon selectable and found.
   * @param {string} pokeInfo - Data about the current selected pokemon
   * @param {num} playerNum - List of all pokemon names in pokedex
   */
  function moveCount(pokeInfo, playerNum) {
    let totalMoves = pokeInfo.moves;
    totalMoves = totalMoves.length;
    let allMoves = document.querySelectorAll('button');
    if (playerNum === 0) {
      for (let itr = 0; itr < PLAYER1NUM; itr++) {
        let tempMove = allMoves[itr];
        if (tempMove.classList.contains('hidden') && totalMoves === PLAYER1NUM) {
          tempMove.classList.remove('hidden');
        }
      }
    } else {
      for (let itr = PLAYER1NUM; itr < PLAYER1NUM * 2; itr++) {
        let tempMove = allMoves[itr];
        if (tempMove.classList.contains('hidden') && totalMoves === PLAYER1NUM) {
          tempMove.classList.remove('hidden');
        }
      }
    }
    if (playerNum === 1) {
      let startButton = id('start-btn');
      startButton.classList.add('hidden');
    }
    let backButton = id('endgame');
    backButton.classList.add('hidden');
  }

  /**
   * Method that takes parameter of pokemon data and populates the card
   * and adds information such as the name, health and ability to choose the
   * pokemon to start battling.
   * @param {object} pokeInfo - Data about the current selected pokemon
   * @param {num} playerNum - If the function is making the player 1 or 2 card
   */
  function showInfo(pokeInfo, playerNum) {
    let startButton = id('start-btn');
    if (playerNum === 0) {
      startButton.classList.remove('hidden');
    } else {
      startButton.classList.add('hidden');
    }
    startButton.addEventListener('click', startGameScreen);
    startButton.addEventListener('click', startGame);
    let currentName = document.getElementsByClassName('name');
    let currentDescription = document.getElementsByClassName('info');
    currentName = currentName[playerNum];
    let currentHP = document.getElementsByClassName('hp');
    currentHP = currentHP[playerNum];
    currentDescription = currentDescription[playerNum];
    currentHP.textContent = (pokeInfo.hp + 'HP');
    if (playerNum === 0) {
      myPokemonHP = (pokeInfo.hp + 'HP');
    }
    currentName.textContent = (pokeInfo.name);
    currentDescription.textContent = (pokeInfo.info.description);
  }

  /**
   * Method that begins the game portion of the pokedex by fetching data
   * from the game api. Calls other methods to hide the pokedex, change
   * to game view and fill out the player 2 card.
   */
  function startGame() {
    let urlStart = POKEURL + "game.php";
    let targetPokemon = document.querySelector('h2');
    let targetName = targetPokemon.firstChild.nodeValue;
    targetName = targetName.toLowerCase();
    let pokeData = new FormData();
    pokeData.append('startgame', true);
    pokeData.append('mypokemon', targetName);
    fetch(urlStart, {method: "POST", body: pokeData})
      .then(statusCheck)
      .then(resp => resp.json())
      .then((data) => {
        showInfo(data.p2, 1);
        showImages(data.p2, 1);
        showMoves(data.p2, 1);
        extraMove(data.p2, 1);
        gameID = data.guid;
        playerID = data.pid;
        moveCount(data.p2, 1);
      })
      .catch(console.error);
  }

  /**
   * Method that calls data from the game api when a move is
   * used by the player. Takes parameter of the move name used
   * and makes a call with parameters of game id, player id and
   * move name to update the data regarding hp and move results.
   * Is called everytime a move is made.
   *
   * @param {string} move - String name of the move used by p1
   */
  function moveClicked(move) {
    const urlMove = POKEURL + "game.php";
    let info = new FormData();
    info.append('guid', gameID);
    info.append('pid', playerID);
    info.append('movename', move);
    fetch(urlMove, {method: "POST", body: info})
      .then(statusCheck)
      .then(resp => resp.json())
      .then((data) => {
        results(data);
        health(data);
      })
      .catch(console.error);
  }

  /**
   * Method that updates the health and health bar of the pokemon
   * when they are in game. Ends the game if one pokemon reaches
   * zero health.
   *
   * @param {object} pokeInfo - Object with information about both p1 and p2 pokemon
   */
  function health(pokeInfo) {
    let player1TotalHP = pokeInfo.p1.hp;
    let player2TotalHP = pokeInfo.p2.hp;
    let player1HP = pokeInfo.p1["current-hp"];
    let player2HP = pokeInfo.p2["current-hp"];
    let fleeHandler = pokeInfo.results["p1-move"];
    hpText(player1HP, player2HP);
    if (fleeHandler === 'Flee') {
      player1HP = 0;
    }
    let healthBars = document.getElementsByClassName('health-bar');
    let p1Bar = healthBars[0];
    let p2Bar = healthBars[1];
    let p1Percent = player1HP / player1TotalHP;
    let p2Percent = player2HP / player2TotalHP;
    if (p1Percent <= LOWHEALTH) {
      p1Bar.classList.add('low-health');
    }
    if (p2Percent <= LOWHEALTH) {
      p2Bar.classList.add('low-health');
    }
    p1Bar.style.width = (p1Percent * FULLHP) + '%';
    p2Bar.style.width = (p2Percent * FULLHP) + '%';
    if (player1HP === 0) {
      gameEnd(false);
    } else if (player2HP === 0) {
      gameEnd(true);
      foundPokemon(pokeInfo);
    }
  }

  /**
   * Method that updates the health of both player's pokemon
   * at the top of their card.
   *
   * @param {num} player1HP - Numerical value of player 1 health
   * @param {num} player2HP - Numerical value of player 2 health
   */
  function hpText(player1HP, player2HP) {
    let hpTextDoc = document.getElementsByClassName('hp');
    let p1HP = hpTextDoc[0];
    let p2HP = hpTextDoc[1];
    p1HP.textContent = (player1HP + 'HP');
    p2HP.textContent = (player2HP + 'HP');
  }

  /**
   * Method that updates the pokedex view after the player
   * successfully wins against an undiscovered pokemon. The
   * pokemon will be found and can be used in future games and
   * will no longer appear blacked out in the pokedex view
   *
   * @param {object} pokeInfo - Object with information about both p1 and p2 pokemon
   */
  function foundPokemon(pokeInfo) {
    let name = pokeInfo.p2.shortname;
    let currentImg = document.querySelectorAll('img[alt="Picture of ' + name + '"]');
    currentImg = currentImg[0];
    currentImg.classList.add('found');
    currentImg.id = name;
    currentImg.addEventListener('click', showCard);
  }

  /**
   * Method that ends the game player1 flees or either of the pokemon
   * reach zero health.
   *
   * @param {boolean} victory - Boolean whether player1 won or not
   */
  function gameEnd(victory) {
    disableButtons();
    let title = document.querySelector('h1');
    if (victory) {
      title.textContent = ('You won!');
      let player2 = id('p2-turn-results');
      player2.textContent = '';
    } else {
      title.textContent = ('You lost!');
    }
    let backButton = id('endgame');
    backButton.classList.remove('hidden');
    let fleeButton = id('flee-btn');
    fleeButton.classList.add('hidden');
    backButton.addEventListener('click', endgame);
  }

  /**
   * Helper method that is called when the game is ended by a
   * player reaching zero health or player 1 fleeing. Puts
   * pokedex view back, hides game view, clears results
   * container, resets hp and hides game buttons
   */
  function endgame() {
    resetGameInfo();
    let view = id('pokedex-view');
    view.classList.remove('hidden');
    let endButton = id('endgame');
    endButton.classList.add('hidden');
    let container = id('results-container');
    container.classList.add('hidden');
    let player2 = id('p2');
    player2.classList.add('hidden');
    let hpInfo = document.getElementsByClassName('hp-info');
    hpInfo = hpInfo[0];
    hpInfo.classList.add('hidden');
    let title = document.querySelector('h1');
    title.textContent = ('Your Pokedex');
    let fullHP = document.getElementsByClassName('hp');
    fullHP = fullHP[0];
    fullHP.textContent = myPokemonHP;
    resetButtons();
  }

  /**
   * Helper method that disables all move buttons
   * when game ends
   */
  function disableButtons() {
    let moveButtonsP1 = document.querySelectorAll('button');
    for (let btns = 0; btns < PLAYER1NUM; btns++) {
      let disabledBtns = moveButtonsP1[btns];
      disabledBtns.disabled = true;
    }
  }

  /**
   * Helper method that resets all hidden buttons if a
   * pokemon had less than 4 moves.
   */
  function resetButtons() {
    let buttons = document.querySelectorAll('button');
    let counter = 0;
    for (let num = 0; num < buttons.length; num++) {
      let btn = buttons[num];
      counter++;
      if (btn.id === 'endgame') {
        num = buttons.length;
      }
    }
    for (let num2 = counter; num2 < buttons.length; num2++) {
      let curBtn = buttons[num2];
      if (curBtn.classList.contains('hidden')) {
        curBtn.classList.remove('hidden');
      }
    }
  }

  /**
   * Helper method that clears all results in the results containers
   * and resets the healthbars of both players to full.
   */
  function resetGameInfo() {
    let player1Nodes = id('p1-turn-results');
    let player2Nodes = id('p2-turn-results');
    while (player1Nodes.firstChild) {
      player1Nodes.removeChild(player1Nodes.lastChild);
    }
    while (player2Nodes.firstChild) {
      player2Nodes.removeChild(player2Nodes.lastChild);
    }
    let healthBars = document.getElementsByClassName('health-bar');
    let p1Bar = healthBars[0];
    let p2Bar = healthBars[1];
    p1Bar.style.width = '100%';
    p2Bar.style.width = '100%';
    if (p1Bar.classList.contains('low-health')) {
      p1Bar.classList.remove('low-health');
    }
    if (p2Bar.classList.contains('low-health')) {
      p2Bar.classList.remove('low-health');
    }
    let startButton = id('start-btn');
    startButton.classList.remove('hidden');
  }

  /**
   * Method that updates the results container with information
   * about each move from both players and whether the move hit
   * or missed
   *
   * @param {object} pokeInfo - Object with information about both p1 and p2 pokemon
   */
  function results(pokeInfo) {
    let loadingPic = id('loading');
    loadingPic.classList.add('hidden');
    let player1 = id('p1-turn-results');
    let player2 = id('p2-turn-results');
    player1.classList.remove('hidden');
    player2.classList.remove('hidden');
    let player1Move = pokeInfo.results['p1-move'];
    let player2Move = pokeInfo.results['p2-move'];
    let player1Result = pokeInfo.results['p1-result'];
    let player2Result = pokeInfo.results['p2-result'];
    player1.textContent = 'Player 1 played ' +
    player1Move + ' and ' + player1Result + '! ';
    player2.textContent = 'Player 2 played ' +
    player2Move + ' and ' + player2Result + '! ';
    if (player2Result === null) {
      player2.textContent = '';
    }
  }

  /**
   * Helper method that gets the name of the move used
   * and calls the moveClicked function
   */
  function moveSelected() {
    let loadingPic = id('loading');
    loadingPic.classList.remove('hidden');
    let moveUsed = this.getElementsByClassName('move');
    let moveUsedName = moveUsed[0];
    let moveParam = moveUsedName.firstChild.nodeValue;
    moveParam = moveParam.toLowerCase();
    moveParam = moveParam.replace(/\s+/g, '');
    moveClicked(moveParam);
  }

  /**
   * Method that is called when the game is started and exits
   * the pokedex view and replaces it with the game view. Makes
   * buttons used during the game visible and enables move buttons.
   */
  function startGameScreen() {
    let view = id('pokedex-view');
    view.classList.add('hidden');
    let player2 = id('p2');
    player2.classList.remove('hidden');
    let hpInfo = document.getElementsByClassName('hidden hp-info');
    hpInfo = hpInfo[0];
    hpInfo.classList.remove('hidden');
    let resultsContainer = id('results-container');
    resultsContainer.classList.remove('hidden');
    let fleeButton = id('flee-btn');
    fleeButton.classList.remove('hidden');
    fleeButton.addEventListener('click', () => {
      moveClicked('flee');
    });
    let startButton = id('start-btn');
    startButton.classList.add('hidden');
    let heading = document.querySelector('h1');
    heading.textContent = ('Pokemon Battle!');
    let buttonArray = document.querySelectorAll('button');
    for (let btns = 0; btns < PLAYER1NUM; btns++) {
      let currentBtn = buttonArray[btns];
      currentBtn.disabled = false;
      currentBtn.addEventListener('click', moveSelected);
    }
  }

  /**
   * Method that takes parameter of pokemon data and populates the card
   * with all images such as the pokemon image, weakness image and type
   * image. Calls the pokedex api.
   *
   * @param {object} pokeInfo - Data about the current selected pokemon
   * @param {num} playerNum - If the function is making the player 1 or 2 card
   */
  function showImages(pokeInfo, playerNum) {
    let typeURL = POKEURL + pokeInfo.images.typeIcon;
    let mainURL = POKEURL + pokeInfo.images.photo;
    let weakURL = POKEURL + pokeInfo.images.weaknessIcon;
    let currentType = document.getElementsByClassName('type');
    currentType = currentType[playerNum];
    let currentImage = document.getElementsByClassName('pokepic');
    currentImage = currentImage[playerNum];
    let currentWeaknessIcon = document.getElementsByClassName('weakness');
    currentWeaknessIcon = currentWeaknessIcon[playerNum];
    currentType.src = typeURL;
    currentType.alt = "Type of " + pokeInfo.name;
    currentImage.src = mainURL;
    currentImage.alt = "Photo of " + pokeInfo.name;
    currentWeaknessIcon.src = weakURL;
    currentWeaknessIcon.alt = "Weakness icon of " + pokeInfo.name;
  }

  /**
   * Method that takes parameter of pokemon data and populates the card
   * with all images needed for the move buttons including dp and the type
   * of the move.
   *
   * @param {object} pokeInfo - Data about the current selected pokemon
   * @param {num} playerNum - If the function is making the player 1 or 2 card
   */
  function showMoves(pokeInfo, playerNum) {
    const totalMoves = pokeInfo.moves;
    const urlICon = POKEURL + "icons/";
    if (playerNum === 0) {
      let player = 0;
      showMovesHelper(totalMoves, urlICon, player);
    } else {
      let player = PLAYER1NUM;
      showMovesHelper(totalMoves, urlICon, player);
    }
  }

  /**
   * Helper method that takes parameter of pokemon data and populates the card
   * with all images needed for the move buttons including dp and the type
   * of the move.
   *
   * @param {object} totalMoves - Data about the moves of a pokemon
   * @param {string} urlICon - URL of the pokedex icons api
   * @param {num} player - If the function is making the player 1 or 2 card
   */
  function showMovesHelper(totalMoves, urlICon, player) {
    let currentMove = document.getElementsByClassName('move');
    let currentMoveImg = document.querySelectorAll('img[alt="Pokemon move"]');
    let moveDP = document.getElementsByClassName('dp');
    for (let moveNum = player; moveNum < totalMoves.length + player; moveNum++) {
      moveDP = moveDP[moveNum];
      currentMove = currentMove[moveNum];
      currentMoveImg = currentMoveImg[moveNum];
      let moveType = totalMoves[moveNum - player].type;
      currentMoveImg.src = urlICon + moveType + ".jpg";
      let moveChildren = currentMove.childNodes;
      let dpChildren = moveDP.childNodes;
      for (let dpNum = 0; dpNum < dpChildren.length; dpNum++) {
        moveDP.removeChild(dpChildren[dpNum]);
      }
      for (let nodeNum = 0; nodeNum < moveChildren.length; nodeNum++) {
        currentMove.removeChild(moveChildren[nodeNum]);
      }
      moveDP.textContent = (dpHelper(totalMoves, moveNum - player));
      currentMove.textContent = (totalMoves[moveNum - player].name);
      moveDP = document.getElementsByClassName('dp');
      currentMoveImg = document.querySelectorAll('img[alt="Pokemon move"]');
      currentMove = document.getElementsByClassName('move');
    }
  }

  /**
   * Helper method that checks if the move has a dp value or not.
   *
   * @param {Array} moves - Array of moves of the selected pokemon
   * @param {num} counter - The index of the move being checked
   * @return {dpValue} - the damage the ability deals
   */
  function dpHelper(moves, counter) {
    let dpValue = moves[counter].dp;
    if (isNaN(dpValue)) {
      return "";
    }
    return dpValue + " DP";
  }

  /**
   * Helper method that deals with if the pokemon does not have
   * four moves, hiding the extra move buttons.
   *
   * @param {object} pokeInfo - Data about the selected pokemon
   * @param {num} playerNum - Whether p1 or p2 card is being generated
   */
  function extraMove(pokeInfo, playerNum) {
    const totalMoves = pokeInfo.moves;
    let allBtnMoves = document.querySelectorAll('button');
    if (playerNum === 0) {
      for (let moveNum = totalMoves.length; moveNum < PLAYER1NUM; moveNum++) {
        let p1BtnMoves = allBtnMoves[moveNum];
        p1BtnMoves.classList.add('hidden');
      }
    } else {
      let buttonNum = allBtnMoves.length;
      for (let moves = totalMoves.length; moves < PLAYER1NUM; moves++) {
        let pokeMoveSelected = allBtnMoves[buttonNum - (PLAYER1NUM - moves)];
        if (totalMoves.length < PLAYER1NUM) {
          pokeMoveSelected.classList.add('hidden');
        }
      }
    }
  }

  /**
   * Helper shorthand method for document.getElementById
   * @param {string} idName - Id of tag in HTML
   * @returns {HTMLElement} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

})();