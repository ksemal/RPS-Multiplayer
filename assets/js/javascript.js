var config = {
  apiKey: "AIzaSyBj9VmNQmbbEbycdfQw4prUtD_IGjqwO-I",
  authDomain: "myfirstproject-9fc98.firebaseapp.com",
  databaseURL: "https://myfirstproject-9fc98.firebaseio.com",
  projectId: "myfirstproject-9fc98",
  storageBucket: "myfirstproject-9fc98.appspot.com",
  messagingSenderId: "914471269159"
};
firebase.initializeApp(config);

var database = firebase.database();
var playerId = "";
var losses = 0;
var wins = 0;

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
    if (snapshot.child("1").exists() && snapshot.child("2").exists()) {
      $(".entry_val").remove();
    } else if (snapshot.child("1").exists()) {
      database.ref("players/2").set({
        name: $("#playerName").val(),
        losses: losses,
        wins: wins
      });
      playerId = "2";
      $(".entry_val").remove();
    } else {
      database.ref("players/1").set({
        name: $("#playerName").val(),
        losses: losses,
        wins: wins
      });

      playerId = "1";
      $(".entry_val").remove();
    }
  });
  startGame(playerId);
});

database.ref("players/").on("value", function(snapshot) {
  console.log(snapshot.val());
  var obj = snapshot.val();
  var arr = Object.keys(snapshot.val());
  console.log(obj);

  for (let i in arr) {
    console.log(arr[i]);
    console.log(obj[arr[i]].name);
    $("#name" + arr[i])
      .find("h3")
      .text(obj[arr[i]].name);

    $("#name" + arr[i])
      .find("p")
      .text("Losses: " + obj[arr[i]].losses + " Wins: " + obj[arr[i]].wins);
  }
});

function startGame(id) {
  database.ref("players/" + id).on("value", function(snapshot) {
    $("#playerId").text(
      "Hello, " + snapshot.val().name + "! Yor are player# " + id
    );
  });
}

// $("#choice").on("click", "button", function() {
//   database.ref().set({
//     answerPlayer1: $(this).val()
//   });
// });

//     if (
//       snapshot.child("player1").exists() &&
//       snapshot.child("player2").exists()
//     ) {
//       $("name1").text("Player#1" + snapshot.val().player1);
//       $("name2").text("Player#1" + snapshot.val().player2);
//       answer1 = snapshot.val().answer_player1;
//       answer2 = snapshot.val().answer_player2;
//       scoreCount(answer1, answer2);
//     } else {
//       $("name1").text("Player#1" + snapshot.val().player1);
//       $("name2").text("Player#1" + snapshot.val().player2);
//     }
//   },
//   function(errorObject) {
//     console.log("The read failed: " + errorObject.code);
//   }
// );
