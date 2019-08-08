(typeof describe === 'function') && describe("human-tts", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('rest-bundle');
    const {
        HumanTts,
        SCAudio,
    } = require("../index");

    const BREAK='<break time="0.001s"/>';
    const SRC = path.join(__dirname, '..', 'src');

    function phoneme(ph, text) {
        return `<phoneme alphabet="ipa" ph="${ph}">${text}</phoneme>`+
            `${BREAK}`;
    }
    
    const TEST_SCAUDIO = new SCAudio();

    it("constructor", function() {
        // Default
        var humanTts = new HumanTts();
        should(humanTts).properties({
            language: 'pli',
            localeAlt: 'pli',
            voice: 'sujato_pli',
            audioFormat: 'mp3',
            audioSuffix: '.mp3',
            prosody: {
                rate: "0%", // can't change humans
            },
        });

        // Custom
        var humanTts = new HumanTts({
            language: 'pli',
            scAudio: TEST_SCAUDIO,
        });
        should(humanTts).properties({
            language: 'pli',
            localeAlt: 'pli',
            voice: 'sujato_pli',
            audioFormat: 'mp3',
            audioSuffix: '.mp3',
            scAudio: TEST_SCAUDIO,
            prosody: {
                rate: "0%", // can't change humans
            },
        });

    });
    it("signature(text) returns TTS synthesis signature", function() {
        var humanTts = new HumanTts();
        should(humanTts.language).equal('pli');
        var sig = humanTts.signature('hello world');
        var guid = humanTts.mj.hash(sig);
        should.deepEqual(sig, {
            api: 'human-tts',
            apiVersion: 'v1',
            audioFormat: 'mp3',
            voice: 'sujato_pli',
            language: 'pli',
            prosody: {
                rate: '0%',
            },
            text: 'hello world',
            guid,
        });
    });
    it("segmentSSML(text) returns SSML", function() {
        var humanTts = new HumanTts({
            language: 'pli',
            localeAlt: 'pli',
            stripQuotes: true,
        });
        should.deepEqual(humanTts.segmentSSML('281'),
            ['281']),
        should(humanTts.isNumber('281–309')).equal(true);
        should.deepEqual(humanTts.segmentSSML('281–​309'),
            ['281–309']);
        should.deepEqual(humanTts.segmentSSML('ye'), ['ye']);
        should.deepEqual(humanTts.segmentSSML('“Bhadante”ti'), ['Bhadante ti']);
        should.deepEqual(humanTts.segmentSSML('mūlaṃ'), ['mūlaṃ']);
    });
    it("synthesizeSSML(ssml) returns sound file", function(done) {
        this.timeout(3*1000);
        var noAudioPath = path.join(SRC, 'assets', 'no_audio.mp3');
        var humanTts = new HumanTts();
        var segments = [
            `<phoneme alphabet="ipa" ph="səˈpriːm"></phoneme>`,
            `full enlightenment, I say.`,
        ];
        var ssml = segments.join(' ');
        (async function() { try {
            var result = await humanTts.synthesizeSSML(ssml);
            should(result).properties(['file','signature','hits', 'misses']);
            should(result.file).equal(noAudioPath);
            done();
        } catch(e) {done(e);} })();
    });
})