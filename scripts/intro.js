var Intro = new function()
{
    const ID_LOADING = "loadingSpinner";
    const ID_INTRO_AREA = "introArea";
    const ID_BUTTON_PLAY = "playButton";

    const m_IntroArea = document.getElementById(ID_INTRO_AREA);
    var m_CanLoad = 0;

    this.IsVisible = function()
    {
        return IsElementVisible(m_IntroArea);
    }

    let m_ButtonPlay = document.getElementById(ID_BUTTON_PLAY);
    m_ButtonPlay.disabled = true; //--- Force disable it even though it has HTML tag; some browsers (e.g., Android Firefox) ignore it for some reason

    //--- Show loading screen (hidden by default so it's not shown if JavaScript is disabled)
    SetElementVisible(document.getElementById(ID_LOADING), true);
    SetElementVisible(document.getElementById("play"), true);

    //--- End the loading only after intro animation (5s long) is finished
    //--- It's a fake to create an illusion that an elaborate game is being prepared (gam dev tricks 101)
    if (!Debug.IsManualLoad())
    {
        setTimeout(() => {
            m_CanLoad++
            Intro.OnLoadFinished();
        }, 6000);
    }

    this.OnLoadFinished = function()
    {
        if (m_CanLoad < 2)
            return;

        SetElementVisible(document.getElementById("playText"), true);
        SetElementVisible(document.getElementById("playFullscreen"), true);
        SetElementVisible(document.getElementById(ID_LOADING), false);

        let play = document.getElementById("playButton");
        play.disabled = false;
    }

    window.addEventListener("load", () =>
    {
        m_CanLoad++
        m_ButtonPlay.addEventListener("click", OnButtonPlay);

        if (Debug.IsManualLoad())
        {
            //--- Init manual hiding
            document.getElementById("play").addEventListener("click", OnDebugLoadFinished);
        }
        else
        {
            //--- Hide loading
            Intro.OnLoadFinished();
        }

        if (Debug.IsDev())
        {
            //--- Instantly skip the loading screen
            if (Debug.SkipIntro())
                OnButtonPlay();
        }

        function OnDebugLoadFinished()
        {
            m_CanLoad++
            Intro.OnLoadFinished();
        }

        function OnButtonPlay()
        {
            SetElementVisible(m_IntroArea, false);

            //--- Switch to fullscreen
            if (!Debug.SkipIntro())
            {
                Vibrate(VIBRATION_PLAY);

                let docElm = document.documentElement;
                if (docElm.requestFullscreen)
                    docElm.requestFullscreen();
                else if (docElm.mozRequestFullScreen)
                    docElm.mozRequestFullScreen();
                else if (docElm.webkitRequestFullScreen)
                    docElm.webkitRequestFullScreen();
                else if (docElm.msRequestFullscreen)
                    docElm.msRequestFullscreen();
            }

            window.dispatchEvent(new Event(EVENT_INTRO));

            if (!Debug.SkipIntro())
                PlayAudio("audioPlay");
        }
    });
}