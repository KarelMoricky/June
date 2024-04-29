var Sound = new function()
{
    this.Play = function(name)
    {
        //--- https://www.w3schools.com/JSREF/dom_obj_audio.asp
        let audio = document.getElementById(name);
        if (audio)
        {    
            audio.currentTime = 0;
            audio.muted = false;
            audio.play();

            return audio;
        }
        else
        {
            console.error(`Sound.Play(): Audio ${name} not found!`);
            return null;
        }
    }

    this.Timeline = function(audio, timeline, step = 10)
    {
        //--- Save indexes of timeline entries
        let indexes = [];
        for (let i = 0; i < timeline.length; i++)
        {
            indexes.push(i);

            //--- Entry's time is beyond sound's duration - cap it at the duration, so it gets played at the end
            if (timeline[i].time >= audio.duration)
            {
                //console.warn(`Sound.Timeline(): Event for ${audio.id} has time ${timeline[i].time} s, but audio duration is only ${audio.duration} s!`);
                timeline[i].time = audio.duration - 0.01;
            }
        }
    
        var backupTime = -1;
        function Tick()
        {
            //Debug.Log(audio.paused, audio.ended, audio.currentTime, audio.duration, audio.networkState, audio.readyState, backupTime);

            //--- On iOS, the audio is sometimes ready to play, but stuck. Reload it in such case.
            if ((audio.paused || audio.ended) && audio.readyState == 4 && backupTime == -1 && audio.currentTime < 1)
            {
                audio.play();
            }
    
            var currentTime = audio.currentTime;
            if (backupTime != -1)
                currentTime = backupTime;
    
            //--- Process entries
            for (let i = indexes.length - 1; i >= 0; i--)
            {
                const entry = timeline[indexes[i]];
                if (currentTime > entry.time)
                {
                    entry.function(currentTime);
                    indexes.splice(i, 1);
                }
            }
    
            //--- Tick again
            if (
                    (currentTime < audio.duration && indexes.length > 0) //--- Audio is playing and there are entries remaining
                    || currentTime == 0 //--- First frame (in case something goes wrong)
                    || (audio.readyState != 4 && audio.networkState != 1) //--- Waiting for the audio to load
            )
            {
                setTimeout(Tick, step);

                if (backupTime != -1)
                    backupTime += step / 1000;
            }
        }
        Tick();

        //--- If the audio does not load within 1s, use backup time
        setTimeout(Backup, 1000);
        function Backup()
        {
            if (audio.currentTime < 0.1)
            {
                backupTime = 0;
                audio.muted = true;
                audio.pause();
            }
        }
    }

    //--- Preload sounds (https://remysharp.com/2010/12/23/audio-sprites)
    window.addEventListener(EVENT_GAME_DRAG_START, OnInteract);
    function OnInteract()
    {
        var children = document.getElementById("audio").children;
        for (var i = 0; i < children.length; i++) 
        {
            var audio = children[i];
            if (audio.getAttribute("noScriptPreload"))
                continue;

            //--- Pause right it starts playing, but keep it in the memory
            audio.addEventListener("play", OnPlay, false);
            function OnPlay(ev)
            {
                ev.target.pause();
                ev.target.removeEventListener("play", OnPlay, false);
            }
            
            //--- Play
            audio.muted = true;
            audio.play();
        }
        window.removeEventListener(EVENT_GAME_DRAG_START, OnInteract);
    };
}