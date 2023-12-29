const ID_PAUSE_OBJECT = "pauseObject";
const ID_PAUSE = "pause";

var m_Pause;
var m_IsPaused = false;

window.addEventListener("load", OnLoadPause);
function OnLoadPause()
{
    let object = document.getElementById(ID_PAUSE_OBJECT);
    let svgDoc = object.contentDocument;
    if (!svgDoc)
	{
		alert("Error when loading Pause SVG!");
		return;
    }

    let pauseElement = svgDoc.getElementById(ID_PAUSE);
    pauseElement.addEventListener("click", OnClick);

    document.addEventListener("fullscreenchange", OnFullScreenChange);
    OnFullScreenChange();

    function OnClick()
    {
        if (m_IsPaused)
        {
            ToggleFullscreen();
            return;
        }
    }

    function OnFullScreenChange()
    {
        m_IsPaused = !Debug.IsDev() && !IsFullScreen();
        if (m_IsPaused)
        {
            pauseElement.setAttribute("visibility", "visible");
            object.style.pointerEvents = "auto";
        }
        else
        {
            pauseElement.setAttribute("visibility", "hidden");
            object.style.pointerEvents = "none";
        }
    }
    
    //--- https://stackoverflow.com/questions/36672561/how-to-exit-fullscreen-onclick-using-javascript
    function ToggleFullscreen()
    {
        if (!IsFullScreen())
        {
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
        else
        {
            if (document.exitFullscreen)
                document.exitFullscreen();
            else if (document.webkitExitFullscreen)
                document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
            else if (document.msExitFullscreen)
                document.msExitFullscreen();
        }
    }

    function IsFullScreen()
    {
        return (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement && document.msFullscreenElement !== null);
    }
}
