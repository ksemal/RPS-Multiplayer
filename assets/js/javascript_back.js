var winsAnsw = ["RockScissors", "PaperRock", "ScissorsPaper"];
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
var losses1 = 0;
var wins1 = 0;
var losses2 = 0;
var wins2 = 0;
var firstAnsw = "";
var secondAnsw = "";
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
      playerId = "2";
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
      $(".entry_val").css("visibility", "hidden");

      database.ref("players/2").on("child_added", function(snapshot) {
        $(".choices1").css("visibility", "visible");
        $(".turn").text("It's your turn");
        $("#name1").css("border", "1px solid black");
      });
    }
  });
  startGame(playerId);
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

function startGame(id) {
  database.ref("players/" + id).on("value", function(snapshot) {
    $("#playerId").text(
      "Hello, " + snapshot.val().name + "! Yor are player# " + id
    );
  });
}

$(".choices1").on("click", "button", function() {
  database.ref("players/1").update({
    choice: $(this).text(),
    losses: losses1,
    wins: wins1
  });
  $(".choices1").css("visibility", "hidden");
  $(".choices2").css("visibility", "hidden");
  $("#name1").css("border", "0px solid black");
  $("#name2").css("border", "1px solid black");
  $(".turn").text("Waiting for your  opponent to choose");
  database.ref("players/1").on("value", function(snapshot) {
    firstAnsw = snapshot.val().choice;
    $("#name1")
      .find(".your_choice")
      .text(snapshot.val().choice);
  });
});

database.ref("players/2").on("value", function(snapshot) {
  if (snapshot.child("choice").exists()) {
    $(".choices1").css("visibility", "visible");
  }
});

$(".choices2").on("click", "button", function() {
  database.ref("players/2").update({
    choice: $(this).text(),
    losses: losses2,
    wins: wins2
  });
  $(".choices1").css("visibility", "hidden");
  $(".choices2").css("visibility", "hidden");
  $("#name1").css("border", "1px solid black");
  $("#name2").css("border", "0px solid black");
  database.ref("players/2").on("value", function(snapshot) {
    secondAnsw = snapshot.val().choice;
    $("#name2")
      .find(".your_choice")
      .text(snapshot.val().choice);
  });

  database.ref("players").on("value", function(snapshot) {
    console.log(wins1, wins2);
    var sum =
      snapshot.child("1").val().choice + snapshot.child("2").val().choice;
    console.log(firstAnsw);
    console.log(secondAnsw);

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
});
database.ref("players/1").on("value", function(snapshot) {
  if (snapshot.child("choice").exists()) {
    $(".choices2").css("visibility", "visible");
  }
});
