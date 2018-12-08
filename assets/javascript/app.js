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

    var trainsBeingMonitored = 0;
    var trainDataArr = [];

    $('#submit-train').on('click', function (e) {
        e.preventDefault();
        // input
        var trainName = $('#train-name').val().trim();
        var destination = $('#destination').val().trim();
        var firstTrainTime = $('#first-train-time').val().trim();
        var frequency = $('#frequency').val().trim();

        // calculations
        var firstTimeConverted = moment(firstTrainTime, 'HH:mm').subtract(1, 'y');
        var differenceInTime = moment().diff(moment(firstTimeConverted), "m");
        var remainder = differenceInTime % frequency;
        var minutesAway = frequency - remainder;
        var initialMinutesAway = minutesAway;
        var nextTrain = moment().add(minutesAway, "m");

        // check for correct format
        if ((firstTrainTime.length === 5 && firstTrainTime.indexOf(":") === 2) ||
            (firstTrainTime.length === 4 && firstTrainTime.indexOf(":") === 1)) {
            // increment train count
            // update output once every second until minutesAway changes, then update it once every minute
            outputTrainInfo(trainsBeingMonitored);
            var secondInterval = setInterval(function () {
                outputTrainInfo();
                console.log(`initial: ${initialMinutesAway}`);
                console.log(`current: ${minutesAway}`);
                if (initialMinutesAway !== minutesAway) {
                    clearInterval(secondInterval);
                    setInterval(function () {
                        outputTrainInfo();
                    }, 60000);
                }
            }, 1000);
            trainsBeingMonitored++;
            // clear form
            $('#train-name').val('');
            $('#destination').val('');
            $('#first-train-time').val('');
            $('#frequency').val('');
        } else {
            alert(`Incorrect time format`);
        }

        function outputTrainInfo(i) {
            // calculations
            firstTimeConverted = moment(firstTrainTime, 'HH:mm').subtract(1, 'y');
            differenceInTime = moment().diff(moment(firstTimeConverted), "m");
            remainder = differenceInTime % frequency;
            minutesAway = frequency - remainder;
            nextTrain = moment().add(minutesAway, "m");
            // output
            console.log(`Train Name: ${trainName}`);
            console.log(`Destination: ${destination}`);
            console.log(`First train time: ${firstTrainTime}`);
            console.log(`Frequency: ${Number(frequency)} mins`);
            console.log(`Next Arrival: ${nextTrain.format('h:mm A')}`);
            console.log(`Minutes Away: ${minutesAway}`);
            // push train data to object in array
            trainDataArr[i] = JSON.parse(`{
                "trainName": "${trainName}",
                "destination": "${destination}",
                "firstTrainTime": "${firstTrainTime}",
                "nextArrival": "${nextTrain.format('h:mm A')}",
                "minutesAway": "${minutesAway}"
            }`);
            
            console.log(trainDataArr);
            // add train info to database
            // database.ref().set({

            // });
        }

    });


});