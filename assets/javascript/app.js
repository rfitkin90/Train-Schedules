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

    var currentlyEditing = false;

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

    // edit database
    $(document).on('click', '.edit-btn', function (e) {
        e.preventDefault();
        if (currentlyEditing === false) {
            currentlyEditing = true;
            $(`#name${$(this).attr('data-id')}`).attr('contenteditable', true);
            $(`#destination${$(this).attr('data-id')}`).attr('contenteditable', true);
            $(`#frequency${$(this).attr('data-id')}`).attr('contenteditable', true);
            $(this).attr('class', 'btn confirm-btn');
            $(this).text('Confirm');
        }
    });

    // confirm database edit
    $(document).on('click', '.confirm-btn', function (e) {
        e.preventDefault();
        if (currentlyEditing === true) {
            currentlyEditing = false;
            $(`#name${$(this).attr('data-id')}`).attr('contenteditable', false);
            $(`#destination${$(this).attr('data-id')}`).attr('contenteditable', false);
            $(`#frequency${$(this).attr('data-id')}`).attr('contenteditable', false);
            $(this).attr('class', 'btn edit-btn');
            $(this).text('Edit');
            database.ref().child($(this).attr('data-id')).set({
                trainName: $(`#name${$(this).attr('data-id')}`).text(),
                destination: $(`#destination${$(this).attr('data-id')}`).text(),
                frequency: $(`#frequency${$(this).attr('data-id')}`).text(),
            });
        }
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
        $(`#row${snap.ref_.key}`).append(`<td id="nextArrival${snap.ref_.key}">
            ${moment().add(calculateMinutesAway(), 'm').format('LT')}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="minutesAway${snap.ref_.key}">${calculateMinutesAway()}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="remove${snap.ref_.key}">
            <button class="btn remove-btn" data-id="${snap.ref_.key}">Remove</button></td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="edit${snap.ref_.key}">
            <button class="btn edit-btn" data-id="${snap.ref_.key}">Edit</button></td>`);
        $(`#edit${snap.ref_.key}`).css({
            'min-width': `${116}px`,
            'display': 'flex',
            'justify-content': 'center',
        });
        // update output once every second until minute changes, then update it once every minute
        var initialMinutesAway = calculateMinutesAway();
        var sInterval = setInterval(function () {
            if (currentlyEditing === true) {
                clearInterval(sInterval);
            } else {
                updateTable();
                if (calculateMinutesAway() !== initialMinutesAway) {
                    clearInterval(sInterval);
                    var mInterval = setInterval(function () {
                        if (currentlyEditing === true) {
                            clearInterval(mInterval);
                        } else {
                            updateTable();
                        }
                    }, 60000);
                }
            }
        }, 1000);
        function calculateMinutesAway() {
            var firstTimeConverted = moment(snap.val().firstTrainTime, 'LT');
            var timeDifference = moment().diff(moment(firstTimeConverted), 'm');
            var remainder = timeDifference % snap.val().frequency;
            var minutesAway = snap.val().frequency - remainder;
            return minutesAway;
        }
        function updateTable() {
            $(`#name${snap.ref_.key}`).text(snap.val().trainName);
            $(`#destination${snap.ref_.key}`).text(snap.val().destination);
            $(`#frequency${snap.ref_.key}`).text(snap.val().frequency);
            $(`#nextArrival${snap.ref_.key}`).text(moment().add(calculateMinutesAway(), 'm').format('LT'));
            $(`#minutesAway${snap.ref_.key}`).text(calculateMinutesAway());
        }
    });

    database.ref().on('child_changed', function (snap) {
        // update output once every second until minute changes, then update it once every minute
        console.log(snap.ref_.key);
        var initialMinutesAway = calculateMinutesAway();
        var sInterval = setInterval(function () {
            if (currentlyEditing === true) {
                clearInterval(sInterval);
            } else {
                updateTable();
                if (calculateMinutesAway() !== initialMinutesAway) {
                    clearInterval(sInterval);
                    var mInterval = setInterval(function () {
                        if (currentlyEditing === true) {
                            clearInterval(mInterval);
                        } else {
                            updateTable();
                        }
                    }, 60000);
                }
            }
        }, 1000);
        function calculateMinutesAway() {
            var firstTimeConverted = moment(snap.val().firstTrainTime, 'HH:mm');
            console.log(firstTimeConverted);
            var timeDifference = moment().diff(moment(firstTimeConverted), 'm');
            console.log(timeDifference);
            var remainder = timeDifference % snap.val().frequency;
            var minutesAway = snap.val().frequency - remainder;
            console.log(minutesAway);
            return minutesAway;
        }
        function updateTable() {
            $(`#name${snap.ref_.key}`).text(snap.val().trainName);
            $(`#destination${snap.ref_.key}`).text(snap.val().destination);
            $(`#frequency${snap.ref_.key}`).text(snap.val().frequency);
            $(`#nextArrival${snap.ref_.key}`).text(moment().add(calculateMinutesAway(), 'm').format('LT'));
            $(`#minutesAway${snap.ref_.key}`).text(calculateMinutesAway());
        }
    });

});