var winsAnsw = ["RockScissors", "PaperRock", "ScissorsPaper"];
var config = {
  apiKey: "AIzaSyD6SjpeTuRlzjE9wlnNB7xeMKK4gHDZvb8",
  authDomain: "game-e1f77.firebaseapp.com",
  databaseURL: "https://game-e1f77.firebaseio.com",
  projectId: "game-e1f77",
  storageBucket: "game-e1f77.appspot.com",
  messagingSenderId: "670933440381"
};
firebase.initializeApp(config);

var database = firebase.database();
var playerId = "";
var losses1 = 0;
var wins1 = 0;
var losses2 = 0;
var wins2 = 0;
var firstAnsw = "";
var secondAnsw = "";
var turn = 0;

var connectionsRef = database.ref("/connections");

var connectedRef = database.ref(".info/connected");

database.ref("players").on("value", function(snapshot) {
  if (snapshot.child("1").exists() && snapshot.child("2").exists()) {
    console.log("both");
    $("#name1")
      .find("h3")
      .text(snapshot.child(1).val().name);
    $("#name2")
      .find("h3")
      .text(snapshot.child(2).val().name);
    $("#name1")
      .find(".W_L")
      .text(
        "Losses: " +
          snapshot.child("1").val().losses +
          " Wins: " +
          snapshot.child("1").val().wins
      );
    $("#name2")
      .find(".W_L")
      .text(
        "Losses: " +
          snapshot.child("2").val().losses +
          " Wins: " +
          snapshot.child("2").val().wins
      );
  } else if (snapshot.child("2").exists() && !snapshot.child("1").exists()) {
    $("#name2")
      .find("h3")
      .text(snapshot.child(2).val().name);
    $("#name2")
      .find(".W_L")
      .text(
        "Losses: " +
          snapshot.child("2").val().losses +
          " Wins: " +
          snapshot.child("2").val().wins
      );
    $("#name1")
      .find("h3")
      .text("Waiting for player #1");
  } else if (snapshot.child("1").exists() && !snapshot.child("2").exists()) {
    $("#name1")
      .find("h3")
      .text(snapshot.child(1).val().name);
    $("#name2")
      .find("h3")
      .text("Waiting for player #2");
    $("#name1")
      .find(".W_L")
      .text(
        "Losses: " +
          snapshot.child("1").val().losses +
          " Wins: " +
          snapshot.child("1").val().wins
      );
  }
});
window.onbeforeunload = function() {
  database.ref("players/" + playerId).remove();
};
connectionsRef.on("child_removed", function(oldChildSnapshot) {
  console.log("connection removed: " + oldChildSnapshot.val());
  restartGame(oldChildSnapshot.val());
});

$("#addName").on("click", function(event) {
  event.preventDefault();
  database.ref("players").once("value", function(snapshot) {
    if (snapshot.child("1").exists()) {
      database.ref("players/2").set({
        name: $("#playerName").val(),
        losses: losses2,
        wins: wins2
      });
      database.ref("players/turn").set(1);
      playerId = "2";
      startGame(playerId);
      $(".entry_val").css("visibility", "hidden");
    } else {
      database.ref("players/1").set({
        name: $("#playerName").val(),
        losses: losses1,
        wins: wins1
      });
      playerId = "1";
      startGame(playerId);
      $(".entry_val").css("visibility", "hidden");
    }
  });
});

function startGame(playerID) {
  console.log(playerID);
  database.ref("players/" + playerID).once("value", function(snapshot) {
    $("#playerId").text(
      "Hello, " + snapshot.val().name + "! Yor are player# " + playerID
    );
    $("#name" + playerID)
      .find("h3")
      .text(snapshot.val().name);

    $("#name" + playerID)
      .find(".W_L")
      .text(
        "Losses: " + snapshot.val().losses + " Wins: " + snapshot.val().wins
      );
  });
  watchConnection(playerID);

  database.ref("players/turn").on("value", function(snapshot) {
    turn = snapshot.val();
    showTurn(playerID);
  });

  $(".choices1, .choices2").on("click", "i", pressedButton);
}

