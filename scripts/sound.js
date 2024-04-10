var Sound = new function()
{
    let m_LoadAudioOnPlay = false;

    this.Play = function(name)
    {
        //--- https://www.w3schools.com/JSREF/dom_obj_audio.asp
        let audio = document.getElementById(name);
        if (audio)
        {
            //--- Some audio failed to load previously, force loading all sounds just in case now
            if (m_LoadAudioOnPlay)
                audio.load();
    
            audio.currentTime = 0;
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
            if (timeline[i].time >= audio.duration)
                console.warn(`Sound.Timeline(): Event has time ${timeline[i].time} s, but audio duration is only ${audio.duration} s!`);
        }
    
        //var backupTime = 0;
        function Tick()
        {
            //--- On iOS, the audio is sometimes ready to play, but stuck. Reload it in such case.
            if ((audio.paused || audio.ended) && audio.readyState == 4)
            {
                audio.load();
                audio.play();
                m_LoadAudioOnPlay = true;
            }
    
            var currentTime = audio.currentTime;
            /*
            if (backupTime != 0)
                currentTime = backupTime;
            */
    
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
                /*
                //--- Audio loaded, but failed to play - inititate backup time tracking
                if (audio.paused && audio.readyState == 4)
                    backupTime += step / 1000;
                */
            }
        }
        Tick();
    }
}