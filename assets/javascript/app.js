$(document).ready(function () {

    // firebase config
    var config = {
        apiKey: "AIzaSyCnIQMlvdKoINPnmhqB6AtAImcqFwUnzMo",
        authDomain: "trainschedules-1c06e.firebaseapp.com",
        databaseURL: "https://trainschedules-1c06e.firebaseio.com",
        projectId: "trainschedules-1c06e",
        storageBucket: "",
        messagingSenderId: "785465134374"
    };
    firebase.initializeApp(config);
    var database = firebase.database();

    // add train to database
    $('#submit-train').on('click', function (e) {
        e.preventDefault();
        // send to database
        database.ref().push({
            trainName: $("#train-name").val().trim(),
            destination: $("#destination").val().trim(),
            firstTrainTime: moment([$("#first-train-time").val().trim()]).format('HH:mm'),
            frequency: $("#frequency").val().trim(),
        });
        // clear form
        $('#train-name').val('');
        $('#destination').val('');
        $('#first-train-time').val('');
        $('#frequency').val('');
    });


    // remove train from database
    $(document).on('click', '.remove-btn', function (e) {
        e.preventDefault();
        database.ref().child($(this).attr('data-id')).remove();
        $(`#row${$(this).attr('data-id')}`).remove();
    });


    database.ref().on('child_added', function (snap) {
        console.log(snap);
        console.log(snap.val());
        console.log(snap.ref_.key);
        // append data to table
        $('#train-table-body').append(`<tr id="row${snap.ref_.key}">`);
        $(`#row${snap.ref_.key}`).append(`<td id="name${snap.ref_.key}">${snap.val().trainName}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="destination${snap.ref_.key}">${snap.val().destination}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="frequency${snap.ref_.key}">${snap.val().frequency}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="nextArrival${snap.ref_.key}">${moment().add(calculateMinutesAway(), 'm').format('HH:mm A')}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="minutesAway${snap.ref_.key}">${calculateMinutesAway()}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="remove${snap.ref_.key}"><button class="btn remove-btn" data-id=${snap.ref_.key}">Remove</button></td>`)
        // update output once every second until minute changes, then update it once every minute
        var initialMinutesAway = calculateMinutesAway();
        var sInterval = setInterval(function () {
            updateTable();
            if (calculateMinutesAway() !== initialMinutesAway) {
                clearInterval(sInterval);
                setInterval(function () {
                    updateTable();
                }, 60000);
            }
        }, 1000);
        function calculateMinutesAway() {
            var firstTimeConverted = moment(snap.val().firstTrainTime, 'HH:mm').subtract(1, 'y');
            var timeDifference = moment().diff(moment(firstTimeConverted), "m");
            var remainder = timeDifference % snap.val().frequency;
            var minutesAway = snap.val().frequency - remainder;
            return minutesAway;
        }
        function updateTable() {
            $(`#name${snap.ref_.key}`).text(snap.val().trainName);
            $(`#destination${snap.ref_.key}`).text(snap.val().destination);
            $(`#frequency${snap.ref_.key}`).text(snap.val().frequency);
            $(`#nextArrival${snap.ref_.key}`).text(moment().add(calculateMinutesAway(), 'm').format('HH:mm A'));
            $(`#minutesAway${snap.ref_.key}`).text(calculateMinutesAway());
        }
    });

});