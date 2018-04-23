var SpeechRenderer = function(maze) {
    this.maze = maze;
    maze.addEventObserver(this);

    this.synth = window.speechSynthesis;
    var v = this.synth.getVoices()[7]
    this.utterThis = new SpeechSynthesisUtterance("Empty text");
    this.utterThis.voice = this.synth.getVoices()[7];
}

SpeechRenderer.prototype = {
    notify : function(data, event_type) {
        switch (event_type) {
            case "prize_added" : this.on_prize(data); break;
            case "prize_acquired" : this.on_prize_acquired(data.player, data.prize); break;
            case "player_gobbled" : this.on_player_gobbled(data.player); break;
        }
    },

    on_player_gobbled : function(player) {
        var messages = [
            ["Ha ha. " + player.name + " almost escaped the ghost"],
            ["Yum yum. " + player.name + " is dead"],
            ["Looks like " + player.name + " just met his maker"],
            ["Play the violin for " + player.name],
            ["Dead. dead. dead. " + player.name + " is dead"],
            [player.name + ", the moment you set foot in the maze you were doomed"],
            [player.name + ", you just died - go cry in a pillow"],
            [player.name + " just kicked the bucket."],
            [player.name + " took a dirt nap."],
            [player.name + " is feeding the worms"],
            [player.name + " just lost his head."],
            [player.name + " just got squelched by a ghost"],
            [player.name + " just got bashed by a ghost."],
            [player.name + " just got mauled by a ghost."],
            [player.name + " just got the kiss of death."],
            [player.name + " just had a fatal disagreement with a ghost."],
            ["Send regards in the next world " + player.name],
            [player.name + " just suffered a painful death."],
            [player.name + " perhaps you should take up stamp collecting"],
            [player.name + " go play with your dolls."],
        ]
        num = Math.round(Math.random() * (messages.length - 1));
        this.speak(messages[num])
    },

    on_prize_acquired : function(player, prize) {
        this.speak(player.name + " found the " + prize.class_);
    },

    on_prize : function(prize) {
        this.speak("A " + prize.class_ + " placed in the maze");
    },

    speak : function(text) {
        this.utterThis.text = text;
        this.utterThis.voice = this.synth.getVoices()[7];
        this.synth.speak(this.utterThis);
    }
}

