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
var turn = null;
// var connectionsRef = database.ref("/connections");

// var connectedRef = database.ref(".info/connected");

// connectedRef.on("value", function(snap) {
//   if (snap.val()) {
//     var con = connectionsRef.push(true);
//     con.onDisconnect().remove();
//   }
// });

// connectionsRef.on("value", function(snapshot) {
//   $("#watchers").text(snapshot.numChildren());
// });

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
      $("#name1").css("border", "1px solid black");
      $(".turn").text("Waiting for your  opponent to choose");
    } else {
      database.ref("players/1").set({
        name: $("#playerName").val(),
        losses: losses1,
        wins: wins1
      });
      playerId = "1";
      startGame(playerId);
      $(".entry_val").css("visibility", "hidden");

      // database.ref("players/2").on("child_added", function(snapshot) {
      //   $(".choices1").css("visibility", "visible");
      //   $(".turn").text("It's your turn");
      //   $("#name1").css("border", "1px solid black");
      // });
    }
  });
});

function startGame(id) {
  database.ref("players/" + id).on("value", function(snapshot) {
    $("#playerId").text(
      "Hello, " + snapshot.val().name + "! Yor are player# " + id
    );
  });
  database.ref("players/turn").on("value", function(snapshot) {
    turn = snapshot.val();
    showTurn();
  });
  database.ref("players/").on("value", function(snapshot) {
    if (snapshot.exists()) {
      var obj = snapshot.val();
      var arr = Object.keys(snapshot.val());
      for (let i in arr) {
        // console.log(arr[i]);
        // console.log(obj[arr[i]].name);
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

    if (playerId === "2") {
      var wins = wins1;
      var losses = losses1;
    } else {
      var wins = wins2;
      var losses = losses2;
    }

    database.ref("players/" + playerId).update({
      losses: wins,
      wins: losses
    });
    if (playerId === "2") {
      setTimeout(function() {
        database.ref("players/").update({
          turn: 1
        });
      }, 8000);
    }
  }
}

window.onbeforeunload = function() {
  console.log("you are leaving");
};

$("#newMessage").on("click", addNewMessage);

function addNewMessage(event) {
  event.preventDefault();

  database.ref("players/chat").push({
    name: $("#name" + playerId)
      .find("h3")
      .text(),
    message: $(".message").val(),
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
  $(".message").val("");
}
database
  .ref("players/chat")
  .orderByChild("dateAdded")
  .on("child_added", function(snapshot) {
    $(".chat").append(
      "<p><span>" +
        snapshot.val().name +
        ":  </span><span>" +
        snapshot.val().message +
        "</span></p>"
    );
  });
