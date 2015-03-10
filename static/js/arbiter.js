/**
 * arbiter front-end core
 */
var ARBITER = (function (my, $) {

    var votes_to_win = 4;
    var sync_interval = 15000;  // 15 second update interval

    // Module exports
    var _exports = my._exports = my._exports || {};
    _exports.votes = {};
    var _seal = my._seal = my._seal || function () {
        delete my._exports;
        delete my._seal;
        delete my._unseal;
    };    
    var _unseal = my._unseal = my._unseal || function () {
        my._exports = _exports;
        my._seal = _seal;
        my._unseal = _unseal;
    };

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

    function Arbiter(socket) {
        this.socket = socket;
    }

    // Get all active votes
    Arbiter.prototype.sync = function () {
        (function sync_votes() {
            this.socket.emit('get-votes');
            setTimeout(sync_votes, sync_interval);
        })();
    };
    
    Arbiter.prototype.intake = function () {
        var self = this;

        // Display all votes
        this.socket.on('votes', function (res) {
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
                        if (parseInt(ans.votecount) >= votes_to_win) {
                            subtable += "<tr class='tally checked ans-" + ans.answer_id + "'>" +
                                "<td>" + ans.answer + "</td>" +
                                "<td>" + ans.votecount +
                                "<img src='/static/images/check.png' class='bounded' alt='Winner' /></td>" +
                                "</tr>";
                        } else {
                            subtable += "<tr class='tally ans-" + ans.answer_id + "'>" +
                                "<td>" + ans.answer + "</td>" +
                                "<td>" + ans.votecount + "</td>" +
                                "</tr>";
                        }
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
                            self.socket.emit('submit-vote', {
                                answer_id: ans.split('-').sort()[0],
                            });
                            $('#modal-dynamic').foundation('reveal', 'close');
                        });
                    });
                    $(this.childNodes).each(function () {
                        $(this).addClass('cast-vote');
                    });
                });
                _exports.votes = res;
            }
        });

        this.socket.on('vote-submitted', function (res) { self.sync(); });
        this.socket.on('question-submitted', function (res) { self.sync(); });

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
            var answers = '<ul class="plain flush-left" id="answer-list">' +
                '<li><input type="text" id="answer-1" class="possible-answer" value="Yes" required /></li>' +
                '<li><input type="text" id="answer-2" class="possible-answer" value="No" required /></li>' +
                '<li><input type="text" id="answer-3" class="possible-answer" value="Maybe" required /></li>' +
                '</ul>' +
                '<button class="button secondary tiny" id="less-options">-</button>&nbsp;' +
                '<button class="button secondary tiny" id="more-options">+</button>';
            var question = '<form action="#" method="POST" id="new-question-form">' +
                '<input type="text" id="question-text" name="question-text" class="input-xlarge"' +
                'placeholder="Enter your question here" required autofocus />' +
                '<h5>Possible answers:</h5><div class="row">' + answers + "</div>" +
                '<button type="submit" class="button small" id="submit-question-button">Submit</button>' +
                '</form>';
            modal_prompt(question, "h5", "Propose a question");
            $('#less-options').click(function (event) {
                var num_answers = $('#answer-list').children().length;
                if (num_answers > 1)
                    $('#answer-' + JSON.stringify(num_answers)).parent().remove();
                event.preventDefault();
            });
            $('#more-options').click(function (event) {
                var num_answers = parseInt($('#answer-list').children().length);
                $('<li />').append(
                    $('<input required />')
                        .addClass("possible-answer")
                        .val("")
                        .attr("type", "text")
                        .attr("id", "answer-" + JSON.stringify(num_answers + 1))
                        .attr("placeholder", "Enter answer here...")
                ).appendTo($('#answer-list'));
                event.preventDefault();
            });
            $('form#new-question-form').submit(function (event) {
                event.preventDefault();
                var answers = [];
                $('.possible-answer').each(function () {
                    answers.push(this.value);
                });
                self.socket.emit('submit-question', {
                    question_text: $('#question-text').val(),
                    answers: answers,
                });
                this.reset();
                $('#modal-dynamic').foundation('reveal', 'close');
            });
        });

        return self;
    };

    $(document).ready(function () {
        var socket_url, arbiter;
        socket_url = window.location.protocol + '//' + document.domain +
            ':' + location.port + '/socket.io/';
        socket = io.connect(socket_url);
        socket.on('connect', function () {
            arbiter = new Arbiter(socket);
            arbiter.intake().exhaust();
            if (login) {
                $('#splash').hide();
                $('#review-display').show();
                arbiter.sync();
            }                
        })
    });

    return _exports;

}(ARBITER || {}, jQuery));
