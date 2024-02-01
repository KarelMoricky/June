var Intro = new function()
{
    const ID_LOADING = "loading";
    const ID_INTRO_AREA = "introArea";
    const ID_BUTTON_PLAY = "playButton";

    const m_IntroArea = document.getElementById(ID_INTRO_AREA);

    this.IsVisible = function()
    {
        return IsElementVisible(m_IntroArea);
    }

    let m_ButtonPlay = document.getElementById(ID_BUTTON_PLAY);
    m_ButtonPlay.disabled = true; //--- Force disable it even though it has HTML tag; some browsers (e.g., Android Firefox) ignore it for some reason

    //--- Show loading screen (hidden by default so it's not shown if JavaScript is disabled)
    SetElementVisible(document.getElementById(ID_LOADING), true);
    SetElementVisible(document.getElementById("play"), true);

    window.addEventListener("load", OnLoadIntroBox);
    function OnLoadIntroBox()
    {
        m_ButtonPlay.addEventListener("click", OnButtonPlay);

        if (Debug.IsManualLoad())
        {
            //--- Init manual hiding
            let loading = document.getElementById(ID_LOADING);
            loading.addEventListener("click", OnLoadFinished);
        }
        else
        {
            //--- Hide loading
            OnLoadFinished();
        }

        if (Debug.IsDev())
        {
            //--- Instantly skip the loading screen
            if (Debug.SkipIntro())
                OnButtonPlay();
        }

        function OnLoadFinished()
        {
            SetElementVisible(document.getElementById("playText"), true);
            SetElementVisible(document.getElementById(ID_LOADING), false);

            let play = document.getElementById("playButton");
            play.disabled = false;
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

            let ev = new CustomEvent(EVENT_PAUSE,{detail: {
                isPaused: false
            }});
            window.dispatchEvent(ev);
        }
    }
}