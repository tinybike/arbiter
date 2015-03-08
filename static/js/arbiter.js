(function ($) {

    // Create modal alert windows (using Foundation reveal)
    function modal_alert(bodytext, bodytag, headertext) {
        var modal_body;
        if (headertext) {
            $('#modal-header').empty().text(headertext);
        }
        if (bodytext) {
            modal_body = (bodytag) ? $('<' + bodytag + ' />') : $('<p />');
            $('#modal-body').empty().append(
                modal_body.addClass('modal-error-text').text(bodytext)
            );
        }
        $('#modal-ok-box').show();
        $('#modal-dynamic').foundation('reveal', 'open');
    }
    function modal_prompt(prompt, bodytag, headertext) {
        var modal_body;
        if (headertext) {
            $('#modal-header').empty().html(headertext);
        }
        if (prompt) {
            modal_body = (bodytag) ? $('<' + bodytag + ' />') : $('<p />');
            $('#modal-body').empty().append(
                modal_body
                    .addClass('modal-error-text')
                    .append(prompt)
            );
        }
        $('#modal-dynamic').foundation('reveal', 'open');
    }

    function Arbiter() { }
    
    Arbiter.prototype.intake = function () {
        var self = this;

        // Display all votes
        socket.on('votes', function (res) {
            var votetable, subtable, ans;
            if (res && res.length) {
                votetable = "<table>";
                for (var i = 0, len = res.length; i < len; ++i) {
                    votetable += "<tr>" +
                        "<td>" + res[i].question_id + ". " + res[i].question + "</td>";
                    subtable = "<td><table>";
                    if (i == 0)
                        subtable += "<tr><th>Answer</th><th>Votes</th></tr>";
                    for (var j = 0, len = res[i].choices; j < len; ++j) {
                        ans = res[i].answers[j];
                        subtable += "<tr>" +
                            "<td>" + ans.answer + "</td>" +
                            "<td>" + ans.votecount + "</td>" +
                            "</tr>";
                    }
                    subtable += "</table></td>";
                    votetable += subtable + "</tr>";
                }
                votetable += "</table>";
                $('#review-display').html(votetable);
            }
        });

        return self;
    };

    Arbiter.prototype.exhaust = function () {
        var self = this;

        $('#modal-ok-button').click(function (event) {
            event.preventDefault();
            $('#modal-ok-box').hide();
            $('#modal-dynamic').foundation('reveal', 'close');
        });

        $('#new-question').click(function (event) {
            event.preventDefault();
            // var answers = '<select>' +
            //     '<option value="true">Yes</option>' +
            //     '<option value="false">No</option>' +
            //     '<option value="abstain">Abstain</option>' +
            //     '</select>';
            var answers = '<ul style="list-style-type:none;margin-left:0">' +
                '<li><input type="text" id="answer-1" class="possible-answer" value="Yes" required /></li>' +
                '<li><input type="text" id="answer-2" class="possible-answer" value="No" required /></li>' +
                '<li><input type="text" id="answer-3" class="possible-answer" value="Maybe" /></li>' +
                '</ul>';
            var question = '<form action="#" method="POST" id="new-question-form">' +
                '<input type="text" id="question-text" name="question-text" class="input-xlarge"' +
                'placeholder="Enter your question here" required autofocus />' +
                '<h5>Possible answers:</h5><div class="row">' + answers + "</div>" +
                '<button type="submit" class="button small" id="submit-question-button">Submit</button>' +
                '</form>';
            modal_prompt(question, "h5", "Propose a question");
            $('form#new-question-form').submit(function (event) {
                event.preventDefault();
                socket.emit('submit-question', {
                    question_text: $('#question-text').val(),
                });
                $('#question-text').val("");
            });
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
