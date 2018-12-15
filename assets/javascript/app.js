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
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });

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
        // make text content editable
        $(`#name${$(this).attr('data-id')}`).attr('contenteditable', true);
        $(`#destination${$(this).attr('data-id')}`).attr('contenteditable', true);
        $(`#frequency${$(this).attr('data-id')}`).attr('contenteditable', true);
        $(this).attr('class', 'btn confirm-btn');
        $(this).text('Confirm');
        // clear timeout/interval so it doesn't update while you're trying to change the text
        clearTimeout(updateTimeout);
        clearInterval(updateInterval);
    });

    // confirm database edit
    $(document).on('click', '.confirm-btn', function (e) {
        e.preventDefault();
        // make fields no longer editable
        $(`#name${$(this).attr('data-id')}`).attr('contenteditable', false);
        $(`#destination${$(this).attr('data-id')}`).attr('contenteditable', false);
        $(`#frequency${$(this).attr('data-id')}`).attr('contenteditable', false);
        $(this).attr('class', 'btn edit-btn');
        $(this).text('Edit');
        // set database child's property values to match changed text content
        database.ref().child($(this).attr('data-id')).set({
            trainName: $(`#name${$(this).attr('data-id')}`).text(),
            destination: $(`#destination${$(this).attr('data-id')}`).text(),
            firstTrainTime: $(`#frequency${$(this).attr('data-id')}`).attr('data-firstTrainTime'),
            frequency: $(`#frequency${$(this).attr('data-id')}`).text(),
        });
        // update table and set interval back
        for (i = 0; i < trainArray.length; i++) {
            calculateMinutesAway(i);
            updateTable(i);
        }
        var t = (60 - moment().seconds()) * 1000;
        updateTimeout = setTimeout(() => {
            updateInterval = setInterval(() => {
                for (i = 0; i < trainArray.length; i++) {
                    calculateMinutesAway(i);
                    updateTable(i);
                }
            }, 60000);
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
        }, 60000);
    }, t);

    // when child is added to database
    database.ref().on('child_added', function (snap) {
        // push child data to array
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

    // when child on database is changed
    database.ref().on('child_changed', function (snap) {
        // change corresponding array element's data to match the changed child's
        var i = trainArray.findIndex(i => i.firebaseID === snap.ref_.key);
        trainArray[i] = {
            'firebaseID': snap.ref_.key,
            'trainName': snap.val().trainName,
            'destination': snap.val().destination,
            'firstTrainTime': snap.val().firstTrainTime,
            'frequency': snap.val().frequency,
        }
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