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

    // initial train table data
    var trainCount = 0;
    var trainDataArr = [];
    console.log(trainDataArr);

    $('#submit-train').on('click', function (e) {
        e.preventDefault();
        // input
        var trainName = $('#train-name').val().trim();
        var destination = $('#destination').val().trim();
        var firstTrainTime = $('#first-train-time').val().trim();
        var frequency = $('#frequency').val().trim();

        // calculation variables
        var firstTimeConverted;
        var differenceInTime;
        var remainder;
        var minutesAway;
        var nextTrain;
        calculateTrainData(trainCount);
        var initialMinutesAway = minutesAway;

        // check for correct format
        if ((firstTrainTime.length === 5 && firstTrainTime.indexOf(":") === 2) ||
            (firstTrainTime.length === 4 && firstTrainTime.indexOf(":") === 1)) {
            // update output once every second until minutesAway changes, then update it once every minute
            setTrainInfo(trainCount);
            var secondInterval = setInterval(function () {
                updateTrainInfo(trainCount);
                console.log(`Initial minutes away: ${initialMinutesAway}`);
                console.log(`Current minutes away: ${minutesAway}`);
                if (initialMinutesAway !== minutesAway) {
                    clearInterval(secondInterval);
                    setInterval(function () {
                        updateTrainInfo(trainCount);
                        console.log(trainDataArr);
                    }, 60000);
                }
            }, 1000);
            // increment train count
            // trainCount++;
            // clear form
            $('#train-name').val('');
            $('#destination').val('');
            $('#first-train-time').val('');
            $('#frequency').val('');
        } else {
            alert(`Incorrect time format`);
        }

        /* Questions:
    
            If you use a setInterval function w/ a parameter that is a variable, and the value of the parameter
            changes between intervals, the setInterval starts using the new value?

            How do I make it keep using the old value?

            Put interval function inside train object and use "this" keyword?(this would fire every time it updates)

        */


        /* ---------------------------- Callback Functions ---------------------------- */
        function calculateTrainData() {
            firstTimeConverted = moment(firstTrainTime, 'HH:mm').subtract(1, 'y');
            differenceInTime = moment().diff(moment(firstTimeConverted), "m");
            remainder = differenceInTime % frequency;
            minutesAway = frequency - remainder;
            nextTrain = moment().add(minutesAway, "m");
        }

        function createTrainDataArr(i) {
            var secondInterval = setInterval(function () {
                updateTrainInfo(trainCount);
                console.log(`Initial minutes away: ${initialMinutesAway}`);
                console.log(`Current minutes away: ${minutesAway}`);
                if (initialMinutesAway !== minutesAway) {
                    clearInterval(secondInterval);
                    setInterval(function () {
                        updateTrainInfo(trainCount);
                        console.log(trainDataArr);
                    }, 60000);
                }
            }, 1000);
            trainDataArr[i] = JSON.parse(`{
                "trainName": "${trainName}",
                "destination": "${destination}",
                "frequency": "${frequency}",
                "firstTrainTime": "${firstTrainTime}",
                "nextTrain": "${nextTrain.format('h:mm A')}",
                "minutesAway": "${minutesAway}",
                "updateInterval": "${secondInterval}"
            }`);
        }

        function setTrainInfo(i) {
            calculateTrainData();
            createTrainDataArr(i);
            console.log(trainDataArr);
            // append train data to table
            $('#train-table-body').append(`<tr id='train-row-${i}'></tr>`)
            console.log(trainDataArr[i].frequency);
            $(`#train-row-${i}`).append(`
                <td id='trainName-${i}'>${trainDataArr[i].trainName}</td>
                <td id='destination-${i}'>${trainDataArr[i].destination}</td>
                <td id='frequency-${i}'>${Number(trainDataArr[i].frequency)}</td>
                <td id='nextTrain-${i}'>${trainDataArr[i].nextTrain}</td>
                <td id='minutesAway-${i}'>${trainDataArr[i].minutesAway}</td>
            `);
        }

        function updateTrainDataArr(i) {
            trainDataArr[i] = JSON.parse(`{
                "trainName": "${trainName}",
                "destination": "${destination}",
                "frequency": "${frequency}",
                "firstTrainTime": "${firstTrainTime}",
                "nextTrain": "${nextTrain.format('h:mm A')}",
                "minutesAway": "${minutesAway}"
            }`);
        }
    
        function updateTrainInfo(i) {
            calculateTrainData();
            updateTrainDataArr(i);
            // update train info on table
            $(`#trainName-${i}`).text(trainDataArr[i].trainName);
            $(`#destination-${i}`).text(trainDataArr[i].destination);
            $(`#frequency-${i}`).text(trainDataArr[i].frequency);
            $(`#nextTrain-${i}`).text(trainDataArr[i].nextTrain);
            $(`#minutesAway-${i}`).text(trainDataArr[i].minutesAway);
            console.log(trainDataArr[i].minutesAway);
            console.log(i)
            console.log("hello is this thing working?");
        }
    
        // function logOutput() {
        //     console.log(`Train Name: ${trainName}`);
        //     console.log(`Destination: ${destination}`);
        //     console.log(`First train time: ${firstTrainTime}`);
        //     console.log(`Frequency: ${Number(frequency)} mins`);
        //     console.log(`Next Arrival: ${nextTrain.format('h:mm A')}`);
        //     console.log(`Minutes Away: ${minutesAway}`);
        // }
    
        
    });

});