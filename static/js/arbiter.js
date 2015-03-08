(function ($) {
    function Arbiter() { }
    Arbiter.prototype.intake = function () {
        var self = this;

        // Display all votes
        socket.on('votes', function (res) {
            if (res && res.question_id) {
                var votetable = "<table>";
                votetable += "<tr><th>ID</th><th>Question</th><th>Answer</th><th>Votes</th></tr>";
                for (var i = 0, len = res.question_id.length; i < len; ++i) {
                    votetable += "<tr>";
                    votetable += "<td>" + res.question_id[i] + "</td>";
                    votetable += "<td>" + res.question[i] + "</td>";
                    votetable += "<td>" + res.answer[i] + "</td>";
                    votetable += "<td>" + res.votecount[i] + "</td>";
                    votetable += "</tr>";
                }
                votetable += "</table>";
                $('#review-display').html(votetable);
            }
        });

        return self;
    };
    Arbiter.prototype.exhaust = function () {
        var self = this;

        $('form#review-form').submit(function (event) {
            event.preventDefault();
            var reviewee = $('#reviewee').val();
            var data = {
                rating: $('#rating').val(),
                reviewee: reviewee,
                comments: $('#comment-text').val(),
                report_id: $('#report-id').val()
            }
            socket.emit('submit-review', data);
            $('#review-display').empty();
            $('#report-id').val("");
            $('#reviewee').val("");
            $('#rating').val("");
            $('#comment-text').val("");
            $('#review-entry').hide();
        });

        // Get all active votes
        socket.emit('get-votes');

        return self;
    };
    $(document).ready(function () {
        var socket_url, arbiter;
        socket_url = window.location.protocol + '//' + document.domain + ':' + location.port + '/socket.io/';
        window.socket = io.connect(socket_url);
        arbiter = new Arbiter();
        arbiter.intake().exhaust();
    });
})(jQuery);