database.ref("players").on("child_removed", function(oldChildSnapshot) {
  database.ref("chat").push({
    name: "service",
    message: oldChildSnapshot.val().name + " has disconnected.",
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
});

function restartGame(id) {
  console.log("RESTART GAME: " + id);
  $(".choices1, .choices2").css("visibility", "hidden");
  database.ref("players/" + id).remove();
  $(".turn").text("Waiting for another player to join");
  $("#name" + id)
    .find("h3")
    .text("Waiting for player#" + id);
  $("#name" + id)
    .find(".W_L")
    .text("");
  $("#name1, #name2").css("border", "0px solid orange");

  database.ref("players").on("value", function(snapshot) {
    if (!snapshot.child("1").exists() && !snapshot.child("2").exists()) {
      database.ref("players").remove();
      database.ref("chat").remove();
      return false;
    }
    if (id === "1" && snapshot.child("2").exists()) {
      database.ref("players/2").update({
        losses: 0,
        wins: 0
      });
      database
        .ref("players/2")
        .child("choice")
        .remove();
    } else if (id === "2" && snapshot.child("1").exists()) {
      database.ref("players/1").update({
        losses: 0,
        wins: 0
      });
      database
        .ref("players/1")
        .child("choice")
        .remove();
    }
  });

  losses1 = 0;
  wins1 = 0;
  losses2 = 0;
  wins2 = 0;
  database.ref("players/turn").set(0);
}

function watchConnection(playerId) {
  connectedRef.on("value", function(snap) {
    if (snap.val()) {
      var con = connectionsRef.push(playerId);
      con.onDisconnect().remove();
    }
  });
}

function pressedButton() {
  database.ref("players/" + playerId).update({
    choice: $(this).attr("data")
  });
  turn++;
  database.ref("players").update({
    turn: turn
  });
}
function showTurn(playerID) {
  console.log("start new game");
  console.log("turn: " + turn);
  console.log("playerID: " + playerID);
  if (turn === 0) {
    $(".choices1, .choices2").css("visibility", "hidden");
    database.ref("players").once("value", function(snapshot) {
      if (snapshot.child("1").exists() && snapshot.child("2").exists()) {
        turn++;
      }
    });
  }
  if (turn === 1) {
    $("#result").text("");
    $("#name1")
      .find(".your_choice")
      .text("");
    $("#name2")
      .find(".your_choice")
      .text("");
    $("#name1").css("border", "5px solid orange");
    $("#name2").css("border", "0px solid orange");
    if (playerId === "1") {
      $(".choices1").css("visibility", "visible");
      $(".choices2").css("visibility", "hidden");
      $(".turn").text("It's your turn");
    } else if (playerId === "2") {
      $(".turn").text("Waiting for your  opponent to choose");
      $(".choices1").css("visibility", "hidden");
      $(".choices2").css("visibility", "hidden");
    }
  } else if (turn === 2) {
    $("#name1").css("border", "0px solid orange");
    $("#name2").css("border", "5px solid orange");

    if (playerId === "1") {
      $(".turn").text("Waiting for your  opponent to choose");
      $(".choices1").css("visibility", "hidden");
      $(".choices2").css("visibility", "hidden");
    } else if (playerId === "2") {
      $(".choices1").css("visibility", "hidden");
      $(".choices2").css("visibility", "visible");
      $(".turn").text("It's your turn");
    }
  } else if (turn === 3) {
    $(".choices2").css("visibility", "hidden");
    database.ref("players").once("value", function(snapshot) {
      var firstAnsw = snapshot.child("1").val().choice;
      var secondAnsw = snapshot.child("2").val().choice;
      $("#name1")
        .find(".your_choice")
        .text(firstAnsw);
      $("#name2")
        .find(".your_choice")
        .text(secondAnsw);
      var sum = firstAnsw + secondAnsw;
      if (firstAnsw === secondAnsw) {
        $("#result").text("Tie Game");
      } else if (winsAnsw.indexOf(sum) >= 0) {
        wins1++;
        losses2++;
        $("#name1")
          .find(".W_L")
          .text("Losses: " + losses1 + " Wins: " + wins1);
        $("#name2")
          .find(".W_L")
          .text("Losses: " + losses2 + " Wins: " + wins2);
        $("#result").text(snapshot.child("1").val().name + " wins!");
      } else {
        losses1++;
        wins2++;
        $("#result").text(snapshot.child("2").val().name + " wins!");
        $("#name1")
          .find(".W_L")
          .text("Losses: " + losses1 + " Wins: " + wins1);
        $("#name2")
          .find(".W_L")
          .text("Losses: " + losses2 + " Wins: " + wins2);
      }
    });

    database.ref("players/1").update({
      wins: wins1,
      losses: losses1
    });
    database.ref("players/2").update({
      wins: wins2,
      losses: losses2
    });

    if (playerId === "2") {
      setTimeout(function() {
        database.ref("players/").update({
          turn: 1
        });
      }, 5000);
    }
  }
}

$("#newMessage").on("click", addNewMessage);

function addNewMessage(event) {
  event.preventDefault();

  database.ref("chat").push({
    id: playerId,
    name: $("#name" + playerId)
      .find("h3")
      .text(),
    message: $(".message").val(),
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
  $(".message").val("");
}
database
  .ref("chat")
  .orderByChild("dateAdded")
  .on("child_added", function(snapshot) {
    if (snapshot.val().name === "") {
      var p = "";
    } else {
      if (snapshot.val().id === "1") {
        var nameSpan = $("<span>")
          .addClass("rose")
          .text(snapshot.val().name + ": ");
      } else if (snapshot.val().id === "2") {
        var nameSpan = $("<span>")
          .addClass("green")
          .text(snapshot.val().name + ": ");
      } else if (snapshot.val().name === "service") {
        var nameSpan = "";
      }
      var messageSpan = $("<span>")
        .addClass("MessageText")
        .text(snapshot.val().message);
      var p = $("<p>").append(nameSpan, messageSpan);
    }
    $(".chat").append(p);
  });
