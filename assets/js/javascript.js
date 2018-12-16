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
database.ref("/players").on("value", function(snapshot) {
  if (snapshot.child("2").exists() && !snapshot.child("1").exists()) {
    $("#name2")
      .find("h3")
      .text(snapshot.child(2).val().name);
    $("#name1")
      .find("h3")
      .text("waiting for player #1:");
  } else if (snapshot.child("1").exists() && !snapshot.child("2").exists()) {
    $("#name1")
      .find("h3")
      .text(snapshot.child(1).val().name);
    $("#name2")
      .find("h3")
      .text("waiting for player #2:");
  }
});

connectionsRef.on("child_removed", function(snap) {
  restartGame(snap.val());
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

database.ref("players").on("child_removed", function(oldChildSnapshot) {
  database.ref("chat").push({
    name: "service",
    message: oldChildSnapshot.val().name + " has disconnected.",
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
});

function restartGame(id) {
  $(".choices1, .choices2").css("visibility", "hidden");

  database.ref("players/" + id).remove();

  $(".turn").text("Waiting for another player to join");
  $("#name" + id).html("<h3>Waiting for player#" + id + ":</h3>");
  if (id === "1") {
    database.ref("players/2").update({
      losses: 0,
      wins: 0
    });
  } else {
    database.ref("players/1").update({
      losses: 0,
      wins: 0
    });
  }
  database.ref("players/turn").set(0);

  database.ref("players/" + id).remove();
}

function watchConnection() {
  connectedRef.on("value", function(snap) {
    if (snap.val()) {
      var con = connectionsRef.push(playerId);
      con.onDisconnect().remove();
    }
  });
}

function startGame(id) {
  database.ref("players/" + id).on("value", function(snapshot) {
    $("#playerId").text(
      "Hello, " + snapshot.val().name + "! Yor are player# " + id
    );
  });
  watchConnection(playerId);

  database.ref("players/turn").on("value", function(snapshot) {
    turn = snapshot.val();
    showTurn();
  });

  database.ref("players/").on("value", function(snapshot) {
    if (snapshot.exists()) {
      var obj = snapshot.val();
      var arr = Object.keys(snapshot.val());
      for (let i in arr) {
        $("#name" + arr[i])
          .find("h3")
          .text(obj[arr[i]].name);

        $("#name" + arr[i])
          .find(".W_L")
          .text("Losses: " + obj[arr[i]].losses + " Wins: " + obj[arr[i]].wins);
      }
    }
  });

  $(".choices1, .choices2").on("click", "button", pressedButton);
}

function pressedButton() {
  database.ref("players/" + playerId).update({
    choice: $(this).text()
  });
  turn++;
  database.ref("players").update({
    turn: turn
  });
}
function showTurn() {
  console.log(turn);
  if (turn === 1) {
    $("#result").text("");
    $("#name1")
      .find(".your_choice")
      .text("");
    $("#name2")
      .find(".your_choice")
      .text("");
    $("#name1").css("border", "1px solid black");
    $("#name2").css("border", "0px solid black");
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
    $("#name1").css("border", "0px solid black");
    $("#name2").css("border", "1px solid black");
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
          .addClass("blue")
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
