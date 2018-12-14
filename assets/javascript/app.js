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

    var trainArray = [];

    // add train to database
    $('#submit-train').on('click', function (e) {
        e.preventDefault();
        // send to database
        database.ref().push({
            trainName: $("#train-name").val().trim(),
            destination: $("#destination").val().trim(),
            firstTrainTime: $("#first-train-time").val().trim(),
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
        var i = trainArray.findIndex(i => i.firebaseID === $(this).attr('data-id'));
        trainArray.splice(i, 1);
        console.log(trainArray);
        $(`#row${$(this).attr('data-id')}`).remove();
    });

    // edit database
    $(document).on('click', '.edit-btn', function (e) {
        e.preventDefault();
        $(`#name${$(this).attr('data-id')}`).attr('contenteditable', true);
        $(`#destination${$(this).attr('data-id')}`).attr('contenteditable', true);
        $(`#frequency${$(this).attr('data-id')}`).attr('contenteditable', true);
        $(this).attr('class', 'btn confirm-btn');
        $(this).text('Confirm');
        clearTimeout(updateTimeout);
        clearInterval(updateInterval);
    });

    // confirm database edit
    $(document).on('click', '.confirm-btn', function (e) {
        e.preventDefault();
        $(`#name${$(this).attr('data-id')}`).attr('contenteditable', false);
        $(`#destination${$(this).attr('data-id')}`).attr('contenteditable', false);
        $(`#frequency${$(this).attr('data-id')}`).attr('contenteditable', false);
        $(this).attr('class', 'btn edit-btn');
        $(this).text('Edit');
        database.ref().child($(this).attr('data-id')).set({
            trainName: $(`#name${$(this).attr('data-id')}`).text(),
            destination: $(`#destination${$(this).attr('data-id')}`).text(),
            firstTrainTime: $(`#frequency${$(this).attr('data-id')}`).attr('data-firstTrainTime'),
            frequency: $(`#frequency${$(this).attr('data-id')}`).text(),
        });
        var i = trainArray.findIndex(i => i.firebaseID === $(this).attr('data-id'));
        trainArray[i].trainName = $(`#trainName${$(this).attr('data-id')}`).text();
        trainArray[i].destination = $(`#frequency${$(this).attr('data-id')}`).text();
        trainArray[i].frequency = $(`#frequency${$(this).attr('data-id')}`).text();
        var t = (60 - moment().seconds()) * 1000;
        var updateTimeout = setTimeout(() => {
            var updateInterval = setInterval(() => {
                for (i = 0; i < trainArray.length; i++) {
                    calculateMinutesAway(i);
                    updateTable(i);
                }
            }, 1000);
        }, t);
    });

    // update table at each minute mark
    var updateInterval;
    var t = (60 - moment().seconds()) * 1000;
    var updateTimeout = setTimeout(() => {
        updateInterval = setInterval(() => {
            for (i = 0; i < trainArray.length; i++) {
                calculateMinutesAway(i);
                updateTable(i);
            }
        }, 1000);
    }, t);

    /*
    can you turn this for loop into forEach?(while still passing i as parameter)
    */

    database.ref().on('child_added', function (snap) {
        trainArray.push({
            'firebaseID': snap.ref_.key,
            'trainName': snap.val().trainName,
            'destination': snap.val().destination,
            'firstTrainTime': snap.val().firstTrainTime,
            'frequency': snap.val().frequency,
        });
        console.log(trainArray);
        console.log(snap);
        console.log(snap.val());
        console.log(snap.ref_.key);
        var i = trainArray.findIndex(i => i.firebaseID === snap.ref_.key);
        console.log(i);
        // append data to table
        $('#train-table-body').append(`<tr id="row${snap.ref_.key}">`);
        $(`#row${snap.ref_.key}`).append(`<td id="name${snap.ref_.key}">${snap.val().trainName}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="destination${snap.ref_.key}">${snap.val().destination}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="frequency${snap.ref_.key}" 
            data-firstTrainTime="${snap.val().firstTrainTime}">${snap.val().frequency}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="nextArrival${snap.ref_.key}">
            ${moment().add(calculateMinutesAway(i), 'm').format('LT')}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="minutesAway${snap.ref_.key}">${calculateMinutesAway(i)}</td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="remove${snap.ref_.key}">
            <button class="btn remove-btn" data-id="${snap.ref_.key}">Remove</button></td>`);
        $(`#row${snap.ref_.key}`).append(`<td id="edit${snap.ref_.key}">
            <button class="btn edit-btn" data-id="${snap.ref_.key}">Edit</button></td>`);
        $(`#edit${snap.ref_.key}`).css({
            'min-width': `${116}px`,
            'display': 'flex',
            'justify-content': 'center',
        });
    });

    database.ref().on('child_changed', function (snap) {
        calculateMinutesAway(i);
        updateTable(i);
    });

    function calculateMinutesAway(i) {
        var firstTimeConverted = moment(trainArray[i].firstTrainTime, 'LT');
        var timeDifference = moment().diff(moment(firstTimeConverted), 'm');
        var remainder = timeDifference % trainArray[i].frequency;
        var minutesAway = trainArray[i].frequency - remainder;
        return minutesAway;
    }
    function updateTable(i) {
        $(`#name${trainArray[i].firebaseID}`).text(trainArray[i].trainName);
        $(`#destination${trainArray[i].firebaseID}`).text(trainArray[i].destination);
        $(`#frequency${trainArray[i].firebaseID}`).text(trainArray[i].frequency);
        $(`#nextArrival${trainArray[i].firebaseID}`).text(moment().add(calculateMinutesAway(i), 'm').format('LT'));
        $(`#minutesAway${trainArray[i].firebaseID}`).text(calculateMinutesAway(i));
    }

});