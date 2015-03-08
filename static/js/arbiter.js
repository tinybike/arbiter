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
                    for (var j = 0, jlen = res[i].choices; j < jlen; ++j) {
                        ans = res[i].answers[j];
                        subtable += "<tr class='tally ans-" + ans.answer_id + "'>" +
                            "<td>" + ans.answer + "</td>" +
                            "<td>" + ans.votecount + "</td>" +
                            "</tr>";
                    }
                    subtable += "</table></td>";
                    votetable += subtable + "</tr>";
                }
                votetable += "</table>";
                $('#review-display').html(votetable);
                $('.tally').each(function () {
                    var tally = this;
                    $(this).click(function (event) {
                        event.preventDefault();
                        var prompt = '<hr /><div class="row centered">' +
                                     '<form action="#" method="POST" id="cast-vote-form">' +
                                     tally.firstElementChild.textContent +
                                     '<hr />' +
                                     '<button type="submit" class="button expand" '+
                                     'id="submit-vote-button">Vote!</button>' +
                                     '</form></div>';
                        modal_prompt(prompt, "h2", "Casting vote for...");
                        $('#cast-vote-form').submit(function (event) {
                            event.preventDefault();
                            var ans = $(tally).attr('class').split(' ').sort()[0];
                            socket.emit('submit-vote', {
                                answer_id: ans.split('-').sort()[0],
                            });
                            $('#modal-dynamic').foundation('reveal', 'close');
                        });
                    });
                    $(this.childNodes).each(function () {
                        $(this).addClass('cast-vote');
                    });
                });
            }
        });

        socket.on('vote-submitted', function (res) {
            socket.emit('get-votes');
        });

        socket.on('question-submitted', function (res) {
            socket.emit('get-votes');
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

        // Submit a new question for voting
        $('#new-question').click(function (event) {
            event.preventDefault();
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
                var answers = [];
                $('.possible-answer').each(function () {
                    answers.push(this.value);
                });
                socket.emit('submit-question', {
                    question_text: $('#question-text').val(),
                    answers: answers,
                });
                this.reset();
                $('#modal-dynamic').foundation('reveal', 'close');
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
