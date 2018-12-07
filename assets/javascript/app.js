$(document).ready(function () {
    var firstTrainTime = "00:00";

    $('#submit-train').on('click', function (e) {
        e.preventDefault();
        console.log($('#train-name').val().trim());
        console.log($('#destination').val().trim());
        firstTrainTime = $('#first-train-time').val().trim();
        // var frequency = Number($('#frequency').val().trim());
        if ((firstTrainTime.length === 5 && firstTrainTime.indexOf(":") === 2) ||
            (firstTrainTime.length === 4 && firstTrainTime.indexOf(":") === 1)) {
            console.log(firstTrainTime);
        } else {
            alert(`Incorrect 'First Train Time' time format`);
        }
        // console.log(frequency);

        var firstTimeConverted = moment(firstTrainTime, "HH:mm").subtract(1, "years");
            var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
            var frequency = Number($('#frequency').val().trim());
            var tRemainder = (this.diffTime % this.frequency);
            var tMinutesTillTrain = (this.frequency - this.tRemainder);
            var nextTrain = moment().add(this.tMinutesTillTrain, "minutes");
        console.log(typeof frequency);
        console.log(frequency);
        console.log(firstTimeConverted);
        console.log(diffTime);
        
        // Current Time
        console.log("CURRENT TIME: " + moment().format("hh:mm"));
        // Difference between the times
        console.log("DIFFERENCE IN TIME: " + diffTime);
        // train frequency
        console.log(frequency);
        // Time apart (remainder)
        console.log(typeof tRemainder);
        console.log(Number(tRemainder));
        // Minute Until Train
        console.log(typeof tMinutesTillTrain);
        console.log("MINUTES TILL TRAIN: " + Number(tMinutesTillTrain));
        // Next Train
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

        setInterval(function () {
            console.log(firstTimeConverted);
            // Current Time
            console.log("CURRENT TIME: " + moment().format("hh:mm"));
            // Difference between the times
            console.log("DIFFERENCE IN TIME: " + diffTime);
            // train frequency
            console.log(frequency);
            // Time apart (remainder)
            console.log(Number(tRemainder));
            // Minute Until Train
            console.log("MINUTES TILL TRAIN: " + Number(tMinutesTillTrain));
            // Next Train
            console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));
        }, 60000);
    });

});